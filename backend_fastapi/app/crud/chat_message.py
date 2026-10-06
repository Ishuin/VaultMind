from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.chat_message import ChatMessage


class CRUDChatMessage:
    def get_messages(self, db: Session, conversation_id: int) -> List[ChatMessage]:
        return (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id == conversation_id)
            .order_by(ChatMessage.created_at)
            .all()
        )

    def create(self, db: Session, conversation_id: int, role: str, content: str) -> ChatMessage:
        message = ChatMessage(conversation_id=conversation_id, role=role, content=content)
        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    def get_last_messages(self, db: Session, conversation_id: int, limit: int = 20) -> List[ChatMessage]:
        return (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id == conversation_id)
            .order_by(desc(ChatMessage.created_at))
            .limit(limit)
            .all()
        )


chat_message = CRUDChatMessage()
