from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Farm, Field, Crop, AIRecommendation, User
from app.schemas.schemas import FarmCreate, FarmUpdate, FarmResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/farms", tags=["Farms"])

def enrich_farm_response(farm: Farm, db: Session) -> FarmResponse:
    fields = db.query(Field).filter(Field.farm_id == farm.id).all()
    field_ids = [f.id for f in fields]
    
    crops = db.query(Crop).filter(Crop.field_id.in_(field_ids), Crop.status == "ACTIVE").all() if field_ids else []
    crop_names = list(set([c.name for c in crops]))
    
    latest_rec = None
    if field_ids:
        rec = db.query(AIRecommendation).filter(AIRecommendation.field_id.in_(field_ids)).order_by(AIRecommendation.created_at.desc()).first()
        if rec:
            latest_rec = rec.recommendation

    return FarmResponse(
        id=farm.id,
        user_id=farm.user_id,
        name=farm.name,
        location=farm.location,
        area=farm.area,
        unit=farm.unit,
        soil_type=farm.soil_type,
        latitude=farm.latitude,
        longitude=farm.longitude,
        state=farm.state,
        district=farm.district,
        city=farm.city,
        description=farm.description,
        created_at=farm.created_at,
        field_count=len(fields),
        crop_names=crop_names,
        latest_recommendation=latest_rec
    )

@router.get("", response_model=List[FarmResponse])
def get_farms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role in ["ADMIN", "ADVISOR"]:
        farms = db.query(Farm).all()
    else:
        farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    return [enrich_farm_response(f, db) for f in farms]

@router.post("", response_model=FarmResponse)
def create_farm(farm_in: FarmCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = Farm(
        user_id=current_user.id,
        name=farm_in.name,
        location=farm_in.location,
        area=farm_in.area,
        unit=farm_in.unit or "acres",
        soil_type=farm_in.soil_type or "Sandy Loam",
        latitude=farm_in.latitude,
        longitude=farm_in.longitude,
        state=farm_in.state,
        district=farm_in.district,
        city=farm_in.city,
        description=farm_in.description
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return enrich_farm_response(farm, db)

@router.get("/{id}", response_model=FarmResponse)
def get_farm(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return enrich_farm_response(farm, db)

@router.put("/{id}", response_model=FarmResponse)
def update_farm(id: str, farm_in: FarmUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    for key, value in farm_in.model_dump(exclude_unset=True).items():
        setattr(farm, key, value)
        
    db.commit()
    db.refresh(farm)
    return enrich_farm_response(farm, db)

@router.delete("/{id}")
def delete_farm(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    db.delete(farm)
    db.commit()
    return {"message": "Farm deleted successfully"}
