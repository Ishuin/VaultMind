from typing import Any, Optional

from fastapi import APIRouter, Depends

from app.api import deps
from app.core.logging import get_recent_logs

router = APIRouter()


@router.get("/logs")
def read_logs(
    limit: int = 200,
    level: Optional[str] = None,
    current_user=Depends(deps.get_current_user),
) -> Any:
    """Recent backend request/error log entries (in-memory ring buffer)."""
    return {"entries": get_recent_logs(limit=min(limit, 500), level=level)}
