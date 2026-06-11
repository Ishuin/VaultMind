from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class DocumentBase(BaseModel):
    filename: Optional[str] = None
    content_type: Optional[str] = None

# Properties to return via API
class Document(DocumentBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
