from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.models import AIConversation, AIMessage, AIRecommendation, User, Field, Crop
from app.schemas.schemas import AIAskRequest, AIStructuredResponse, AIConversationResponse, AIRecommendationResponse
from app.api.auth import get_current_user
from app.services.agent_service import AgriculturalAgent
from app.services.ai_service import ai_service
from app.services.language_service import language_service
from app.services.pinecone_service import pinecone_service

router = APIRouter(prefix="/ai", tags=["AI Advisor"])

@router.post("/ask", response_model=AIStructuredResponse)
async def ask_ai_advisor(
    request: AIAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Resolve language
    target_lang = language_service.resolve_language(request.language, current_user.preferred_language)

    # 2. Agent tool calls & context assembly
    agent = AgriculturalAgent(db)
    context = await agent.assemble_context(
        question=request.question,
        field_id=request.field_id,
        farm_id=request.farm_id
    )

    # 3. Gemini reasoning and structured response generation
    response = await ai_service.reason_and_recommend(
        question=request.question,
        context=context,
        language=target_lang
    )

    # 4. Persist conversation and messages in PostgreSQL/SQLite
    conv = AIConversation(
        user_id=current_user.id,
        field_id=request.field_id,
        question=request.question,
        answer=response.recommendation,
        language=target_lang,
        confidence=response.confidence
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    user_msg = AIMessage(
        conversation_id=conv.id,
        role="user",
        content=request.question,
        language=target_lang
    )
    assistant_msg = AIMessage(
        conversation_id=conv.id,
        role="assistant",
        content=response.recommendation,
        language=target_lang
    )
    db.add_all([user_msg, assistant_msg])

    # 5. Persist recommendation if field_id is present
    if request.field_id:
        rec = AIRecommendation(
            field_id=request.field_id,
            type="Decision Support",
            recommendation=response.recommendation,
            reason=response.reason,
            confidence=response.confidence,
            evidence=response.evidence,
            data_used=response.data_used,
            next_action=response.next_action,
            warnings=response.warnings,
            language=target_lang
        )
        db.add(rec)

    db.commit()

    # 6. Store conversation vector embedding in Pinecone Vector Database
    try:
        crop_name = (context.get("crop") or {}).get("name", "general")
        await pinecone_service.upsert_conversation(
            conversation_id=conv.id,
            user_id=current_user.id,
            question=request.question,
            answer=response.recommendation,
            crop=crop_name,
            language=target_lang
        )
    except Exception as e:
        print(f"[Pinecone Vector Store Warning] {e}")

    return response

@router.get("/conversations", response_model=List[AIConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    convs = db.query(AIConversation).filter(AIConversation.user_id == current_user.id).order_by(AIConversation.created_at.desc()).all()
    return [AIConversationResponse.model_validate(c) for c in convs]

@router.get("/recommendations", response_model=List[AIRecommendationResponse])
def get_recommendations(
    field_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AIRecommendation)
    if field_id:
        query = query.filter(AIRecommendation.field_id == field_id)
    recs = query.order_by(AIRecommendation.created_at.desc()).all()
    
    results = []
    for r in recs:
        field_name = r.field.name if r.field else "Field"
        crop = db.query(Crop).filter(Crop.field_id == r.field_id, Crop.status == "ACTIVE").first()
        crop_name = crop.name if crop else "Crop"
        
        results.append(AIRecommendationResponse(
            id=r.id,
            field_id=r.field_id,
            type=r.type,
            recommendation=r.recommendation,
            reason=r.reason,
            confidence=r.confidence,
            evidence=r.evidence or [],
            data_used=r.data_used or [],
            next_action=r.next_action,
            warnings=r.warnings or [],
            language=r.language or "en",
            created_at=r.created_at,
            field_name=field_name,
            crop_name=crop_name
        ))
    return results

@router.get("/recommendations/{id}", response_model=AIRecommendationResponse)
def get_recommendation_details(id: str, db: Session = Depends(get_db)):
    r = db.query(AIRecommendation).filter(AIRecommendation.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    field_name = r.field.name if r.field else "Field"
    crop = db.query(Crop).filter(Crop.field_id == r.field_id, Crop.status == "ACTIVE").first()
    crop_name = crop.name if crop else "Crop"

    return AIRecommendationResponse(
        id=r.id,
        field_id=r.field_id,
        type=r.type,
        recommendation=r.recommendation,
        reason=r.reason,
        confidence=r.confidence,
        evidence=r.evidence or [],
        data_used=r.data_used or [],
        next_action=r.next_action,
        warnings=r.warnings or [],
        language=r.language or "en",
        created_at=r.created_at,
        field_name=field_name,
        crop_name=crop_name
    )
