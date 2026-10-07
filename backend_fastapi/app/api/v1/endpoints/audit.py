from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api import deps
from app.models.audit_log import AuditLog
from app.services.audit_service import list_events

router = APIRouter()


def _serialize(event: AuditLog) -> Any:
    return {
        "id": event.id,
        "user_id": event.user_id,
        "action": event.action,
        "resource_type": event.resource_type,
        "resource_id": event.resource_id,
        "detail": event.detail,
        "ip": event.ip,
        "request_id": event.request_id,
        "created_at": event.created_at.isoformat() if event.created_at else None,
    }


@router.get("/")
def list_audit_events(
    request: Request,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    action: Optional[str] = Query(None, max_length=64),
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
) -> Any:
    """Audit trail of security-relevant actions.

    Regular users see only their own events; a superuser sees everything.
    """
    scope: Optional[int] = None if current_user.is_superuser else current_user.id
    events: List[AuditLog] = list_events(db, scope, limit, offset, action)
    return {"items": [_serialize(e) for e in events], "count": len(events)}
