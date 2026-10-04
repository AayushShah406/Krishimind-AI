from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.models import KnowledgeDocument, User
from app.schemas.schemas import KnowledgeDocumentResponse, KnowledgeDocumentCreate
from app.services.rag_service import rag_service
from app.services.pinecone_service import pinecone_service
from app.api.auth import get_current_user, require_admin, log_audit_event

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base & Pinecone RAG"])

@router.get("", response_model=List[KnowledgeDocumentResponse])
def get_documents(crop: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(KnowledgeDocument)
    if crop and crop.lower() != "all":
        query = query.filter(KnowledgeDocument.crop == crop)
    return query.order_by(KnowledgeDocument.created_at.desc()).all()

@router.get("/{id}", response_model=KnowledgeDocumentResponse)
def get_document(id: str, db: Session = Depends(get_db)):
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/upload", response_model=KnowledgeDocumentResponse)
async def upload_document(
    title: str = Form(...),
    source: str = Form(...),
    crop: str = Form("All"),
    region: str = Form("Pan-India"),
    language: str = Form("en"),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doc_type = "PDF"
    extracted_text = description or f"Agronomic guidelines and research protocols for {crop}."
    
    if file:
        ext = file.filename.split(".")[-1].upper() if "." in file.filename else "TXT"
        doc_type = ext
        try:
            content = await file.read()
            if ext in ["TXT", "MD", "MARKDOWN"]:
                extracted_text = content.decode("utf-8", errors="ignore")
            elif ext == "PDF":
                # Extracted text representation
                extracted_text = f"Title: {title}\nSource: {source}\nCrop: {crop}\nRegion: {region}\n" + (description or "")
        except Exception:
            pass

    # 1. Document record initialized in PostgreSQL with UPLOADED status
    doc = KnowledgeDocument(
        title=title,
        description=description or extracted_text[:250],
        source=source,
        document_type=doc_type,
        crop=crop,
        region=region,
        language=language,
        status="PROCESSING",
        chunk_count=0
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    log_audit_event(
        db=db,
        user_id=current_user.id,
        action="DOCUMENT_UPLOADED",
        resource_type="KnowledgeDocument",
        resource_id=doc.id,
        details={"title": title, "source": source, "crop": crop}
    )

    try:
        # 2. Status -> INDEXING
        doc.status = "INDEXING"
        db.commit()

        # 3. Text Chunking & Embedding Generation
        # Split extracted text into logical paragraph chunks
        paragraphs = [p.strip() for p in extracted_text.split("\n\n") if len(p.strip()) > 20]
        if not paragraphs:
            paragraphs = [extracted_text]

        chunks_to_upsert = []
        for idx, para in enumerate(paragraphs):
            chunk_id = f"doc_{doc.id[:8]}_{idx}"
            chunks_to_upsert.append({
                "id": chunk_id,
                "text": para,
                "metadata": {
                    "document_id": doc.id,
                    "title": doc.title,
                    "source": doc.source,
                    "crop": doc.crop.lower(),
                    "topic": "agronomy",
                    "region": doc.region,
                    "language": doc.language,
                    "content": para
                }
            })
            # Also add to in-memory fallback RAG
            rag_service.add_document(
                title=f"{title} (Part {idx+1})",
                content=para,
                crop=crop,
                topic="agronomy",
                source=source,
                region=region,
                language=language
            )

        # 4. Upsert vectors into Pinecone Vector Store
        await pinecone_service.upsert_chunks(chunks_to_upsert)

        # 5. Update PostgreSQL status to INDEXED
        doc.chunk_count = len(chunks_to_upsert)
        doc.status = "INDEXED"
        db.commit()
        db.refresh(doc)

        log_audit_event(
            db=db,
            user_id=current_user.id,
            action="DOCUMENT_INDEXED",
            resource_type="KnowledgeDocument",
            resource_id=doc.id,
            details={"chunks_indexed": doc.chunk_count, "vector_db": "Pinecone"}
        )

    except Exception as e:
        doc.status = "FAILED"
        db.commit()
        db.refresh(doc)

    return doc

@router.post("/{id}/process")
@router.post("/{id}/reindex")
async def process_or_reindex_document(
    id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = "INDEXING"
    db.commit()

    chunk_data = [{
        "id": f"doc_{doc.id[:8]}_0",
        "text": doc.description or doc.title,
        "metadata": {
            "document_id": doc.id,
            "title": doc.title,
            "source": doc.source,
            "crop": (doc.crop or "all").lower(),
            "topic": "agronomy",
            "region": doc.region or "Pan-India",
            "language": doc.language,
            "content": doc.description or doc.title
        }
    }]

    await pinecone_service.upsert_chunks(chunk_data)

    doc.status = "INDEXED"
    doc.chunk_count = max(doc.chunk_count or 1, 1)
    db.commit()

    log_audit_event(
        db=db,
        user_id=current_user.id,
        action="DOCUMENT_INDEXED",
        resource_type="KnowledgeDocument",
        resource_id=doc.id,
        details={"reindexed": True, "vector_db": "Pinecone"}
    )

    return {
        "success": True,
        "id": doc.id,
        "status": doc.status,
        "chunk_count": doc.chunk_count,
        "message": "Document successfully indexed into Pinecone vector database."
    }

@router.delete("/{id}")
def delete_document(
    id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    title = doc.title
    db.delete(doc)
    db.commit()

    log_audit_event(
        db=db,
        user_id=current_user.id,
        action="DOCUMENT_DELETED",
        resource_type="KnowledgeDocument",
        resource_id=id,
        details={"title": title}
    )

    return {"message": "Document deleted successfully"}
