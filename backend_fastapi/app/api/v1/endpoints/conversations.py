from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api import deps
from app import models, schemas
from app.db.database import get_db
from app.crud.conversation import conversation
from app.crud.chat_message import chat_message
from app.services.audit_service import record
from app.services import workspace_service

router = APIRouter()


@router.get("/", response_model=List[schemas.ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
    ctx=Depends(deps.workspace_context),
) -> Any:
    """List conversations of the active workspace"""
    convos = conversation.get_user_conversations(
        db, current_user.id, workspace_id=ctx.id
    )
    return convos


@router.post("/", response_model=schemas.ConversationResponse)
def create_conversation(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
    ctx=Depends(deps.workspace_context),
) -> Any:
    """Create a new conversation in the active workspace (member+)"""
    workspace_service.require_role(ctx, "member")
    convo = conversation.create(db, current_user.id, workspace_id=ctx.id)
    return convo


@router.get("/{conversation_id}", response_model=schemas.ConversationWithMessages)
def get_conversation(
    *,
    db: Session = Depends(get_db),
    conversation_id: int,
    current_user: models.User = Depends(deps.get_current_user),
    ctx=Depends(deps.workspace_context),
) -> Any:
    """Get a conversation with all messages (404 outside the active workspace)"""
    convo = conversation.get_conversation(
        db, conversation_id, current_user.id, workspace_id=ctx.id
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo


@router.delete("/{conversation_id}")
def delete_conversation(
    *,
    request: Request,
    db: Session = Depends(get_db),
    conversation_id: int,
    current_user: models.User = Depends(deps.get_current_user),
    ctx=Depends(deps.workspace_context),
) -> Any:
    """Delete a conversation (member+)"""
    workspace_service.require_role(ctx, "member")
    success = conversation.delete(
        db, conversation_id, current_user.id, workspace_id=ctx.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    record(
        db,
        current_user.id,
        "conversation.delete",
        resource_type="conversation",
        resource_id=conversation_id,
        request=request,
        workspace_id=ctx.id,
    )
    return {"message": "Conversation deleted"}


@router.patch("/{conversation_id}", response_model=schemas.ConversationResponse)
def update_conversation_title(
    *,
    db: Session = Depends(get_db),
    conversation_id: int,
    title: str,
    current_user: models.User = Depends(deps.get_current_user),
    ctx=Depends(deps.workspace_context),
) -> Any:
    """Update conversation title (member+)"""
    workspace_service.require_role(ctx, "member")
    convo = conversation.get_conversation(
        db, conversation_id, current_user.id, workspace_id=ctx.id
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    updated = conversation.update_title(db, conversation_id, title)
    return updated
