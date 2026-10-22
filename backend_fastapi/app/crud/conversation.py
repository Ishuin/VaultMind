from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.conversation import Conversation


class CRUDConversation:
    def get_user_conversations(
        self, db: Session, user_id: int, workspace_id: Optional[int] = None
    ) -> List[Conversation]:
        query = db.query(Conversation).filter(Conversation.user_id == user_id)
        if workspace_id is not None:
            query = query.filter(Conversation.workspace_id == workspace_id)
        return query.order_by(desc(Conversation.updated_at)).all()

    def get_conversation(
        self, db: Session, conversation_id: int, user_id: int,
        workspace_id: Optional[int] = None,
    ) -> Optional[Conversation]:
        query = db.query(Conversation).filter(
            Conversation.id == conversation_id, Conversation.user_id == user_id
        )
        if workspace_id is not None:
            query = query.filter(Conversation.workspace_id == workspace_id)
        return query.first()

    def create(
        self, db: Session, user_id: int, title: str = "New Chat",
        workspace_id: Optional[int] = None,
    ) -> Conversation:
        conversation = Conversation(user_id=user_id, title=title, workspace_id=workspace_id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    def update_title(self, db: Session, conversation_id: int, title: str) -> Optional[Conversation]:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conversation:
            conversation.title = title
            db.commit()
            db.refresh(conversation)
        return conversation

    def delete(
        self, db: Session, conversation_id: int, user_id: int,
        workspace_id: Optional[int] = None,
    ) -> bool:
        conversation = self.get_conversation(db, conversation_id, user_id, workspace_id)
        if not conversation:
            return False
        db.delete(conversation)
        db.commit()
        return True


conversation = CRUDConversation()
