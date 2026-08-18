from typing import Literal
from loguru import logger

from app.core.config import settings


DBType = Literal["postgresql", "mysql", "sqlite"]


class DBSelectorService:
    """
    Central point for selecting the database backend.
    Individual modules should NOT choose their own database.
    """

    @staticmethod
    def detect_db_type() -> DBType:
        """
        Determine which database backend to use based on configuration availability.
        Priority: PostgreSQL > MySQL > SQLite fallback
        """
        db_url = (settings.DATABASE_URL or "").strip()
        if not db_url:
            logger.warning("DATABASE_URL not configured; falling back to SQLite.")
            return "sqlite"

        if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
            return "postgresql"
        if db_url.startswith("mysql://") or db_url.startswith("mysql+pymysql://"):
            return "mysql"
        if db_url.startswith("sqlite:///"):
            return "sqlite"

        logger.warning(f"Unrecognized DATABASE_URL scheme; falling back to SQLite: {db_url[:50]}")
        return "sqlite"

    @staticmethod
    def is_using_fallback() -> bool:
        """
        Returns True if the system is running on SQLite fallback instead of
        the configured primary database.
        """
        return DBSelectorService.detect_db_type() == "sqlite"

    @staticmethod
    def get_active_db_type() -> DBType:
        """
        Public accessor for the currently active database type.
        """
        return DBSelectorService.detect_db_type()


db_selector_service = DBSelectorService()
