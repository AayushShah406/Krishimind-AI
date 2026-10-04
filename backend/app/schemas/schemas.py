from pydantic import BaseModel, EmailStr, Field as PField
from typing import Optional, List, Dict, Any
from datetime import datetime

# ----------------- AUTH & USER -----------------
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "FARMER"  # FARMER, ADVISOR, ADMIN
    preferred_language: Optional[str] = "en"
    location: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    preferred_language: str
    location: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    preferred_language: Optional[str] = None
    location: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- FARM -----------------
class FarmCreate(BaseModel):
    name: str
    location: str
    area: float
    unit: Optional[str] = "acres"
    soil_type: Optional[str] = "Sandy Loam"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None

class FarmUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    area: Optional[float] = None
    unit: Optional[str] = None
    soil_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None

class FarmResponse(BaseModel):
    id: str
    user_id: str
    name: str
    location: str
    area: float
    unit: str
    soil_type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    field_count: Optional[int] = 0
    crop_names: Optional[List[str]] = []
    latest_recommendation: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- FIELD -----------------
class FieldCreate(BaseModel):
    farm_id: str
    name: str
    area: float
    area_unit: Optional[str] = "acres"
    soil_type: Optional[str] = "Sandy Loam"
    irrigation_method: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None

class FieldUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[float] = None
    area_unit: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_method: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None

class FieldResponse(BaseModel):
    id: str
    farm_id: str
    name: str
    area: float
    area_unit: Optional[str] = "acres"
    soil_type: str
    irrigation_method: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    created_at: datetime
    current_crop: Optional[Dict[str, Any]] = None
    latest_soil: Optional[Dict[str, Any]] = None
    latest_weather: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# ----------------- CROP -----------------
class CropCreate(BaseModel):
    field_id: str
    name: str
    variety: str
    planting_date: datetime
    expected_harvest_date: Optional[datetime] = None
    growth_stage: str
    irrigation_method: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class CropUpdate(BaseModel):
    name: Optional[str] = None
    variety: Optional[str] = None
    planting_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None
    growth_stage: Optional[str] = None
    irrigation_method: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class CropResponse(BaseModel):
    id: str
    field_id: str
    name: str
    variety: str
    planting_date: datetime
    expected_harvest_date: Optional[datetime] = None
    growth_stage: str
    irrigation_method: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime
    field_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- SOIL -----------------
class SoilReadingCreate(BaseModel):
    field_id: str
    moisture: Optional[float] = None
    ph: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    soil_temperature: Optional[float] = None
    electrical_conductivity: Optional[float] = None
    organic_carbon: Optional[float] = None
    soil_type: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = "manual"
    device_id: Optional[str] = None
    recorded_at: Optional[datetime] = None

class SoilReadingResponse(BaseModel):
    id: str
    field_id: str
    moisture: Optional[float] = None
    ph: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    soil_temperature: Optional[float] = None
    electrical_conductivity: Optional[float] = None
    organic_carbon: Optional[float] = None
    soil_type: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = "manual"
    device_id: Optional[str] = None
    recorded_at: datetime

    class Config:
        from_attributes = True

# ----------------- IRRIGATION -----------------
class IrrigationRecordCreate(BaseModel):
    field_id: str
    amount: float
    unit: Optional[str] = "mm"
    method: str
    notes: Optional[str] = None
    date: Optional[datetime] = None

class IrrigationRecordResponse(BaseModel):
    id: str
    field_id: str
    date: datetime
    amount: float
    unit: str
    method: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- WEATHER -----------------
class WeatherResponse(BaseModel):
    field_id: Optional[str] = None
    location: str
    temperature: float
    humidity: float
    rainfall: float
    rain_probability: float
    wind_speed: float
    weather_condition: str
    forecast_24h: List[Dict[str, Any]] = []
    forecast_7d: List[Dict[str, Any]] = []
    agricultural_interpretation: str

# ----------------- AI RECOMMENDATION & CHAT -----------------
class AIAskRequest(BaseModel):
    field_id: Optional[str] = None
    farm_id: Optional[str] = None
    question: str
    language: Optional[str] = "en"  # en, hi, gu

class AIMediaResource(BaseModel):
    type: str  # "video" or "image"
    title: str
    url: str
    thumbnail_url: Optional[str] = None
    description: Optional[str] = None

class AIStructuredResponse(BaseModel):
    recommendation: str
    reason: str
    evidence: List[str]
    data_used: List[str]
    confidence: str  # HIGH, MEDIUM, LOW
    next_action: str
    warnings: List[str] = []
    language: str
    sources_used: List[Dict[str, str]] = []
    detailed_guide: Optional[List[str]] = []
    media_resources: Optional[List[AIMediaResource]] = []

class AIConversationResponse(BaseModel):
    id: str
    user_id: str
    field_id: Optional[str] = None
    question: str
    answer: str
    language: str
    confidence: str
    created_at: datetime
    structured_data: Optional[AIStructuredResponse] = None

    class Config:
        from_attributes = True

class AIRecommendationResponse(BaseModel):
    id: str
    field_id: str
    type: str
    recommendation: str
    reason: str
    confidence: str
    evidence: Optional[List[str]] = None
    data_used: Optional[List[str]] = None
    next_action: Optional[str] = None
    warnings: Optional[List[str]] = None
    language: Optional[str] = "en"
    created_at: datetime
    field_name: Optional[str] = None
    crop_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- IMAGE ANALYSIS -----------------
class ImageAnalysisResponse(BaseModel):
    id: str
    image_id: str
    image_url: str
    crop_detected: Optional[str] = None
    visual_observations: List[str] = []
    possible_causes: List[str] = []
    possible_disease: Optional[str] = None
    possible_pest_damage: Optional[str] = None
    possible_nutrient_deficiency: Optional[str] = None
    severity: str  # LOW, MODERATE, HIGH, CRITICAL
    recommendation: str
    recommended_next_steps: Optional[List[str]] = []
    prevention_measures: Optional[List[str]] = []
    confidence: str  # HIGH, MEDIUM, LOW
    is_confirmed_diagnosis: Optional[bool] = False
    diagnosis_disclaimer: Optional[str] = None
    retrieved_knowledge: Optional[List[Dict[str, Any]]] = []
    conversation_history: Optional[List[Dict[str, Any]]] = []
    evidence: Optional[List[str]] = []
    additional_information_needed: Optional[List[str]] = []
    language: str
    created_at: datetime
    crop_name: Optional[str] = None
    field_name: Optional[str] = None

    class Config:
        from_attributes = True

class CropImageResponse(BaseModel):
    id: str
    user_id: str
    field_id: Optional[str] = None
    crop_id: Optional[str] = None
    image_url: str
    question: Optional[str] = None
    status: str
    created_at: datetime
    analysis: Optional[ImageAnalysisResponse] = None

    class Config:
        from_attributes = True

class ImageFollowUpRequest(BaseModel):
    question: str
    language: Optional[str] = "en"

class ImageFollowUpResponse(BaseModel):
    answer: str
    language: str
    sources_used: List[Dict[str, Any]] = []
    conversation_history: List[Dict[str, Any]] = []

# ----------------- KNOWLEDGE & RAG -----------------
class KnowledgeDocumentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    source: str
    document_type: str
    crop: Optional[str] = "All"
    region: Optional[str] = "Pan-India"
    language: Optional[str] = "en"

class KnowledgeDocumentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    source: str
    document_type: str
    crop: Optional[str] = None
    region: Optional[str] = None
    language: str
    status: str
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class RAGMonitoringStats(BaseModel):
    total_documents: int
    total_chunks: int
    indexed_chunks: int
    failed_chunks: int
    last_ingestion: Optional[datetime] = None
    retrieval_queries_today: int
    hybrid_search_latency_ms: float
    vector_db_status: str

# ----------------- NOTIFICATIONS -----------------
class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    language: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- ADMIN & ADVISOR -----------------
class AdminDashboardStats(BaseModel):
    total_users: int
    total_farmers: int
    total_advisors: int
    active_farms: int
    total_fields: int
    total_crops: int
    ai_recommendations_count: int
    image_analyses_count: int
    knowledge_documents_count: int
    rag_chunks_indexed: int
    system_health: str = "OPTIMAL"

class AdvisorDashboardStats(BaseModel):
    assigned_farmers_count: int
    total_farms_monitored: int
    fields_requiring_attention_count: int
    recent_recommendations_count: int
    urgent_alerts: List[Dict[str, Any]] = []

# ----------------- ADVISOR WORKSPACE SCHEMAS -----------------
class RecommendationReviewRequest(BaseModel):
    advisor_notes: str
    is_reviewed: Optional[bool] = True

class ImageAnalysisReviewRequest(BaseModel):
    advisor_notes: str

class FieldAssessmentRequest(BaseModel):
    question: Optional[str] = "Provide an expert field assessment and actionable guidance based on current soil telemetry, crop stage, and weather forecast."
    language: Optional[str] = "en"

# ----------------- ADMIN WORKSPACE SCHEMAS -----------------
class AdvisorAssignRequest(BaseModel):
    advisor_id: str
    farmer_id: str
    farm_id: Optional[str] = None
    field_id: Optional[str] = None
    notes: Optional[str] = None

class AdvisorAssignmentResponse(BaseModel):
    id: str
    advisor_id: str
    farmer_id: str
    farm_id: Optional[str] = None
    field_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    advisor_name: Optional[str] = None
    farmer_name: Optional[str] = None
    farm_name: Optional[str] = None
    field_name: Optional[str] = None

    class Config:
        from_attributes = True

class CropTypeCreate(BaseModel):
    name: str
    scientific_name: Optional[str] = None
    category: Optional[str] = "Cereal"
    varieties: Optional[List[str]] = []
    growth_stages: Optional[List[str]] = []
    water_requirement_mm: Optional[float] = None

class CropTypeUpdate(BaseModel):
    name: Optional[str] = None
    scientific_name: Optional[str] = None
    category: Optional[str] = None
    varieties: Optional[List[str]] = None
    growth_stages: Optional[List[str]] = None
    water_requirement_mm: Optional[float] = None
    is_active: Optional[bool] = None

class CropTypeResponse(BaseModel):
    id: str
    name: str
    scientific_name: Optional[str] = None
    category: str
    varieties: List[str] = []
    growth_stages: List[str] = []
    water_requirement_mm: Optional[float] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SystemNotificationCreate(BaseModel):
    title: str
    message: str
    type: Optional[str] = "system"
    user_id: Optional[str] = None  # None means broadcast to all
    language: Optional[str] = "en"

