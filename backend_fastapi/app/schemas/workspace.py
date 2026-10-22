from pydantic import BaseModel, EmailStr, Field


class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)


class WorkspaceResponse(BaseModel):
    id: int
    name: str
    role: str


class MemberAdd(BaseModel):
    email: EmailStr
    role: str = Field("member", pattern="^(viewer|member|admin)$")


class MemberUpdate(BaseModel):
    role: str = Field(..., pattern="^(viewer|member|admin|owner)$")


class MemberResponse(BaseModel):
    user_id: int
    email: EmailStr
    username: str
    role: str
