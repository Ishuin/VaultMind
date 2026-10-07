from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.db.database import Base


class AuditLog(Base):
    """Append-only record of security-relevant user actions."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    action = Column(String(64), nullable=False, index=True)
    resource_type = Column(String(32), nullable=True)
    resource_id = Column(String(64), nullable=True)
    detail = Column(Text, nullable=True)
    ip = Column(String(64), nullable=True)
    request_id = Column(String(64), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
