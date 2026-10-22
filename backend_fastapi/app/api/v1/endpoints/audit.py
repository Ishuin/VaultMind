from typing import Any, Iterator, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api import deps
from app.models.audit_log import AuditLog
from app.services.audit_service import iter_events, list_events
import csv
import io
import json

router = APIRouter()


def _serialize(event: AuditLog) -> Any:
    return {
        "id": event.id,
        "user_id": event.user_id,
        "workspace_id": event.workspace_id,
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
    workspace_id: Optional[int] = Query(
        None, description="Filter to one workspace; must be a member of it"
    ),
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
) -> Any:
    """Audit trail of security-relevant actions.

    Regular users see only their own events; a superuser sees everything.
    An explicit workspace_id must belong to the caller (404 otherwise).
    """
    if workspace_id is not None and not current_user.is_superuser:
        from app.services.workspace_service import get_membership

        if not get_membership(db, workspace_id, current_user.id):
            raise HTTPException(status_code=404, detail="Workspace not found")
    scope: Optional[int] = None if current_user.is_superuser else current_user.id
    events: List[AuditLog] = list_events(db, scope, limit, offset, action, workspace_id)
    return {"items": [_serialize(e) for e in events], "count": len(events)}


_EXPORT_COLUMNS = (
    "id",
    "action",
    "resource_type",
    "resource_id",
    "detail",
    "ip",
    "request_id",
    "created_at",
)


def _export_row(event: AuditLog) -> dict:
    """One flat row for CSV/JSON export (created_at ISO-formatted)."""
    row = _serialize(event)
    return {column: row[column] for column in _EXPORT_COLUMNS}


def _csv_stream(events: Iterator[AuditLog]) -> Iterator[str]:
    """Yield the export as CSV text chunks (header + one line per event)."""
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=_EXPORT_COLUMNS)
    writer.writeheader()
    yield buffer.getvalue()
    for event in events:
        buffer.seek(0)
        buffer.truncate()
        writer.writerow(_export_row(event))
        yield buffer.getvalue()


def _json_stream(events: Iterator[AuditLog]) -> Iterator[str]:
    """Yield the export as one JSON array, streamed item by item."""
    yield "["
    first = True
    for event in events:
        payload = json.dumps(_export_row(event), default=str)
        yield ("" if first else ",") + payload
        first = False
    yield "]"


@router.get("/export")
def export_audit_events(
    request: Request,
    format: str = Query("json", pattern="^(csv|json)$"),
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
) -> Any:
    """Download the caller's own audit trail (always self-scoped, even for admins)."""
    events = iter_events(db, current_user.id)
    if format == "csv":
        return StreamingResponse(
            _csv_stream(events),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=audit_export_{current_user.id}.csv"
            },
        )
    return StreamingResponse(
        _json_stream(events),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=audit_export_{current_user.id}.json"
        },
    )
