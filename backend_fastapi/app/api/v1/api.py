from fastapi import APIRouter
from app.api.v1.endpoints import users, login, sources, chat

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
