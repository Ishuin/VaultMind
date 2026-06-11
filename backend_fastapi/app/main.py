from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.lancedb import init_lancedb
from app.db.database import engine, Base
from app.models import User, Document # Ensure models are imported for metadata

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.on_event("startup")
async def startup_event():
    # Create SQL tables
    Base.metadata.create_all(bind=engine)
    # Initialize LanceDB
    init_lancedb()
    
    # Check Ollama Connection
    from app.services.llm_service import llm_service
    models = await llm_service.get_available_models()
    if models:
        logger.info(f"Ollama connection successful. Found {len(models)} models.")
    else:
        logger.warning("Ollama connection failed or no models found. Check if Ollama is running.")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS]
    logger.info(f"CORS allowed origins: {origins}")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Fallback for development if origins are not set
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to ThoughtWeb Navigator API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
