from pydantic import BaseModel, EmailStr
from datetime import datetime


class WaitlistBase(BaseModel):
    email: EmailStr


class WaitlistCreate(WaitlistBase):
    source: str = "landing_page"


class WaitlistResponse(WaitlistBase):
    id: int
    source: str
    created_at: datetime

    class Config:
        from_attributes = True
