from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.models.models import CropImage, ImageAnalysis, Crop, Field, User, SoilReading, WeatherRecord
from app.schemas.schemas import ImageAnalysisResponse, CropImageResponse, ImageFollowUpRequest, ImageFollowUpResponse
from app.api.auth import get_current_user
from app.services.storage_service import storage_service
from app.services.image_analysis_service import image_analysis_service
from app.services.language_service import language_service

router = APIRouter(prefix="/images", tags=["Crop Images"])

def enrich_image_analysis(analysis: ImageAnalysis, db: Session) -> ImageAnalysisResponse:
    image = analysis.crop_image
    crop = db.query(Crop).filter(Crop.id == image.crop_id).first() if (image and image.crop_id) else None
    field = db.query(Field).filter(Field.id == image.field_id).first() if (image and image.field_id) else None
    
    return ImageAnalysisResponse(
        id=analysis.id,
        image_id=analysis.image_id,
        image_url=image.image_url if image else "",
        crop_detected=analysis.crop_detected or (crop.name if crop else "Crop"),
        visual_observations=analysis.visual_observations or [],
        possible_causes=analysis.possible_causes or [],
        possible_disease=analysis.possible_disease,
        possible_pest_damage=analysis.possible_pest_damage,
        possible_nutrient_deficiency=analysis.possible_nutrient_deficiency,
        severity=analysis.severity or "MODERATE",
        recommendation=analysis.recommendation,
        recommended_next_steps=analysis.recommended_next_steps or [],
        prevention_measures=analysis.prevention_measures or [],
        confidence=analysis.confidence or "MEDIUM",
        is_confirmed_diagnosis=bool(analysis.is_confirmed_diagnosis),
        diagnosis_disclaimer=analysis.diagnosis_disclaimer,
        retrieved_knowledge=analysis.retrieved_knowledge or [],
        conversation_history=analysis.conversation_history or [],
        evidence=analysis.evidence or [],
        additional_information_needed=analysis.additional_information_needed or [],
        language=analysis.language or "en",
        created_at=analysis.created_at,
        crop_name=crop.name if crop else (analysis.crop_detected or "Crop"),
        field_name=field.name if field else "Field"
    )

@router.post("/upload")
async def upload_crop_image(
    file: UploadFile = File(...),
    field_id: Optional[str] = Form(None),
    crop_id: Optional[str] = Form(None),
    question: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    key, url = await storage_service.save_image(file)
    
    crop_image = CropImage(
        user_id=current_user.id,
        field_id=field_id if field_id and field_id != "" else None,
        crop_id=crop_id if crop_id and crop_id != "" else None,
        image_url=url,
        question=question,
        status="PENDING"
    )
    db.add(crop_image)
    db.commit()
    db.refresh(crop_image)
    
    return {
        "id": crop_image.id,
        "image_url": crop_image.image_url,
        "question": crop_image.question,
        "field_id": crop_image.field_id,
        "crop_id": crop_image.crop_id,
        "status": crop_image.status,
        "created_at": crop_image.created_at
    }

@router.post("/{id}/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(
    id: str,
    language: Optional[str] = "en",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image = db.query(CropImage).filter(CropImage.id == id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Crop image record not found")
    
    target_lang = language_service.resolve_language(language, current_user.preferred_language)
    crop = db.query(Crop).filter(Crop.id == image.crop_id).first() if image.crop_id else None
    field = db.query(Field).filter(Field.id == image.field_id).first() if image.field_id else None

    crop_name = crop.name if crop else None
    field_name = field.name if field else None

    # Run multimodal image analysis + Pinecone RAG
    analysis_data = await image_analysis_service.analyze_crop_image(
        image_url=image.image_url,
        crop_name=crop_name,
        field_name=field_name,
        user_question=image.question,
        language=target_lang
    )

    # Persist or update analysis in PostgreSQL / SQLite
    existing = db.query(ImageAnalysis).filter(ImageAnalysis.image_id == id).first()
    if existing:
        existing.crop_detected = analysis_data.get("crop_detected")
        existing.visual_observations = analysis_data.get("visual_observations", [])
        existing.possible_causes = analysis_data.get("possible_causes", [])
        existing.possible_disease = analysis_data.get("possible_disease")
        existing.possible_pest_damage = analysis_data.get("possible_pest_damage")
        existing.possible_nutrient_deficiency = analysis_data.get("possible_nutrient_deficiency")
        existing.severity = analysis_data.get("severity", "MODERATE")
        existing.recommendation = analysis_data.get("recommendation", "")
        existing.recommended_next_steps = analysis_data.get("recommended_next_steps", [])
        existing.prevention_measures = analysis_data.get("prevention_measures", [])
        existing.confidence = analysis_data.get("confidence", "MEDIUM")
        existing.is_confirmed_diagnosis = analysis_data.get("is_confirmed_diagnosis", False)
        existing.diagnosis_disclaimer = analysis_data.get("diagnosis_disclaimer")
        existing.retrieved_knowledge = analysis_data.get("retrieved_knowledge", [])
        existing.evidence = analysis_data.get("evidence", [])
        existing.additional_information_needed = analysis_data.get("additional_information_needed", [])
        existing.language = target_lang
        analysis = existing
    else:
        analysis = ImageAnalysis(
            image_id=image.id,
            crop_detected=analysis_data.get("crop_detected"),
            visual_observations=analysis_data.get("visual_observations", []),
            possible_causes=analysis_data.get("possible_causes", []),
            possible_disease=analysis_data.get("possible_disease"),
            possible_pest_damage=analysis_data.get("possible_pest_damage"),
            possible_nutrient_deficiency=analysis_data.get("possible_nutrient_deficiency"),
            severity=analysis_data.get("severity", "MODERATE"),
            recommendation=analysis_data.get("recommendation", ""),
            recommended_next_steps=analysis_data.get("recommended_next_steps", []),
            prevention_measures=analysis_data.get("prevention_measures", []),
            confidence=analysis_data.get("confidence", "MEDIUM"),
            is_confirmed_diagnosis=analysis_data.get("is_confirmed_diagnosis", False),
            diagnosis_disclaimer=analysis_data.get("diagnosis_disclaimer"),
            retrieved_knowledge=analysis_data.get("retrieved_knowledge", []),
            conversation_history=[],
            evidence=analysis_data.get("evidence", []),
            additional_information_needed=analysis_data.get("additional_information_needed", []),
            language=target_lang
        )
        db.add(analysis)

    image.status = "ANALYZED"
    db.commit()
    db.refresh(analysis)

    return enrich_image_analysis(analysis, db)

@router.post("/{id}/conversation", response_model=ImageFollowUpResponse)
async def ask_crop_image_follow_up(
    id: str,
    req: ImageFollowUpRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Handles follow-up questions from the farmer regarding a crop image analysis.
    Preserves context, retrieves Pinecone agricultural knowledge, and combines farmer field telemetry.
    """
    analysis = db.query(ImageAnalysis).filter(ImageAnalysis.image_id == id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Crop analysis not found")

    image = analysis.crop_image
    target_lang = language_service.resolve_language(req.language, current_user.preferred_language)

    # Gather farmer field context if field is associated
    field_context: Dict[str, Any] = {}
    if image and image.field_id:
        soil = db.query(SoilReading).filter(SoilReading.field_id == image.field_id).order_by(SoilReading.recorded_at.desc()).first()
        weather = db.query(WeatherRecord).filter(WeatherRecord.field_id == image.field_id).order_by(WeatherRecord.recorded_at.desc()).first()
        if soil:
            field_context["soil"] = {
                "moisture": soil.moisture,
                "ph": soil.ph,
                "nitrogen": soil.nitrogen,
                "soil_temperature": soil.soil_temperature,
                "source": soil.source
            }
        if weather:
            field_context["weather"] = {
                "temperature": weather.temperature,
                "humidity": weather.humidity,
                "rainfall": weather.rainfall,
                "rain_probability": weather.rain_probability
            }

    analysis_context = {
        "crop_detected": analysis.crop_detected,
        "possible_disease": analysis.possible_disease,
        "visual_observations": analysis.visual_observations or [],
        "severity": analysis.severity,
        "conversation_history": analysis.conversation_history or []
    }

    result = await image_analysis_service.answer_follow_up(
        analysis_context=analysis_context,
        question=req.question,
        farmer_context=field_context,
        language=target_lang
    )

    # Append question and answer to conversation history
    history = list(analysis.conversation_history or [])
    history.append({"role": "user", "content": req.question})
    history.append({"role": "assistant", "content": result["answer"]})
    analysis.conversation_history = history
    db.commit()

    return ImageFollowUpResponse(
        answer=result["answer"],
        language=target_lang,
        sources_used=result.get("sources_used", []),
        conversation_history=history
    )

@router.get("", response_model=List[ImageAnalysisResponse])
def get_all_analyses(
    field_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ImageAnalysis)
    if field_id:
        query = query.join(CropImage).filter(CropImage.field_id == field_id)
    analyses = query.order_by(ImageAnalysis.created_at.desc()).all()
    return [enrich_image_analysis(a, db) for a in analyses]

@router.get("/{id}/analysis", response_model=ImageAnalysisResponse)
def get_analysis_by_image(id: str, db: Session = Depends(get_db)):
    analysis = db.query(ImageAnalysis).filter(ImageAnalysis.image_id == id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for this image")
    return enrich_image_analysis(analysis, db)
