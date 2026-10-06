from fastapi import APIRouter
from app.api.v1.endpoints import users, login, sources, chat, subscription, waitlist, conversations, keys, logs

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(keys.router, prefix="/users", tags=["keys"])
api_router.include_router(logs.router, tags=["logs"])
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(subscription.router, prefix="/subscription", tags=["subscription"])
api_router.include_router(waitlist.router, prefix="/waitlist", tags=["waitlist"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
