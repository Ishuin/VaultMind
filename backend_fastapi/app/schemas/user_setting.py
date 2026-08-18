from pydantic import BaseModel
from typing import Any, Dict, Optional


class UserSettingsUpdate(BaseModel):
    values: Optional[Dict[str, Any]] = None
    temperature: Optional[float] = None
    selected_storage: Optional[str] = None
    search_internet: Optional[bool] = None


class UserSettingsResponse(BaseModel):
    user_id: int
    values: Dict[str, Any]
    temperature: Optional[float] = None
    selected_storage: Optional[str] = None
    search_internet: Optional[bool] = None

    class Config:
        orm_mode = True
