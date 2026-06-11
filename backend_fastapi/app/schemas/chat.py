from typing import Optional, List
from pydantic import BaseModel

class ChatQuery(BaseModel):
    query: str
    model: Optional[str] = None
    provider: Optional[str] = None
    api_key: Optional[str] = None
    stream: bool = False
    search_internet: Optional[bool] = None
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    context_used: Optional[bool] = True
    conversation_id: Optional[int] = None
