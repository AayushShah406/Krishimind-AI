from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Field, Farm, Crop, SoilReading, WeatherRecord, User
from app.schemas.schemas import FieldCreate, FieldUpdate, FieldResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/fields", tags=["Fields"])

def enrich_field_response(field: Field, db: Session) -> FieldResponse:
    crop = db.query(Crop).filter(Crop.field_id == field.id, Crop.status == "ACTIVE").order_by(Crop.created_at.desc()).first()
    crop_dict = None
    if crop:
        crop_dict = {
            "id": crop.id,
            "name": crop.name,
            "variety": crop.variety,
            "growth_stage": crop.growth_stage,
            "planting_date": crop.planting_date.strftime("%Y-%m-%d")
        }

    soil = db.query(SoilReading).filter(SoilReading.field_id == field.id).order_by(SoilReading.recorded_at.desc()).first()
    soil_dict = None
    if soil:
        soil_dict = {
            "moisture": soil.moisture,
            "ph": soil.ph,
            "nitrogen": soil.nitrogen,
            "phosphorus": soil.phosphorus,
            "potassium": soil.potassium
        }

    weather = db.query(WeatherRecord).filter(WeatherRecord.field_id == field.id).order_by(WeatherRecord.recorded_at.desc()).first()
    weather_dict = None
    if weather:
        weather_dict = {
            "temperature": weather.temperature,
            "humidity": weather.humidity,
            "rainfall": weather.rainfall,
            "rain_probability": weather.rain_probability
        }

    return FieldResponse(
        id=field.id,
        farm_id=field.farm_id,
        name=field.name,
        area=field.area,
        area_unit=field.area_unit or "acres",
        soil_type=field.soil_type,
        irrigation_method=field.irrigation_method,
        location=field.location,
        latitude=field.latitude,
        longitude=field.longitude,
        description=field.description,
        created_at=field.created_at,
        current_crop=crop_dict,
        latest_soil=soil_dict,
        latest_weather=weather_dict
    )

@router.get("", response_model=List[FieldResponse])
def get_fields(farm_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Field)
    if farm_id:
        query = query.filter(Field.farm_id == farm_id)
    fields = query.all()
    return [enrich_field_response(f, db) for f in fields]

@router.post("", response_model=FieldResponse)
def create_field(field_in: FieldCreate, db: Session = Depends(get_db)):
    # Inherit location and coordinates from parent farm if not provided
    farm = db.query(Farm).filter(Farm.id == field_in.farm_id).first()
    loc = field_in.location or (farm.location if farm else None)
    lat = field_in.latitude if field_in.latitude is not None else (farm.latitude if farm else None)
    lon = field_in.longitude if field_in.longitude is not None else (farm.longitude if farm else None)

    field = Field(
        farm_id=field_in.farm_id,
        name=field_in.name,
        area=field_in.area,
        area_unit=field_in.area_unit or (farm.unit if farm else "acres"),
        soil_type=field_in.soil_type or (farm.soil_type if farm else "Sandy Loam"),
        irrigation_method=field_in.irrigation_method,
        location=loc,
        latitude=lat,
        longitude=lon,
        description=field_in.description
    )
    db.add(field)
    db.commit()
    db.refresh(field)
    return enrich_field_response(field, db)

@router.get("/{id}", response_model=FieldResponse)
def get_field(id: str, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return enrich_field_response(field, db)

@router.put("/{id}", response_model=FieldResponse)
def update_field(id: str, field_in: FieldUpdate, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    for key, value in field_in.model_dump(exclude_unset=True).items():
        setattr(field, key, value)

    db.commit()
    db.refresh(field)
    return enrich_field_response(field, db)

@router.delete("/{id}")
def delete_field(id: str, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    db.delete(field)
    db.commit()
    return {"message": "Field deleted successfully"}
