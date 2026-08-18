from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.services.db_selector_service import db_selector_service
from loguru import logger

if db_selector_service.is_using_fallback():
    logger.warning("Using SQLite fallback database.")
    engine = create_engine("sqlite:///./fallback.db", connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        settings.DATABASE_URL, pool_pre_ping=True
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
