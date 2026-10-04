import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.migrations import run_auto_migrations
from app.data.seed_data import seed_database

# Routers
from app.api.auth import router as auth_router, user_router
from app.api.farms import router as farms_router
from app.api.fields import router as fields_router
from app.api.crops import router as crops_router
from app.api.soil import router as soil_router
from app.api.irrigation import router as irrigation_router
from app.api.weather import router as weather_router
from app.api.ai import router as ai_router
from app.api.images import router as images_router
from app.api.knowledge import router as knowledge_router
from app.api.admin import router as admin_router
from app.api.advisor import router as advisor_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    run_auto_migrations(engine)
    
    # Ensure uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Seed initial data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="KrishiMind AI — Production-oriented AI AgriTech Decision Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for image uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers with /api prefix
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(user_router, prefix=api_prefix)
app.include_router(farms_router, prefix=api_prefix)
app.include_router(fields_router, prefix=api_prefix)
app.include_router(crops_router, prefix=api_prefix)
app.include_router(soil_router, prefix=api_prefix)
app.include_router(irrigation_router, prefix=api_prefix)
app.include_router(weather_router, prefix=api_prefix)
app.include_router(ai_router, prefix=api_prefix)
app.include_router(images_router, prefix=api_prefix)
app.include_router(knowledge_router, prefix=api_prefix)
app.include_router(admin_router, prefix=api_prefix)
app.include_router(advisor_router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "OPERATIONAL",
        "documentation": "/docs"
    }

@app.get("/health")
@app.get(f"{api_prefix}/health")
def health():
    return {"status": "ok", "service": "KrishiMind AI Engine"}
