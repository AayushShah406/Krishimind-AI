from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.models import (
    User, Farm, Field, Crop, AIRecommendation, ImageAnalysis,
    SoilReading, IrrigationRecord, WeatherRecord, CropImage,
    AdvisorAssignment, AuditLog, Notification
)
from app.schemas.schemas import (
    AdvisorDashboardStats, UserResponse, FarmResponse, FieldResponse,
    AIRecommendationResponse, ImageAnalysisResponse,
    RecommendationReviewRequest, ImageAnalysisReviewRequest,
    FieldAssessmentRequest, AIStructuredResponse
)
from app.api.auth import get_current_user, require_advisor, log_audit_event
from app.services.agent_service import AgriculturalAgent
from app.services.ai_service import ai_service
from app.services.language_service import language_service


router = APIRouter(prefix="/advisor", tags=["Agricultural Advisor Workspace"])

def get_advisor_farmer_ids(advisor_id: str, db: Session) -> List[str]:
    """Retrieve all farmer IDs assigned to this advisor."""
    assignments = db.query(AdvisorAssignment).filter(
        AdvisorAssignment.advisor_id == advisor_id
    ).all()
    return [a.farmer_id for a in assignments]

def check_farmer_access(advisor_id: str, farmer_id: str, db: Session):
    """Enforce strict RBAC: advisor can ONLY access assigned farmers."""
    assignment = db.query(AdvisorAssignment).filter(
        AdvisorAssignment.advisor_id == advisor_id,
        AdvisorAssignment.farmer_id == farmer_id
    ).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Farmer is not assigned to your advisor account."
        )
    return assignment

def check_field_access(advisor_id: str, field_id: str, db: Session) -> Field:
    """Enforce RBAC for field access."""
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    if not field.farm:
        raise HTTPException(status_code=404, detail="Farm not found for this field")
    
    check_farmer_access(advisor_id, field.farm.user_id, db)
    return field

def check_farm_access(advisor_id: str, farm_id: str, db: Session) -> Farm:
    """Enforce RBAC for farm access."""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    check_farmer_access(advisor_id, farm.user_id, db)
    return farm


# -------------------------------------------------------------
# ADVISOR DASHBOARD
# -------------------------------------------------------------
@router.get("/dashboard", response_model=AdvisorDashboardStats)
def get_advisor_dashboard(
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    assigned_farmer_ids = get_advisor_farmer_ids(current_user.id, db)
    if not assigned_farmer_ids:
        # Proper empty state when no farmers assigned
        return AdvisorDashboardStats(
            assigned_farmers_count=0,
            total_farms_monitored=0,
            fields_requiring_attention_count=0,
            recent_recommendations_count=0,
            urgent_alerts=[]
        )

    # Farms and Fields belonging to assigned farmers
    assigned_farms = db.query(Farm).filter(Farm.user_id.in_(assigned_farmer_ids)).all()
    farm_ids = [f.id for f in assigned_farms]
    
    assigned_fields = db.query(Field).filter(Field.farm_id.in_(farm_ids)).all() if farm_ids else []
    field_ids = [f.id for f in assigned_fields]

    flagged_fields = []
    if field_ids:
        # 1. Soil Moisture deficits (< 50%)
        low_moisture_readings = (
            db.query(SoilReading)
            .filter(SoilReading.field_id.in_(field_ids), SoilReading.moisture < 50)
            .order_by(SoilReading.recorded_at.desc())
            .all()
        )
        seen_fields = set()
        for lr in low_moisture_readings:
            if lr.field_id not in seen_fields:
                seen_fields.add(lr.field_id)
                f = lr.field
                if f:
                    flagged_fields.append({
                        "field_id": f.id,
                        "field_name": f.name,
                        "farm_name": f.farm.name if f.farm else "Farm",
                        "issue": f"Critical Moisture Deficit ({lr.moisture}%)",
                        "priority": "HIGH",
                        "action": "Immediate irrigation schedule required"
                    })

        # 2. Urgent Crop Pathologies (High/Critical)
        recent_analyses = (
            db.query(ImageAnalysis)
            .join(CropImage, ImageAnalysis.image_id == CropImage.id)
            .filter(
                CropImage.field_id.in_(field_ids),
                ImageAnalysis.severity.in_(["HIGH", "CRITICAL"])
            )
            .order_by(ImageAnalysis.created_at.desc())
            .limit(5)
            .all()
        )
        for a in recent_analyses:
            img = a.crop_image
            if img and img.field:
                cause = a.possible_causes[0] if (a.possible_causes and len(a.possible_causes) > 0) else "Crop lesion detected"
                flagged_fields.append({
                    "field_id": img.field.id,
                    "field_name": img.field.name,
                    "farm_name": img.field.farm.name if img.field.farm else "Farm",
                    "issue": f"Pathology ({a.severity}): {cause}",
                    "priority": a.severity,
                    "action": a.recommendation[:90] + "..."
                })

    recs_count = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.field_id.in_(field_ids))
        .count()
        if field_ids else 0
    )

    return AdvisorDashboardStats(
        assigned_farmers_count=len(assigned_farmer_ids),
        total_farms_monitored=len(assigned_farms),
        fields_requiring_attention_count=len(flagged_fields),
        recent_recommendations_count=recs_count,
        urgent_alerts=flagged_fields[:6]
    )


# -------------------------------------------------------------
# ADVISOR FARMERS
# -------------------------------------------------------------
@router.get("/farmers")
def get_assigned_farmers(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    assigned_farmer_ids = get_advisor_farmer_ids(current_user.id, db)
    if not assigned_farmer_ids:
        return {"items": [], "total": 0, "page": page, "limit": limit}

    query = db.query(User).filter(User.id.in_(assigned_farmer_ids))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((User.name.ilike(s)) | (User.email.ilike(s)) | (User.location.ilike(s)))

    total = query.count()
    farmers = query.offset((page - 1) * limit).limit(limit).all()

    items = []
    for f in farmers:
        farms_count = db.query(Farm).filter(Farm.user_id == f.id).count()
        farm_ids = [fm.id for fm in db.query(Farm.id).filter(Farm.user_id == f.id).all()]
        fields_count = db.query(Field).filter(Field.farm_id.in_(farm_ids)).count() if farm_ids else 0
        items.append({
            "id": f.id,
            "name": f.name,
            "email": f.email,
            "role": f.role,
            "preferred_language": f.preferred_language,
            "location": f.location,
            "is_active": f.is_active,
            "created_at": f.created_at,
            "farms_count": farms_count,
            "fields_count": fields_count
        })

    return {"items": items, "total": total, "page": page, "limit": limit}


@router.get("/farmers/{id}")
def get_farmer_details(
    id: str,
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    check_farmer_access(current_user.id, id, db)
    farmer = db.query(User).filter(User.id == id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    farms = db.query(Farm).filter(Farm.user_id == id).all()
    farm_ids = [f.id for f in farms]

    fields = db.query(Field).filter(Field.farm_id.in_(farm_ids)).all() if farm_ids else []
    field_ids = [fld.id for fld in fields]

    crops = db.query(Crop).filter(Crop.field_id.in_(field_ids)).all() if field_ids else []
    
    recommendations = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.field_id.in_(field_ids))
        .order_by(AIRecommendation.created_at.desc())
        .limit(10)
        .all()
        if field_ids else []
    )

    image_analyses = (
        db.query(ImageAnalysis)
        .join(CropImage, ImageAnalysis.image_id == CropImage.id)
        .filter(CropImage.field_id.in_(field_ids))
        .order_by(ImageAnalysis.created_at.desc())
        .limit(10)
        .all()
        if field_ids else []
    )

    return {
        "farmer": UserResponse.model_validate(farmer),
        "farms": [FarmResponse.model_validate(fm) for fm in farms],
        "fields": [
            {
                "id": fld.id,
                "farm_id": fld.farm_id,
                "farm_name": fld.farm.name if fld.farm else "",
                "name": fld.name,
                "area": fld.area,
                "soil_type": fld.soil_type,
                "location": fld.location,
                "created_at": fld.created_at,
                "current_crop": fld.crops[0].name if fld.crops else None
            }
            for fld in fields
        ],
        "crops": [
            {
                "id": c.id,
                "name": c.name,
                "variety": c.variety,
                "growth_stage": c.growth_stage,
                "status": c.status,
                "field_id": c.field_id,
                "field_name": c.field.name if c.field else ""
            }
            for c in crops
        ],
        "recommendations": [
            {
                "id": r.id,
                "field_id": r.field_id,
                "type": r.type,
                "recommendation": r.recommendation,
                "confidence": r.confidence,
                "is_reviewed": r.is_reviewed,
                "advisor_notes": r.advisor_notes,
                "created_at": r.created_at
            }
            for r in recommendations
        ],
        "image_analyses": [
            {
                "id": a.id,
                "severity": a.severity,
                "recommendation": a.recommendation,
                "confidence": a.confidence,
                "advisor_notes": a.advisor_notes,
                "created_at": a.created_at,
                "image_url": a.crop_image.image_url if a.crop_image else ""
            }
            for a in image_analyses
        ]
    }


# -------------------------------------------------------------
# ADVISOR FARMS
# -------------------------------------------------------------
@router.get("/farms")
def get_advisor_farms(
    search: Optional[str] = None,
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    assigned_farmer_ids = get_advisor_farmer_ids(current_user.id, db)
    if not assigned_farmer_ids:
        return []

    query = db.query(Farm).filter(Farm.user_id.in_(assigned_farmer_ids))
    if search:
        query = query.filter(Farm.name.ilike(f"%{search.strip()}%"))
    
    farms = query.order_by(Farm.created_at.desc()).all()
    results = []
    for fm in farms:
        f_count = len(fm.fields)
        c_names = [c.name for fld in fm.fields for c in fld.crops]
        results.append({
            "id": fm.id,
            "user_id": fm.user_id,
            "owner_name": fm.user.name if fm.user else "Farmer",
            "name": fm.name,
            "location": fm.location,
            "area": fm.area,
            "unit": fm.unit,
            "soil_type": fm.soil_type,
            "field_count": f_count,
            "crop_names": list(set(c_names)),
            "created_at": fm.created_at
        })
    return results


@router.get("/farms/{id}")
def get_advisor_farm_details(
    id: str,
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    farm = check_farm_access(current_user.id, id, db)
    fields = farm.fields
    field_ids = [f.id for f in fields]

    # Telemetry and recommendations
    recommendations = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.field_id.in_(field_ids))
        .order_by(AIRecommendation.created_at.desc())
        .limit(10)
        .all()
        if field_ids else []
    )

    image_analyses = (
        db.query(ImageAnalysis)
        .join(CropImage, ImageAnalysis.image_id == CropImage.id)
        .filter(CropImage.field_id.in_(field_ids))
        .order_by(ImageAnalysis.created_at.desc())
        .limit(8)
        .all()
        if field_ids else []
    )

    return {
        "id": farm.id,
        "name": farm.name,
        "owner": {
            "id": farm.user.id,
            "name": farm.user.name,
            "email": farm.user.email,
            "preferred_language": farm.user.preferred_language
        } if farm.user else None,
        "location": farm.location,
        "area": farm.area,
        "unit": farm.unit,
        "soil_type": farm.soil_type,
        "created_at": farm.created_at,
        "fields": [
            {
                "id": f.id,
                "name": f.name,
                "area": f.area,
                "soil_type": f.soil_type,
                "location": f.location,
                "current_crop": f.crops[0].name if f.crops else None,
                "latest_moisture": f.soil_readings[0].moisture if f.soil_readings else None
            }
            for f in fields
        ],
        "recommendations": [
            {
                "id": r.id,
                "field_id": r.field_id,
                "field_name": r.field.name if r.field else "",
                "type": r.type,
                "recommendation": r.recommendation,
                "confidence": r.confidence,
                "is_reviewed": r.is_reviewed,
                "advisor_notes": r.advisor_notes,
                "created_at": r.created_at
            }
            for r in recommendations
        ],
        "image_analyses": [
            {
                "id": a.id,
                "severity": a.severity,
                "recommendation": a.recommendation,
                "confidence": a.confidence,
                "advisor_notes": a.advisor_notes,
                "image_url": a.crop_image.image_url if a.crop_image else "",
                "created_at": a.created_at
            }
            for a in image_analyses
        ]
    }


# -------------------------------------------------------------
# ADVISOR FIELDS
# -------------------------------------------------------------
@router.get("/fields")
def get_advisor_fields(
    search: Optional[str] = None,
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    assigned_farmer_ids = get_advisor_farmer_ids(current_user.id, db)
    if not assigned_farmer_ids:
        return []

    farm_ids = [fm.id for fm in db.query(Farm.id).filter(Farm.user_id.in_(assigned_farmer_ids)).all()]
    if not farm_ids:
        return []

    query = db.query(Field).filter(Field.farm_id.in_(farm_ids))
    if search:
        query = query.filter(Field.name.ilike(f"%{search.strip()}%"))

    fields = query.order_by(Field.created_at.desc()).all()
    results = []
    for f in fields:
        crop = f.crops[0] if f.crops else None
        soil = f.soil_readings[0] if f.soil_readings else None
        results.append({
            "id": f.id,
            "name": f.name,
            "farm_id": f.farm_id,
            "farm_name": f.farm.name if f.farm else "Farm",
            "farmer_name": f.farm.user.name if (f.farm and f.farm.user) else "Farmer",
            "area": f.area,
            "soil_type": f.soil_type,
            "current_crop": {
                "name": crop.name,
                "variety": crop.variety,
                "growth_stage": crop.growth_stage
            } if crop else None,
            "latest_moisture": soil.moisture if soil else None,
            "created_at": f.created_at
        })
    return results


@router.get("/fields/{id}")
def get_advisor_field_details(
    id: str,
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    field = check_field_access(current_user.id, id, db)
    
    crops = field.crops
    current_crop = crops[0] if crops else None

    soil_readings = (
        db.query(SoilReading)
        .filter(SoilReading.field_id == id)
        .order_by(SoilReading.recorded_at.desc())
        .limit(20)
        .all()
    )

    irrigation_records = (
        db.query(IrrigationRecord)
        .filter(IrrigationRecord.field_id == id)
        .order_by(IrrigationRecord.date.desc())
        .limit(10)
        .all()
    )

    recommendations = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.field_id == id)
        .order_by(AIRecommendation.created_at.desc())
        .limit(15)
        .all()
    )

    crop_images = (
        db.query(CropImage)
        .filter(CropImage.field_id == id)
        .order_by(CropImage.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "field": {
            "id": field.id,
            "name": field.name,
            "farm_id": field.farm_id,
            "farm_name": field.farm.name if field.farm else "",
            "farmer": {
                "id": field.farm.user.id,
                "name": field.farm.user.name,
                "email": field.farm.user.email,
                "preferred_language": field.farm.user.preferred_language
            } if field.farm and field.farm.user else None,
            "area": field.area,
            "soil_type": field.soil_type,
            "location": field.location or (field.farm.location if field.farm else ""),
            "created_at": field.created_at
        },
        "current_crop": {
            "id": current_crop.id,
            "name": current_crop.name,
            "variety": current_crop.variety,
            "planting_date": current_crop.planting_date,
            "growth_stage": current_crop.growth_stage,
            "status": current_crop.status
        } if current_crop else None,
        "soil_history": [
            {
                "id": s.id,
                "moisture": s.moisture,
                "ph": s.ph,
                "nitrogen": s.nitrogen,
                "phosphorus": s.phosphorus,
                "potassium": s.potassium,
                "recorded_at": s.recorded_at
            }
            for s in soil_readings
        ],
        "irrigation_history": [
            {
                "id": i.id,
                "date": i.date,
                "amount": i.amount,
                "unit": i.unit,
                "method": i.method,
                "notes": i.notes
            }
            for i in irrigation_records
        ],
        "recommendations": [
            {
                "id": r.id,
                "type": r.type,
                "recommendation": r.recommendation,
                "reason": r.reason,
                "confidence": r.confidence,
                "evidence": r.evidence,
                "data_used": r.data_used,
                "next_action": r.next_action,
                "warnings": r.warnings,
                "is_reviewed": r.is_reviewed,
                "advisor_notes": r.advisor_notes,
                "reviewed_at": r.reviewed_at,
                "created_at": r.created_at
            }
            for r in recommendations
        ],
        "crop_images": [
            {
                "id": img.id,
                "image_url": img.image_url,
                "status": img.status,
                "created_at": img.created_at,
                "analysis": {
                    "id": img.analysis.id,
                    "severity": img.analysis.severity,
                    "visual_observations": img.analysis.visual_observations,
                    "possible_causes": img.analysis.possible_causes,
                    "recommendation": img.analysis.recommendation,
                    "confidence": img.analysis.confidence,
                    "advisor_notes": img.analysis.advisor_notes,
                    "reviewed_at": img.analysis.reviewed_at
                } if img.analysis else None
            }
            for img in crop_images
        ]
    }


# -------------------------------------------------------------
# ADVISOR GENERATE FIELD ASSESSMENT (AI + PINECONE RAG)
# -------------------------------------------------------------
@router.post("/fields/{id}/assessment")
async def generate_field_assessment(
    id: str,
    payload: FieldAssessmentRequest,
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    field = check_field_access(current_user.id, id, db)

    target_lang = language_service.resolve_language(payload.language or "en", current_user.preferred_language)
    question_text = payload.question or "Provide an expert field assessment and actionable guidance based on current soil telemetry, crop stage, and weather forecast."

    # Assemble live field telemetry, weather forecast, and Pinecone RAG knowledge
    agent = AgriculturalAgent(db)
    context = await agent.assemble_context(
        question=question_text,
        field_id=field.id,
        farm_id=field.farm_id
    )

    # Trigger genuine AI reasoning with Gemini 3.7 Flash
    ai_result = await ai_service.reason_and_recommend(
        question=question_text,
        context=context,
        language=target_lang
    )

    # Persist the generated assessment recommendation in PostgreSQL
    new_rec = AIRecommendation(
        field_id=field.id,
        type="Field Assessment",
        recommendation=ai_result.recommendation,
        reason=ai_result.reason,
        confidence=ai_result.confidence,
        evidence=ai_result.evidence,
        data_used=ai_result.data_used,
        next_action=ai_result.next_action,
        warnings=ai_result.warnings,
        language=ai_result.language,
        is_reviewed=True,
        advisor_notes=f"Expert assessment generated by Advisor {current_user.name}",
        reviewed_by=current_user.id,
        reviewed_at=datetime.utcnow()
    )
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)

    log_audit_event(
        db=db,
        user_id=current_user.id,
        action="FIELD_ASSESSMENT_GENERATED",
        resource_type="Field",
        resource_id=field.id,
        details={"recommendation_id": new_rec.id, "confidence": new_rec.confidence}
    )

    return {
        "recommendation_id": new_rec.id,
        "structured_assessment": ai_result.model_dump()
    }


# -------------------------------------------------------------
# ADVISOR RECOMMENDATIONS
# -------------------------------------------------------------
@router.get("/recommendations")
def get_advisor_recommendations(
    reviewed: Optional[bool] = None,
    confidence: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    assigned_farmer_ids = get_advisor_farmer_ids(current_user.id, db)
    if not assigned_farmer_ids:
        return {"items": [], "total": 0, "page": page, "limit": limit}

    farm_ids = [fm.id for fm in db.query(Farm.id).filter(Farm.user_id.in_(assigned_farmer_ids)).all()]
    field_ids = [f.id for f in db.query(Field.id).filter(Field.farm_id.in_(farm_ids)).all()] if farm_ids else []
    if not field_ids:
        return {"items": [], "total": 0, "page": page, "limit": limit}

    query = db.query(AIRecommendation).filter(AIRecommendation.field_id.in_(field_ids))

    if reviewed is not None:
        query = query.filter(AIRecommendation.is_reviewed == reviewed)
    if confidence:
        query = query.filter(AIRecommendation.confidence == confidence.upper())
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((AIRecommendation.recommendation.ilike(s)) | (AIRecommendation.type.ilike(s)))

    total = query.count()
    recs = query.order_by(AIRecommendation.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for r in recs:
        items.append({
            "id": r.id,
            "field_id": r.field_id,
            "field_name": r.field.name if r.field else "",
            "farm_name": r.field.farm.name if (r.field and r.field.farm) else "",
            "farmer_name": r.field.farm.user.name if (r.field and r.field.farm and r.field.farm.user) else "",
            "crop_name": r.field.crops[0].name if (r.field and r.field.crops) else "General",
            "type": r.type,
            "recommendation": r.recommendation,
            "reason": r.reason,
            "confidence": r.confidence,
            "evidence": r.evidence,
            "data_used": r.data_used,
            "next_action": r.next_action,
            "warnings": r.warnings,
            "language": r.language,
            "is_reviewed": r.is_reviewed,
            "advisor_notes": r.advisor_notes,
            "reviewed_by": r.reviewed_by,
            "reviewed_at": r.reviewed_at,
            "created_at": r.created_at
        })

    return {"items": items, "total": total, "page": page, "limit": limit}


@router.post("/recommendations/{id}/review")
def review_recommendation(
    id: str,
    payload: RecommendationReviewRequest,
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    rec = db.query(AIRecommendation).filter(AIRecommendation.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    # Verify advisor access to the field's farmer
    if rec.field and rec.field.farm:
        check_farmer_access(current_user.id, rec.field.farm.user_id, db)

    rec.advisor_notes = payload.advisor_notes
    rec.is_reviewed = True
    rec.reviewed_by = current_user.id
    rec.reviewed_at = datetime.utcnow()
    db.commit()

    log_audit_event(
        db=db,
        user_id=current_user.id,
        action="RECOMMENDATION_REVIEWED",
        resource_type="AIRecommendation",
        resource_id=rec.id,
        details={"advisor_notes": payload.advisor_notes}
    )

    return {
        "success": True,
        "id": rec.id,
        "is_reviewed": rec.is_reviewed,
        "advisor_notes": rec.advisor_notes,
        "reviewed_at": rec.reviewed_at
    }


# -------------------------------------------------------------
# ADVISOR CROP ANALYSIS
# -------------------------------------------------------------
@router.get("/crop-analysis")
def get_advisor_crop_analyses(
    severity: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    assigned_farmer_ids = get_advisor_farmer_ids(current_user.id, db)
    if not assigned_farmer_ids:
        return {"items": [], "total": 0, "page": page, "limit": limit}

    farm_ids = [fm.id for fm in db.query(Farm.id).filter(Farm.user_id.in_(assigned_farmer_ids)).all()]
    field_ids = [f.id for f in db.query(Field.id).filter(Field.farm_id.in_(farm_ids)).all()] if farm_ids else []
    if not field_ids:
        return {"items": [], "total": 0, "page": page, "limit": limit}

    query = (
        db.query(ImageAnalysis)
        .join(CropImage, ImageAnalysis.image_id == CropImage.id)
        .filter(CropImage.field_id.in_(field_ids))
    )

    if severity:
        query = query.filter(ImageAnalysis.severity == severity.upper())
    if search:
        query = query.filter(ImageAnalysis.recommendation.ilike(f"%{search.strip()}%"))

    total = query.count()
    analyses = query.order_by(ImageAnalysis.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for a in analyses:
        img = a.crop_image
        items.append({
            "id": a.id,
            "image_id": a.image_id,
            "image_url": img.image_url if img else "",
            "field_id": img.field_id if img else "",
            "field_name": img.field.name if (img and img.field) else "",
            "crop_name": img.crop.name if (img and img.crop) else "Crop",
            "farmer_name": img.user.name if (img and img.user) else "Farmer",
            "visual_observations": a.visual_observations,
            "possible_causes": a.possible_causes,
            "severity": a.severity,
            "confidence": a.confidence,
            "recommendation": a.recommendation,
            "evidence": a.evidence,
            "additional_information_needed": a.additional_information_needed,
            "advisor_notes": a.advisor_notes,
            "reviewed_by": a.reviewed_by,
            "reviewed_at": a.reviewed_at,
            "created_at": a.created_at
        })

    return {"items": items, "total": total, "page": page, "limit": limit}


@router.post("/crop-analysis/{id}/review")
def review_crop_analysis(
    id: str,
    payload: ImageAnalysisReviewRequest,
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    analysis = db.query(ImageAnalysis).filter(ImageAnalysis.id == id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Crop analysis not found")

    if analysis.crop_image and analysis.crop_image.field and analysis.crop_image.field.farm:
        check_farmer_access(current_user.id, analysis.crop_image.field.farm.user_id, db)

    analysis.advisor_notes = payload.advisor_notes
    analysis.reviewed_by = current_user.id
    analysis.reviewed_at = datetime.utcnow()
    db.commit()

    log_audit_event(
        db=db,
        user_id=current_user.id,
        action="CROP_ANALYSIS_REVIEWED",
        resource_type="ImageAnalysis",
        resource_id=analysis.id,
        details={"advisor_notes": payload.advisor_notes}
    )

    return {
        "success": True,
        "id": analysis.id,
        "advisor_notes": analysis.advisor_notes,
        "reviewed_at": analysis.reviewed_at
    }


# -------------------------------------------------------------
# ADVISOR NOTIFICATIONS & PROFILE
# -------------------------------------------------------------
@router.get("/notifications", response_model=List[Dict[str, Any]])
def get_advisor_notifications(
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "language": n.language,
            "is_read": n.is_read,
            "created_at": n.created_at
        }
        for n in notifs
    ]


@router.get("/profile")
def get_advisor_profile(
    current_user: User = Depends(require_advisor),
    db: Session = Depends(get_db)
):
    assigned_count = len(get_advisor_farmer_ids(current_user.id, db))
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "preferred_language": current_user.preferred_language,
        "location": current_user.location,
        "assigned_farmers_count": assigned_count,
        "created_at": current_user.created_at
    }
