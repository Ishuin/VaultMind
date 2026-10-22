"""Workspace and membership management (B1).

Role matrix: any member may read a workspace; admin+ manages members;
only an owner may grant or revoke the owner role. Non-members always get 404.
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.crud.user import user as crud_user
from app.db.database import get_db
from app.models.workspace import ROLE_HIERARCHY, WorkspaceMember
from app.schemas.workspace import MemberAdd, MemberResponse, MemberUpdate, WorkspaceCreate
from app.services import workspace_service
from app.services.audit_service import record

router = APIRouter()


def path_workspace_ctx(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    """Resolve membership against the {workspace_id} PATH param (not the header).

    Non-members get 404; role gates then apply to this exact workspace.
    """
    return workspace_service.resolve(db, current_user, workspace_id)


def _get_member_or_404(db: Session, workspace_id: int, user_id: int) -> WorkspaceMember:
    member = workspace_service.get_membership(db, workspace_id, user_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member


def _count_owners(db: Session, workspace_id: int) -> int:
    return (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.role == "owner")
        .count()
    )


@router.post("/", response_model=schemas.WorkspaceResponse)
def create_workspace(
    request: Request,
    workspace_in: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Create a workspace; the caller becomes its owner."""
    ws = workspace_service.create_workspace(db, workspace_in.name, current_user.id)
    record(
        db,
        current_user.id,
        "workspace.create",
        resource_type="workspace",
        resource_id=ws.id,
        request=request,
        workspace_id=ws.id,
        detail={"name": ws.name},
    )
    return {"id": ws.id, "name": ws.name, "role": "owner"}


@router.get("/", response_model=List[schemas.WorkspaceResponse])
def list_workspaces(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """List workspaces the caller belongs to, with their role in each."""
    rows = (
        db.query(WorkspaceMember, models.Workspace)
        .join(models.Workspace, models.Workspace.id == WorkspaceMember.workspace_id)
        .filter(WorkspaceMember.user_id == current_user.id)
        .order_by(WorkspaceMember.id.asc())
        .all()
    )
    return [
        {"id": ws.id, "name": ws.name, "role": member.role} for member, ws in rows
    ]


@router.get("/{workspace_id}", response_model=schemas.WorkspaceResponse)
def get_workspace(
    ctx=Depends(path_workspace_ctx),
) -> Any:
    """Workspace detail; 404 for non-members (no existence leak)."""
    return {"id": ctx.workspace.id, "name": ctx.workspace.name, "role": ctx.role}


@router.get("/{workspace_id}/members", response_model=List[schemas.MemberResponse])
def list_members(
    ctx=Depends(path_workspace_ctx),
    db: Session = Depends(get_db),
) -> Any:
    """List members and their roles (any member may read)."""
    workspace_id = ctx.id
    rows = (
        db.query(WorkspaceMember, models.User)
        .join(models.User, models.User.id == WorkspaceMember.user_id)
        .filter(WorkspaceMember.workspace_id == workspace_id)
        .order_by(WorkspaceMember.id.asc())
        .all()
    )
    return [
        {
            "user_id": member.user_id,
            "email": user.email,
            "username": user.username,
            "role": member.role,
        }
        for member, user in rows
    ]


@router.post("/{workspace_id}/members", response_model=schemas.MemberResponse)
def add_member(
    request: Request,
    member_in: MemberAdd,
    ctx=Depends(path_workspace_ctx),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Add an existing user by email (admin+; 'owner' can only be granted via update)."""
    workspace_id = ctx.id
    workspace_service.require_role(ctx, "admin")
    target = crud_user.get_by_email(db, email=member_in.email)
    if not target:
        raise HTTPException(status_code=404, detail="No user with that email")
    if workspace_service.get_membership(db, workspace_id, target.id):
        raise HTTPException(status_code=400, detail="User is already a member")
    member = WorkspaceMember(
        workspace_id=workspace_id, user_id=target.id, role=member_in.role
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    record(
        db,
        current_user.id,
        "workspace.member_add",
        resource_type="workspace",
        resource_id=workspace_id,
        request=request,
        workspace_id=workspace_id,
        detail={"user_id": target.id, "role": member.role},
    )
    return {
        "user_id": target.id,
        "email": target.email,
        "username": target.username,
        "role": member.role,
    }


@router.patch("/{workspace_id}/members/{user_id}", response_model=schemas.MemberResponse)
def update_member_role(
    request: Request,
    user_id: int,
    member_in: MemberUpdate,
    ctx=Depends(path_workspace_ctx),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Change a member's role (admin+; granting 'owner' requires the caller to be owner)."""
    workspace_id = ctx.id
    workspace_service.require_role(ctx, "admin")
    if member_in.role == "owner":
        workspace_service.require_role(ctx, "owner")
    member = _get_member_or_404(db, workspace_id, user_id)
    if member.role == "owner" and member_in.role != "owner" and _count_owners(db, workspace_id) <= 1:
        raise HTTPException(
            status_code=400, detail="A workspace must keep at least one owner"
        )
    member.role = member_in.role
    db.commit()
    db.refresh(member)
    record(
        db,
        current_user.id,
        "workspace.member_update",
        resource_type="workspace",
        resource_id=workspace_id,
        request=request,
        workspace_id=workspace_id,
        detail={"user_id": user_id, "role": member.role},
    )
    target = crud_user.get(db, id=user_id)
    return {
        "user_id": user_id,
        "email": target.email if target else "",
        "username": target.username if target else "",
        "role": member.role,
    }


@router.delete("/{workspace_id}/members/{user_id}")
def remove_member(
    request: Request,
    user_id: int,
    ctx=Depends(path_workspace_ctx),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Remove a member (admin+; owners may only be removed by an owner)."""
    workspace_id = ctx.id
    workspace_service.require_role(ctx, "admin")
    member = _get_member_or_404(db, workspace_id, user_id)
    if member.role == "owner":
        workspace_service.require_role(ctx, "owner")
        if _count_owners(db, workspace_id) <= 1:
            raise HTTPException(
                status_code=400, detail="A workspace must keep at least one owner"
            )
    db.delete(member)
    db.commit()
    record(
        db,
        current_user.id,
        "workspace.member_remove",
        resource_type="workspace",
        resource_id=workspace_id,
        request=request,
        workspace_id=workspace_id,
        detail={"user_id": user_id},
    )
    return {"message": "Member removed"}
