"""Local-first (Ollama) status endpoint for the setup wizard."""
from typing import Any
from fastapi import APIRouter, Depends
from app.api import deps
from app.core.config import settings
from app.models import User
from app.services.llm_service import llm_service

router = APIRouter()


@router.get("/status")
async def llm_status(current_user: User = Depends(deps.get_current_user)) -> Any:
    """Report whether a local Ollama instance is reachable and which models it has.

    Powers the local-first setup wizard: detection, model listing, and the
    default local model. `local_processing` is True whenever Ollama is reachable
    so the UI can show the "data stays on this machine" indicator.
    """
    models = await llm_service.get_available_models()
    return {
        "ollama_reachable": bool(models),
        "models": models,
        "default_model": settings.OLLAMA_MODEL if models else None,
        "base_url": settings.OLLAMA_BASE_URL,
        "local_processing": bool(models),
    }
