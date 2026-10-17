import json
from typing import Any, Dict, List, Optional

from fastapi import Request
from loguru import logger
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

MAX_DETAIL_CHARS = 2000
DEFAULT_LIMIT = 50
MAX_LIMIT = 200


def client_ip(request: Optional[Request]) -> Optional[str]:
    if request is None:
        return None
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


def record(
    db: Session,
    user_id: Optional[int],
    action: str,
    *,
    resource_type: Optional[str] = None,
    resource_id: Optional[Any] = None,
    detail: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None,
) -> None:
    """Append one audit event. Call after any db.commit(). Never raises."""
    try:
        event = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            detail=json.dumps(detail, default=str)[:MAX_DETAIL_CHARS] if detail else None,
            ip=client_ip(request),
            request_id=request.headers.get("x-request-id") if request else None,
        )
        db.add(event)
        db.commit()
    except Exception as exc:
        db.rollback()
        logger.error(f"Audit write failed for action='{action}': {exc}")


def list_events(
    db: Session,
    user_id: Optional[int] = None,
    limit: int = DEFAULT_LIMIT,
    offset: int = 0,
    action: Optional[str] = None,
) -> List[AuditLog]:
    query = db.query(AuditLog)
    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)
    if action:
        query = query.filter(AuditLog.action == action)
    return (
        query.order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
        .offset(max(offset, 0))
        .limit(max(1, min(limit, MAX_LIMIT)))
        .all()
    )
