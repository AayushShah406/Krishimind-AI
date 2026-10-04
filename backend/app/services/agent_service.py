from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import Farm, Field, Crop, SoilReading, IrrigationRecord, WeatherRecord, AIRecommendation, CropImage
from app.services.rag_service import rag_service
from app.services.weather_service import weather_service

class AgriculturalAgent:
    """
    Agricultural AI Agent with controlled tool calling:
    - get_farm_data()
    - get_field_data()
    - get_crop_data()
    - get_soil_data()
    - get_irrigation_history()
    - get_weather()
    - search_agricultural_knowledge()
    - analyze_crop_image()
    - get_recent_recommendations()
    """

    def __init__(self, db: Session):
        self.db = db

    def get_farm_data(self, farm_id: str) -> Optional[Dict[str, Any]]:
        farm = self.db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm:
            return None
        return {
            "farm_id": farm.id,
            "name": farm.name,
            "location": farm.location,
            "area": farm.area,
            "unit": farm.unit,
            "soil_type": farm.soil_type
        }

    def get_field_data(self, field_id: str) -> Optional[Dict[str, Any]]:
        field = self.db.query(Field).filter(Field.id == field_id).first()
        if not field:
            return None
        return {
            "field_id": field.id,
            "farm_id": field.farm_id,
            "name": field.name,
            "area": field.area,
            "soil_type": field.soil_type,
            "location": field.location or (field.farm.location if field.farm else "Gujarat, India")
        }

    def get_crop_data(self, field_id: str) -> Optional[Dict[str, Any]]:
        crop = self.db.query(Crop).filter(Crop.field_id == field_id, Crop.status == "ACTIVE").order_by(Crop.created_at.desc()).first()
        if not crop:
            return None
        return {
            "crop_id": crop.id,
            "name": crop.name,
            "variety": crop.variety,
            "growth_stage": crop.growth_stage,
            "planting_date": crop.planting_date.strftime("%Y-%m-%d"),
            "status": crop.status
        }

    def get_soil_data(self, field_id: str) -> Optional[Dict[str, Any]]:
        reading = self.db.query(SoilReading).filter(SoilReading.field_id == field_id).order_by(SoilReading.recorded_at.desc()).first()
        if not reading:
            return None
        return {
            "moisture": reading.moisture,
            "ph": reading.ph,
            "nitrogen": reading.nitrogen,
            "phosphorus": reading.phosphorus,
            "potassium": reading.potassium,
            "recorded_at": reading.recorded_at.strftime("%Y-%m-%d %H:%M")
        }

    def get_irrigation_history(self, field_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        records = self.db.query(IrrigationRecord).filter(IrrigationRecord.field_id == field_id).order_by(IrrigationRecord.date.desc()).limit(limit).all()
        return [
            {
                "date": r.date.strftime("%Y-%m-%d"),
                "amount": r.amount,
                "unit": r.unit,
                "method": r.method,
                "notes": r.notes
            }
            for r in records
        ]

    async def get_weather(self, field_id: str, location: str = None) -> Dict[str, Any]:
        field = self.db.query(Field).filter(Field.id == field_id).first()
        lat = field.latitude or (field.farm.latitude if field and field.farm else None)
        lon = field.longitude or (field.farm.longitude if field and field.farm else None)
        loc = location or (field.location if field else None) or (field.farm.location if field and field.farm else None)

        w = await weather_service.get_weather(lat=lat, lon=lon, location_name=loc, field_id=field_id)
        if not w:
            return {}
        return {
            "location": w.location,
            "temperature": w.temperature,
            "humidity": w.humidity,
            "rainfall": w.rainfall,
            "rain_probability": w.rain_probability,
            "wind_speed": w.wind_speed,
            "weather_condition": w.weather_condition,
            "interpretation": w.agricultural_interpretation
        }

    def search_agricultural_knowledge(self, query: str, crop: str = None, topic: str = None) -> List[Dict[str, Any]]:
        return rag_service.hybrid_search(query=query, crop=crop, topic=topic, top_k=3)

    def get_recent_recommendations(self, field_id: str, limit: int = 3) -> List[Dict[str, Any]]:
        recs = self.db.query(AIRecommendation).filter(AIRecommendation.field_id == field_id).order_by(AIRecommendation.created_at.desc()).limit(limit).all()
        return [
            {
                "type": r.type,
                "recommendation": r.recommendation,
                "confidence": r.confidence,
                "created_at": r.created_at.strftime("%Y-%m-%d")
            }
            for r in recs
        ]

    async def assemble_context(self, question: str, field_id: Optional[str] = None, farm_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Agent determines required tool calls based on question intent and available identifiers.
        """
        tools_called = []
        context = {
            "farm": None,
            "field": None,
            "crop": None,
            "soil": None,
            "irrigation_history": [],
            "weather": None,
            "knowledge_chunks": [],
            "recent_recommendations": []
        }

        # Resolve field if not provided but farm_id is
        if not field_id and farm_id:
            first_field = self.db.query(Field).filter(Field.farm_id == farm_id).first()
            if first_field:
                field_id = first_field.id

        if field_id:
            # 1. Field
            field_data = self.get_field_data(field_id)
            context["field"] = field_data
            tools_called.append("get_field_data()")

            # 2. Farm
            if field_data and field_data.get("farm_id"):
                context["farm"] = self.get_farm_data(field_data["farm_id"])
                tools_called.append("get_farm_data()")

            # 3. Crop
            crop_data = self.get_crop_data(field_id)
            context["crop"] = crop_data
            tools_called.append("get_crop_data()")

            # 4. Soil
            soil_data = self.get_soil_data(field_id)
            context["soil"] = soil_data
            tools_called.append("get_soil_data()")

            # 5. Irrigation history
            irrig_data = self.get_irrigation_history(field_id)
            context["irrigation_history"] = irrig_data
            tools_called.append("get_irrigation_history()")

            # 6. Weather
            loc = field_data.get("location") if field_data else "Ahmedabad, Gujarat"
            w_data = await self.get_weather(field_id, location=loc)
            context["weather"] = w_data
            tools_called.append("get_weather()")

            # 7. Recent recommendations
            context["recent_recommendations"] = self.get_recent_recommendations(field_id)
            tools_called.append("get_recent_recommendations()")

        # 8. RAG Search
        crop_name = context["crop"]["name"] if context["crop"] else None
        q_lower = question.lower()
        topic = None
        if any(w in q_lower for w in ["water", "irrig", "पानी", "सिंचाई", "પાણી"]):
            topic = "irrigation"
        elif any(w in q_lower for w in ["soil", "fertilizer", "nitrogen", "खाद", "ખાતર"]):
            topic = "soil management"
        elif any(w in q_lower for w in ["yellow", "disease", "pest", "रोग", "कीट", "જીવાત"]):
            topic = "disease information"

        chunks = self.search_agricultural_knowledge(question, crop=crop_name, topic=topic)
        context["knowledge_chunks"] = chunks
        tools_called.append("search_agricultural_knowledge()")

        context["tools_called"] = tools_called
        return context
