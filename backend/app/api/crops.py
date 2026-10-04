from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Crop, Field
from app.schemas.schemas import CropCreate, CropUpdate, CropResponse

router = APIRouter(prefix="/crops", tags=["Crops"])

def enrich_crop(crop: Crop, db: Session) -> CropResponse:
    field_name = crop.field.name if crop.field else None
    return CropResponse(
        id=crop.id,
        field_id=crop.field_id,
        name=crop.name,
        variety=crop.variety,
        planting_date=crop.planting_date,
        expected_harvest_date=crop.expected_harvest_date,
        growth_stage=crop.growth_stage,
        irrigation_method=crop.irrigation_method,
        notes=crop.notes,
        status=crop.status,
        created_at=crop.created_at,
        field_name=field_name
    )

@router.get("", response_model=List[CropResponse])
def get_crops(field_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Crop)
    if field_id:
        query = query.filter(Crop.field_id == field_id)
    crops = query.all()
    return [enrich_crop(c, db) for c in crops]

@router.post("", response_model=CropResponse)
def create_crop(crop_in: CropCreate, db: Session = Depends(get_db)):
    crop = Crop(
        field_id=crop_in.field_id,
        name=crop_in.name,
        variety=crop_in.variety,
        planting_date=crop_in.planting_date,
        expected_harvest_date=crop_in.expected_harvest_date,
        growth_stage=crop_in.growth_stage,
        irrigation_method=crop_in.irrigation_method,
        notes=crop_in.notes,
        status=crop_in.status or "ACTIVE"
    )
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return enrich_crop(crop, db)

@router.get("/{id}", response_model=CropResponse)
def get_crop(id: str, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return enrich_crop(crop, db)

@router.put("/{id}", response_model=CropResponse)
def update_crop(id: str, crop_in: CropUpdate, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    if crop_in.name is not None:
        crop.name = crop_in.name
    if crop_in.variety is not None:
        crop.variety = crop_in.variety
    if crop_in.planting_date is not None:
        crop.planting_date = crop_in.planting_date
    if crop_in.expected_harvest_date is not None:
        crop.expected_harvest_date = crop_in.expected_harvest_date
    if crop_in.growth_stage is not None:
        crop.growth_stage = crop_in.growth_stage
    if crop_in.irrigation_method is not None:
        crop.irrigation_method = crop_in.irrigation_method
    if crop_in.notes is not None:
        crop.notes = crop_in.notes
    if crop_in.status is not None:
        crop.status = crop_in.status
        
    db.commit()
    db.refresh(crop)
    return enrich_crop(crop, db)

@router.delete("/{id}")
def delete_crop(id: str, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(crop)
    db.commit()
    return {"message": "Crop deleted successfully"}
