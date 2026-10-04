import uuid
import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), default="FARMER", nullable=False)  # FARMER, ADVISOR, ADMIN
    preferred_language = Column(String(10), default="en", nullable=False)  # en, hi, gu
    location = Column(String(150), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    farms = relationship("Farm", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("AIConversation", back_populates="user", cascade="all, delete-orphan")
    images = relationship("CropImage", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Farm(Base):
    __tablename__ = "farms"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(150), nullable=False)
    location = Column(String(200), nullable=False)
    area = Column(Float, nullable=False)
    unit = Column(String(20), default="acres")  # acres, hectares
    soil_type = Column(String(100), nullable=False)  # Alluvial, Black, Red, Sandy Loam, Clay Loam
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="farms")
    fields = relationship("Field", back_populates="farm", cascade="all, delete-orphan")

class Field(Base):
    __tablename__ = "fields"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    farm_id = Column(String(36), ForeignKey("farms.id"), nullable=False)
    name = Column(String(150), nullable=False)
    area = Column(Float, nullable=False)
    area_unit = Column(String(20), default="acres")
    soil_type = Column(String(100), nullable=False)
    irrigation_method = Column(String(50), nullable=True)  # Drip, Sprinkler, Flood, Furrow, Rainfed
    location = Column(String(200), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    farm = relationship("Farm", back_populates="fields")
    crops = relationship("Crop", back_populates="field", cascade="all, delete-orphan")
    soil_readings = relationship("SoilReading", back_populates="field", cascade="all, delete-orphan")
    irrigation_records = relationship("IrrigationRecord", back_populates="field", cascade="all, delete-orphan")
    weather_records = relationship("WeatherRecord", back_populates="field", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendation", back_populates="field", cascade="all, delete-orphan")
    images = relationship("CropImage", back_populates="field", cascade="all, delete-orphan")

class Crop(Base):
    __tablename__ = "crops"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=False)
    name = Column(String(100), nullable=False)  # Wheat, Rice, Cotton, Groundnut, Tomato, etc.
    variety = Column(String(100), nullable=False)
    planting_date = Column(DateTime, nullable=False)
    expected_harvest_date = Column(DateTime, nullable=True)
    growth_stage = Column(String(50), nullable=False)  # Germination, Tillering, Vegetative, Flowering, Grain Filling, Maturity, Harvest
    irrigation_method = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(30), default="ACTIVE")  # ACTIVE, HARVESTED, FALLOW
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    field = relationship("Field", back_populates="crops")
    images = relationship("CropImage", back_populates="crop", cascade="all, delete-orphan")

class SoilReading(Base):
    __tablename__ = "soil_readings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=False)
    moisture = Column(Float, nullable=True)  # % (e.g. 71.0)
    ph = Column(Float, nullable=True)        # (e.g. 6.8)
    nitrogen = Column(Float, nullable=True)  # kg/ha or mg/kg
    phosphorus = Column(Float, nullable=True)
    potassium = Column(Float, nullable=True)
    soil_temperature = Column(Float, nullable=True)
    electrical_conductivity = Column(Float, nullable=True)  # dS/m
    organic_carbon = Column(Float, nullable=True)           # %
    soil_type = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    source = Column(String(30), default="manual")  # 'manual', 'soil_report', 'sensor', 'external_estimate'
    device_id = Column(String(100), nullable=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    field = relationship("Field", back_populates="soil_readings")

class IrrigationRecord(Base):
    __tablename__ = "irrigation_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=False)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    amount = Column(Float, nullable=False)    # e.g. 35.0
    unit = Column(String(20), default="mm")   # mm, m3, liters
    method = Column(String(50), nullable=False) # Drip, Sprinkler, Flood, Furrow
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    field = relationship("Field", back_populates="irrigation_records")

class WeatherRecord(Base):
    __tablename__ = "weather_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=False)
    temperature = Column(Float, nullable=False)       # °C
    humidity = Column(Float, nullable=False)          # %
    rainfall = Column(Float, nullable=False)          # mm
    rain_probability = Column(Float, nullable=False)  # %
    wind_speed = Column(Float, nullable=False)        # km/h
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    field = relationship("Field", back_populates="weather_records")

class AIConversation(Base):
    __tablename__ = "ai_conversations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    confidence = Column(String(20), default="HIGH")  # HIGH, MEDIUM, LOW
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan")

class AIMessage(Base):
    __tablename__ = "ai_messages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("ai_conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    conversation = relationship("AIConversation", back_populates="messages")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=False)
    type = Column(String(50), nullable=False)  # Irrigation, Soil, Nutrient, Pest, Growth Stage
    recommendation = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    confidence = Column(String(20), default="HIGH")  # HIGH, MEDIUM, LOW
    evidence = Column(JSON, nullable=True)  # List of strings
    data_used = Column(JSON, nullable=True)  # List of data attributes
    next_action = Column(Text, nullable=True)
    warnings = Column(JSON, nullable=True)  # List of warnings
    language = Column(String(10), default="en")
    is_reviewed = Column(Boolean, default=False)
    advisor_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    field = relationship("Field", back_populates="recommendations")

class CropImage(Base):
    __tablename__ = "crop_images"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=True)
    crop_id = Column(String(36), ForeignKey("crops.id"), nullable=True)
    image_url = Column(String(500), nullable=False)
    question = Column(Text, nullable=True)
    status = Column(String(30), default="PENDING")  # PENDING, ANALYZED, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="images")
    field = relationship("Field", back_populates="images")
    crop = relationship("Crop", back_populates="images")
    analysis = relationship("ImageAnalysis", back_populates="crop_image", uselist=False, cascade="all, delete-orphan")

class ImageAnalysis(Base):
    __tablename__ = "image_analyses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    image_id = Column(String(36), ForeignKey("crop_images.id"), nullable=False)
    crop_detected = Column(String(100), nullable=True)
    visual_observations = Column(JSON, nullable=False)  # List of strings
    possible_causes = Column(JSON, nullable=False)       # List of strings
    possible_disease = Column(String(200), nullable=True)
    possible_pest_damage = Column(String(200), nullable=True)
    possible_nutrient_deficiency = Column(String(200), nullable=True)
    severity = Column(String(20), default="MODERATE")   # LOW, MODERATE, HIGH, CRITICAL
    recommendation = Column(Text, nullable=False)
    recommended_next_steps = Column(JSON, nullable=True)
    prevention_measures = Column(JSON, nullable=True)
    confidence = Column(String(20), default="MEDIUM")   # HIGH, MEDIUM, LOW
    is_confirmed_diagnosis = Column(Boolean, default=False)
    diagnosis_disclaimer = Column(Text, nullable=True)
    retrieved_knowledge = Column(JSON, nullable=True)
    conversation_history = Column(JSON, default=list, nullable=True)
    evidence = Column(JSON, nullable=True)
    additional_information_needed = Column(JSON, nullable=True)
    language = Column(String(10), default="en")
    advisor_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(36), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    crop_image = relationship("CropImage", back_populates="analysis")

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    source = Column(String(200), nullable=False)  # ICAR, State Agri Dept, FAO, TNAU
    document_type = Column(String(50), nullable=False)  # PDF, TXT, Markdown
    crop = Column(String(50), nullable=True)  # Wheat, Rice, Cotton, Groundnut, Tomato, All
    region = Column(String(100), nullable=True)  # Gujarat, Punjab, Maharashtra, Pan-India
    language = Column(String(10), default="en")
    status = Column(String(30), default="INDEXED")  # UPLOADED, PROCESSING, INDEXING, INDEXED, FAILED
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # weather_alert, irrigation_rec, ai_rec, analysis_done, system
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")

class AdvisorAssignment(Base):
    __tablename__ = "advisor_assignments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    advisor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    farmer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    farm_id = Column(String(36), ForeignKey("farms.id"), nullable=True)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    advisor = relationship("User", foreign_keys=[advisor_id])
    farmer = relationship("User", foreign_keys=[farmer_id])
    farm = relationship("Farm")
    field = relationship("Field")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # USER_CREATED, FARM_CREATED, AI_RECOMMENDATION_GENERATED, etc.
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CropType(Base):
    __tablename__ = "crop_types"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    scientific_name = Column(String(150), nullable=True)
    category = Column(String(50), default="Cereal")  # Cereal, Pulses, Oilseeds, Fiber, Vegetable
    varieties = Column(JSON, default=list)
    growth_stages = Column(JSON, default=list)
    water_requirement_mm = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

