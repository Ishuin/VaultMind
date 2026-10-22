"""Workspace scoping and role checks (B1).

Every ownership filter resolves through `resolve()`: an explicit workspace id
(membership verified) or the user's personal workspace. Non-members get 404 —
a workspace they cannot see must not be distinguishable from a missing one.
"""
from dataclasses import dataclass
from typing import Optional, Tuple

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.workspace import ROLE_HIERARCHY, Workspace, WorkspaceMember

PERSONAL_WORKSPACE_SUFFIX = "'s workspace"


def role_rank(role: str) -> int:
    """Numeric rank of a role; unknown roles rank below everything."""
    return ROLE_HIERARCHY.index(role) if role in ROLE_HIERARCHY else -1


@dataclass
class WorkspaceContext:
    """Resolved workspace + the caller's role in it."""

    workspace: Workspace
    role: str

    @property
    def id(self) -> int:
        return self.workspace.id


def get_membership(db: Session, workspace_id: int, user_id: int) -> Optional[WorkspaceMember]:
    """Return the membership row or None."""
    return (
        db.query(WorkspaceMember)
        .filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
        .first()
    )


def create_workspace(db: Session, name: str, owner_id: int) -> Workspace:
    """Create a workspace and make `owner_id` its owner."""
    ws = Workspace(name=name)
    db.add(ws)
    db.flush()
    db.add(WorkspaceMember(workspace_id=ws.id, user_id=owner_id, role="owner"))
    db.commit()
    db.refresh(ws)
    return ws


def get_or_create_personal_workspace(db: Session, user: User) -> Workspace:
    """Idempotently ensure the user has their personal workspace (owner role)."""
    row = (
        db.query(WorkspaceMember, Workspace)
        .join(Workspace, Workspace.id == WorkspaceMember.workspace_id)
        .filter(WorkspaceMember.user_id == user.id)
        .order_by(WorkspaceMember.id.asc())
        .first()
    )
    if row:
        return row[1]
    return create_workspace(db, f"{user.username}{PERSONAL_WORKSPACE_SUFFIX}", user.id)


def resolve(
    db: Session, user: User, workspace_id: Optional[int] = None
) -> WorkspaceContext:
    """Resolve the active workspace for a request.

    Explicit id: membership required, else 404 (never 403 — no existence leak).
    No id: the user's personal workspace (created on demand).
    """
    if workspace_id is None:
        ws = get_or_create_personal_workspace(db, user)
        member = get_membership(db, ws.id, user.id)
        return WorkspaceContext(workspace=ws, role=member.role if member else "owner")

    member = get_membership(db, workspace_id, user.id)
    if not member:
        raise HTTPException(status_code=404, detail="Workspace not found")
    ws = db.get(Workspace, workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return WorkspaceContext(workspace=ws, role=member.role)


def require_role(ctx: WorkspaceContext, minimum: str) -> None:
    """Raise 403 unless the caller's role is at least `minimum`."""
    if role_rank(ctx.role) < role_rank(minimum):
        raise HTTPException(
            status_code=403,
            detail=f"This action requires the '{minimum}' role or higher (you are '{ctx.role}').",
        )
