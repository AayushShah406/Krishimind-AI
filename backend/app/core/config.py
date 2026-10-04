import os
from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import Optional, List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishiMind AI"
    TAGLINE: str = "Smarter farming decisions with AI."
    API_V1_STR: str = "/api"
    
    # Security
    JWT_SECRET: str = "krishimind-super-secret-production-key-change-in-env-9823472"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (Defaults to SQLite for instant plug & play, PostgreSQL supported via DATABASE_URL)
    DATABASE_URL: str = "sqlite:///./krishimind.db"
    
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.7-flash"
    GEMINI_VISION_MODEL: str = "gemini-3.7-flash"
    
    # Vector Database Provider: 'pinecone' exclusively
    VECTOR_DB_PROVIDER: str = "pinecone"

    # Pinecone Vector DB
    PINECONE_API_KEY: Optional[str] = "pcsk_your_pinecone_api_key_here"
    PINECONE_INDEX_NAME: str = "krishimind-agricultural-rag"
    PINECONE_HOST: Optional[str] = None  # e.g. https://krishimind-agricultural-rag-xxxx.svc.aped-4627-b74a.pinecone.io
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_NAMESPACE: str = "agricultural-knowledge"
    
    # Weather API
    WEATHER_API_KEY: Optional[str] = None
    
    # S3 Object Storage (or local storage fallback)
    STORAGE_ENDPOINT: Optional[str] = None
    STORAGE_ACCESS_KEY: Optional[str] = None
    STORAGE_SECRET_KEY: Optional[str] = None
    STORAGE_BUCKET: str = "krishimind-crop-images"
    UPLOAD_DIR: str = "./uploads"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "*"]
    
    # Supported Languages
    SUPPORTED_LANGUAGES: Union[List[str], str] = ["en", "hi", "gu"]
    DEFAULT_LANGUAGE: str = "en"

    @field_validator("SUPPORTED_LANGUAGES", "CORS_ORIGINS", mode="before")
    @classmethod
    def parse_comma_separated(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    import json
                    return json.loads(v)
                except Exception:
                    pass
            return [x.strip() for x in v.split(",") if x.strip()]
        return v

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
