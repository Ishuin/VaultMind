from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app import models, schemas
from app.db.database import get_db
from app.crud.conversation import conversation
from app.crud.chat_message import chat_message

router = APIRouter()


@router.get("/", response_model=List[schemas.ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """List all conversations for the current user"""
    convos = conversation.get_user_conversations(db, current_user.id)
    return convos


@router.post("/", response_model=schemas.ConversationResponse)
def create_conversation(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Create a new conversation"""
    convo = conversation.create(db, current_user.id)
    return convo


@router.get("/{conversation_id}", response_model=schemas.ConversationWithMessages)
def get_conversation(
    *,
    db: Session = Depends(get_db),
    conversation_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Get a conversation with all messages"""
    convo = conversation.get_conversation(db, conversation_id, current_user.id)
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo


@router.delete("/{conversation_id}")
def delete_conversation(
    *,
    db: Session = Depends(get_db),
    conversation_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Delete a conversation"""
    success = conversation.delete(db, conversation_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted"}


@router.patch("/{conversation_id}", response_model=schemas.ConversationResponse)
def update_conversation_title(
    *,
    db: Session = Depends(get_db),
    conversation_id: int,
    title: str,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Update conversation title"""
    convo = conversation.get_conversation(db, conversation_id, current_user.id)
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    updated = conversation.update_title(db, conversation_id, title)
    return updated
