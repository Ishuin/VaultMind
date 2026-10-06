from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ChatMessageCreate(BaseModel):
    role: str
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConversationWithMessages(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True
