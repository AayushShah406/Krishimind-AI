import os
import json
import base64
import httpx
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.models import SoilReading, Field
from app.schemas.schemas import SoilReadingCreate, SoilReadingResponse

router = APIRouter(prefix="/soil", tags=["Soil"])

@router.get("/{field_id}", response_model=List[SoilReadingResponse])
def get_soil_readings(field_id: str, db: Session = Depends(get_db)):
    readings = db.query(SoilReading).filter(SoilReading.field_id == field_id).order_by(SoilReading.recorded_at.desc()).all()
    return readings

@router.post("", response_model=SoilReadingResponse)
def create_soil_reading(reading_in: SoilReadingCreate, db: Session = Depends(get_db)):
    reading = SoilReading(
        field_id=reading_in.field_id,
        moisture=reading_in.moisture,
        ph=reading_in.ph,
        nitrogen=reading_in.nitrogen,
        phosphorus=reading_in.phosphorus,
        potassium=reading_in.potassium,
        soil_temperature=reading_in.soil_temperature,
        electrical_conductivity=reading_in.electrical_conductivity,
        organic_carbon=reading_in.organic_carbon,
        soil_type=reading_in.soil_type,
        notes=reading_in.notes,
        source=reading_in.source or "manual",
        device_id=reading_in.device_id,
        recorded_at=reading_in.recorded_at or datetime.utcnow()
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading

@router.post("/iot/reading", response_model=SoilReadingResponse)
def receive_iot_sensor_reading(reading_in: SoilReadingCreate, db: Session = Depends(get_db)):
    """
    Extensible IoT Soil Sensor Endpoint.
    Allows real ESP32 / LoRaWAN soil moisture & NPK probes to push telemetry directly to KrishiMind backend.
    Stores reading with source='sensor'.
    """
    field = db.query(Field).filter(Field.id == reading_in.field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Target agricultural field not found for this IoT sensor")

    reading = SoilReading(
        field_id=reading_in.field_id,
        moisture=reading_in.moisture,
        ph=reading_in.ph,
        nitrogen=reading_in.nitrogen,
        phosphorus=reading_in.phosphorus,
        potassium=reading_in.potassium,
        soil_temperature=reading_in.soil_temperature,
        electrical_conductivity=reading_in.electrical_conductivity,
        organic_carbon=reading_in.organic_carbon,
        soil_type=reading_in.soil_type or field.soil_type,
        notes=reading_in.notes or f"Automated reading from IoT soil sensor {reading_in.device_id or 'ESP32'}",
        source="sensor",
        device_id=reading_in.device_id or "ESP32-SOIL-PROBE",
        recorded_at=reading_in.recorded_at or datetime.utcnow()
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading

@router.post("/extract-report")
async def extract_soil_report(
    file: UploadFile = File(...),
    field_id: Optional[str] = Form(None),
    language: str = Form("en"),
    db: Session = Depends(get_db)
):
    """
    Multimodal Document AI Soil Test Report Extraction:
    Accepts PDF, JPG, JPEG, PNG, WEBP soil test reports.
    Extracts detected chemical and physical values (pH, N, P, K, EC, Organic Carbon, Moisture, etc.).
    IMPORTANT: Does NOT auto-commit unverified data to PostgreSQL.
    Returns values to the farmer for review, correction, and explicit verification.
    """
    allowed_extensions = {"pdf", "jpg", "jpeg", "png", "webp"}
    filename = file.filename or "soil_report"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: PDF, JPG, JPEG, PNG, WEBP."
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    mime_map = {
        "pdf": "application/pdf",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp"
    }
    mime_type = mime_map.get(ext, "image/jpeg")
    b64_data = base64.b64encode(content).decode("utf-8")

    extracted_data = {
        "ph": None,
        "nitrogen": None,
        "phosphorus": None,
        "potassium": None,
        "electrical_conductivity": None,
        "organic_carbon": None,
        "moisture": None,
        "soil_temperature": None,
        "soil_type": None,
        "lab_name": None,
        "notes": None,
    }
    confidence = "MEDIUM"
    raw_summary = "Soil test report processed."

    if settings.GEMINI_API_KEY:
        system_instruction = (
            "You are a scientific agricultural soil test report analyzer for KrishiMind AI. "
            "Analyze the uploaded document or image of a Soil Health Card / Lab Soil Test Report. "
            "Extract available soil parameters accurately:\n"
            "- ph: float between 3.0 and 10.0 or null if not measured\n"
            "- nitrogen: float in kg/ha or mg/kg or null\n"
            "- phosphorus: float in kg/ha or mg/kg or null\n"
            "- potassium: float in kg/ha or mg/kg or null\n"
            "- electrical_conductivity: float in dS/m or mmhos/cm or null\n"
            "- organic_carbon: float in % (e.g. 0.55) or null\n"
            "- moisture: float in % or null\n"
            "- soil_temperature: float in °C or null\n"
            "- soil_type: string description if mentioned or null\n"
            "- lab_name: string of testing laboratory or soil testing facility\n"
            "- notes: brief summary of ratings (e.g. 'Low Nitrogen, High Phosphorus')\n"
            "- confidence: 'HIGH' | 'MEDIUM' | 'LOW'\n"
            "CRITICAL PRINCIPLE: Never fabricate or guess numbers. If a field was not tested or is unreadable, set it to null.\n"
            "Return ONLY valid JSON matching this schema: "
            '{"ph": float|null, "nitrogen": float|null, "phosphorus": float|null, "potassium": float|null, '
            '"electrical_conductivity": float|null, "organic_carbon": float|null, "moisture": float|null, '
            '"soil_temperature": float|null, "soil_type": string|null, "lab_name": string|null, '
            '"notes": string|null, "confidence": "HIGH"|"MEDIUM"|"LOW", "raw_summary": string}'
        )

        prompt_text = "Extract soil parameters from this laboratory report document. Do not invent missing values."
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        body = {
            "contents": [{
                "parts": [
                    {"text": prompt_text},
                    {"inline_data": {"mime_type": mime_type, "data": b64_data}}
                ]
            }],
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "generationConfig": {"responseMimeType": "application/json"}
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(gemini_url, json=body)
                if res.status_code == 200:
                    raw_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(raw_text)
                    extracted_data["ph"] = parsed.get("ph")
                    extracted_data["nitrogen"] = parsed.get("nitrogen")
                    extracted_data["phosphorus"] = parsed.get("phosphorus")
                    extracted_data["potassium"] = parsed.get("potassium")
                    extracted_data["electrical_conductivity"] = parsed.get("electrical_conductivity")
                    extracted_data["organic_carbon"] = parsed.get("organic_carbon")
                    extracted_data["moisture"] = parsed.get("moisture")
                    extracted_data["soil_temperature"] = parsed.get("soil_temperature")
                    extracted_data["soil_type"] = parsed.get("soil_type")
                    extracted_data["lab_name"] = parsed.get("lab_name")
                    extracted_data["notes"] = parsed.get("notes")
                    confidence = parsed.get("confidence", "HIGH")
                    raw_summary = parsed.get("raw_summary", "Report analyzed successfully.")
        except Exception as e:
            print(f"[Soil Report Extraction Error] {e}")
            raw_summary = "Automatic OCR extraction encountered an error; please verify values manually."
            confidence = "LOW"
    else:
        raw_summary = "AI extraction is running in offline mode. Please verify or input your lab values manually."
        confidence = "LOW"

    return {
        "filename": filename,
        "extracted": extracted_data,
        "confidence": confidence,
        "raw_summary": raw_summary,
        "verification_notice": "Please verify and correct these values before saving. Only verified values become official farmer data."
    }

@router.put("/{id}", response_model=SoilReadingResponse)
def update_soil_reading(id: str, reading_in: SoilReadingCreate, db: Session = Depends(get_db)):
    reading = db.query(SoilReading).filter(SoilReading.id == id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Soil reading not found")
    
    for key, val in reading_in.model_dump(exclude_unset=True).items():
        setattr(reading, key, val)
    db.commit()
    db.refresh(reading)
    return reading

@router.delete("/{id}")
def delete_soil_reading(id: str, db: Session = Depends(get_db)):
    reading = db.query(SoilReading).filter(SoilReading.id == id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Soil reading not found")
    db.delete(reading)
    db.commit()
    return {"message": "Soil reading deleted successfully"}
