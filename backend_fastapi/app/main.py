from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from app.core.config import settings
from app.core.logging import setup_logging, RequestLogMiddleware
from app.core.llm_errors import LLMProviderError
from app.api.v1.api import api_router
from app.db.lancedb import init_lancedb
from app.db.database import engine, Base, SessionLocal
from app.models import User, Document # Ensure models are imported for metadata

setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Request logging (added before CORS so CORS stays outermost)
app.add_middleware(RequestLogMiddleware)


@app.exception_handler(LLMProviderError)
async def llm_provider_error_handler(request: Request, exc: LLMProviderError):
    logger.error(f"LLM provider error provider={exc.provider} status={exc.status_code}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": {"code": exc.code, "message": exc.message, "provider": exc.provider}},
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception):
    rid = request.headers.get("X-Request-ID", "-")
    logger.opt(exception=True).error(f"Unhandled error on {request.url.path} (rid={rid})")
    return JSONResponse(
        status_code=500,
        content={"detail": {"code": "internal_error", "message": str(exc)}},
    )

@app.on_event("startup")
async def startup_event():
    # Create SQL tables
    Base.metadata.create_all(bind=engine)
    # Idempotent column patch for pre-existing databases (create_all never alters tables)
    ensure_user_api_keys_column()
    # Initialize LanceDB
    init_lancedb()
    
    # Check Ollama Connection
    from app.services.llm_service import llm_service
    models = await llm_service.get_available_models()
    if models:
        logger.info(f"Ollama connection successful. Found {len(models)} models.")
    else:
        logger.warning("Ollama connection failed or no models found. Check if Ollama is running.")
    
    # Start background scheduler for trial expiration
    start_trial_scheduler()


def start_trial_scheduler():
    """Start background scheduler for trial expiration checks"""
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from app.services.trial_service import trial_service
        
        scheduler = BackgroundScheduler()
        
        @scheduler.scheduled_job('interval', hours=1)
        def check_expired_trials():
            """Check for expired trials every hour"""
            db = SessionLocal()
            try:
                # Send expiry warnings (2 days before)
                import asyncio
                asyncio.run(trial_service.send_trial_expiry_warnings(db))
                
                # Process expired trials
                asyncio.run(trial_service.process_expired_trials(db))
                
                # Send paywall emails (1 day after expiry)
                asyncio.run(trial_service.send_paywall_emails(db))
                
            except Exception as e:
                logger.error(f"Error in trial scheduler: {e}")
            finally:
                db.close()
        
        scheduler.start()
        logger.info("Trial expiration scheduler started")
    except ImportError:
        logger.warning("APScheduler not installed. Trial expiration scheduler not started.")
    except Exception as e:
        logger.error(f"Failed to start trial scheduler: {e}")

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


def ensure_user_api_keys_column() -> None:
    """Add columns to existing databases (create_all never alters tables).

    Each entry is (table, column, ddl). Runs idempotently on every startup.
    """
    patches = [
        ("users", "api_keys", "TEXT"),
        ("users", "nim_models_cache", "TEXT"),
    ]
    try:
        from sqlalchemy import text
        from sqlalchemy import inspect as sa_inspect

        for table, column, ddl in patches:
            inspector = sa_inspect(engine)
            if table not in inspector.get_table_names():
                continue
            columns = {col["name"] for col in inspector.get_columns(table)}
            if column in columns:
                continue
            with engine.begin() as conn:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}"))
            logger.info(f"Added {table}.{column} column to existing database")
    except Exception as e:
        logger.error(f"Failed to apply schema patches: {e}")


@app.get("/")
async def root():
    return {"message": "Welcome to ThoughtWeb Navigator API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
