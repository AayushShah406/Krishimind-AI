from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Field, Farm
from app.schemas.schemas import WeatherResponse
from app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/{field_id}", response_model=WeatherResponse)
async def get_field_weather(field_id: str, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    lat = field.latitude or (field.farm.latitude if field.farm else None)
    lon = field.longitude or (field.farm.longitude if field.farm else None)
    location = field.location or (field.farm.location if field.farm else None)

    weather = await weather_service.get_weather(lat=lat, lon=lon, location_name=location, field_id=field_id)
    if not weather:
        raise HTTPException(status_code=404, detail="Weather data unavailable for this location")
    return weather

@router.get("/farm/{farm_id}", response_model=WeatherResponse)
async def get_farm_weather(farm_id: str, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    weather = await weather_service.get_weather(lat=farm.latitude, lon=farm.longitude, location_name=farm.location)
    if not weather:
        raise HTTPException(status_code=404, detail="Weather data unavailable for this location")
    return weather
