from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.models import IrrigationRecord
from app.schemas.schemas import IrrigationRecordCreate, IrrigationRecordResponse

router = APIRouter(prefix="/irrigation", tags=["Irrigation"])

@router.get("/{field_id}", response_model=List[IrrigationRecordResponse])
def get_irrigation_records(field_id: str, db: Session = Depends(get_db)):
    records = db.query(IrrigationRecord).filter(IrrigationRecord.field_id == field_id).order_by(IrrigationRecord.date.desc()).all()
    return records

@router.post("", response_model=IrrigationRecordResponse)
def create_irrigation_record(record_in: IrrigationRecordCreate, db: Session = Depends(get_db)):
    record = IrrigationRecord(
        field_id=record_in.field_id,
        amount=record_in.amount,
        unit=record_in.unit or "mm",
        method=record_in.method,
        notes=record_in.notes,
        date=record_in.date or datetime.utcnow()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.put("/{id}", response_model=IrrigationRecordResponse)
def update_irrigation_record(id: str, record_in: IrrigationRecordCreate, db: Session = Depends(get_db)):
    record = db.query(IrrigationRecord).filter(IrrigationRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Irrigation record not found")
    for key, val in record_in.model_dump(exclude_unset=True).items():
        setattr(record, key, val)
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{id}")
def delete_irrigation_record(id: str, db: Session = Depends(get_db)):
    record = db.query(IrrigationRecord).filter(IrrigationRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Irrigation record not found")
    db.delete(record)
    db.commit()
    return {"message": "Irrigation record deleted successfully"}
