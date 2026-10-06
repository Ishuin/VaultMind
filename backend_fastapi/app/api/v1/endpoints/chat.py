from typing import Any, Optional
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from loguru import logger
import hashlib
import json

from app import models, schemas
from app.api import deps
from app.core.config import settings
from app.core.crypto import decrypt_key
from app.core.llm_errors import LLMProviderError
from app.services.llm_service import llm_service, NIM_FALLBACK_MODELS
from app.services.chat_service import chat_service
from app.crud.conversation import conversation as conversation_crud
from app.crud.chat_message import chat_message

router = APIRouter()

_CLOUD_PROVIDERS = {"openai", "anthropic", "claude", "openrouter", "nvidia", "nvidia nim"}

NIM_CACHE_TTL = timedelta(hours=24)


def _env_key(provider: str) -> Optional[str]:
    return {
        "openai": settings.OPENAI_API_KEY,
        "anthropic": settings.ANTHROPIC_API_KEY,
        "claude": settings.ANTHROPIC_API_KEY,
        "openrouter": settings.OPENROUTER_API_KEY,
        "nvidia": settings.NVIDIA_API_KEY,
        "nvidia nim": settings.NVIDIA_API_KEY,
    }.get(provider)


def stored_key(user: models.User, provider: Optional[str]) -> Optional[str]:
    """Resolve a user's server-stored (encrypted) BYOK key for a provider."""
    if not provider:
        return None
    raw = getattr(user, "api_keys", None)
    if not raw:
        return None
    try:
        data = json.loads(raw)
    except Exception:
        return None
    alias = "anthropic" if provider.lower() in ("anthropic", "claude") else provider.lower()
    cipher = data.get(alias)
    return decrypt_key(cipher) if cipher else None


def resolve_api_key(user: models.User, provider: Optional[str], per_request: Optional[str]) -> Optional[str]:
    """per-request override > server-stored user key (env fallback lives in llm_service)."""
    return per_request or stored_key(user, provider)


def _key_fingerprint(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()[:12]


def _read_nim_cache(user: models.User) -> Optional[dict]:
    raw = getattr(user, "nim_models_cache", None)
    if not raw:
        return None
    try:
        data = json.loads(raw)
        return data if isinstance(data, dict) else None
    except Exception:
        return None


def _cache_is_fresh(cache: Optional[dict], key: str) -> bool:
    """Fresh = has ids, matches this key, and is younger than NIM_CACHE_TTL."""
    if not cache or not cache.get("ids"):
        return False
    if cache.get("key_fp") != _key_fingerprint(key):
        return False
    try:
        checked = datetime.fromisoformat(cache["checked_at"])
    except Exception:
        return False
    if checked.tzinfo is None:
        checked = checked.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) - checked < NIM_CACHE_TTL


def _write_nim_cache(db: Session, user: models.User, key: str, ids: list) -> None:
    user.nim_models_cache = json.dumps({
        "ids": ids,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "key_fp": _key_fingerprint(key),
    })
    db.add(user)
    db.commit()
    db.refresh(user)


def _pretty_model_name(model_id: str) -> str:
    return model_id.split("/")[-1].replace("-", " ").replace("_", " ").title()

@router.get("/models")
async def get_models(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get available Ollama models.
    """
    return await llm_service.get_available_models()

@router.get("/nim-models")
async def get_nim_models(
    x_nvidia_api_key: Optional[str] = Header(None),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get NVIDIA NIM models THIS account can actually call.

    Cached on the user row for 24h. On a miss we probe the public catalog with
    empty messages (no tokens consumed) and keep only what returns 400.
    """
    key = x_nvidia_api_key or stored_key(current_user, "nvidia")
    if not key:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "missing_api_key",
                "message": "No NVIDIA NIM API key configured. Add it in Settings > API Keys.",
                "provider": "nvidia",
            },
        )

    cache = _read_nim_cache(current_user)

    if _cache_is_fresh(cache, key):
        ids = cache["ids"]
        logger.debug(f"NIM model list served from cache ({len(ids)} models)")
    else:
        try:
            ids = await llm_service.probe_nim_models(api_key=key)
            if ids:
                _write_nim_cache(db, current_user, key, ids)
        except Exception as e:
            # Probe failed (network/NVIDIA down) -> stale beats empty
            logger.error(f"NIM model probe failed: {type(e).__name__}: {e}")
            ids = (cache or {}).get("ids") or []

        if not ids:
            ids = list(NIM_FALLBACK_MODELS)

    return [{"id": mid, "name": _pretty_model_name(mid)} for mid in ids]

@router.get("/openrouter-models")
async def get_openrouter_models(
    x_openrouter_api_key: Optional[str] = Header(None),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get available OpenRouter models.
    """
    models_list = await llm_service.get_openrouter_models(api_key=x_openrouter_api_key or stored_key(current_user, "openrouter"))
    return [
        {
            "id": m.get("id"),
            "name": m.get("name") or m.get("id", "").split("/")[-1].replace("-", " ").title(),
        }
        for m in models_list
        if m.get("id")
    ]

@router.post("/query", response_model=schemas.ChatResponse)
async def query_knowledge_base(
    *,
    db: Session = Depends(deps.get_db),
    query_in: schemas.ChatQuery,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Query the knowledge base using RAG.
    """
    logger.info(f"API /chat/query reached by user {current_user.id}. Query: {query_in.query}")

    # Resolve search_internet: per-request override > user preference > default False
    search_internet = query_in.search_internet
    if search_internet is None:
        search_internet = getattr(current_user, "search_internet", False) or False

    # Resolve BYOK key: per-request override > server-stored user key > env fallback (in service)
    api_key = resolve_api_key(current_user, query_in.provider, query_in.api_key)
    provider = (query_in.provider or "").lower()
    if provider in _CLOUD_PROVIDERS and not api_key and not _env_key(provider):
        raise HTTPException(
            status_code=401,
            detail={
                "code": "missing_api_key",
                "message": f"No API key configured for {query_in.provider}. Add it in Settings > API Keys.",
                "provider": query_in.provider,
            },
        )

    # Resolve conversation_id: create new conversation if not provided
    conversation_id = query_in.conversation_id
    if conversation_id is None:
        new_convo = conversation_crud.create(db, current_user.id)
        conversation_id = new_convo.id

    # Save user message
    chat_message.create(db, conversation_id, "user", query_in.query)

    # Auto-title: if conversation has default title, set it from first message
    convo = conversation_crud.get_conversation(db, conversation_id, current_user.id)
    if convo and convo.title == "New Chat":
        title = query_in.query[:50].strip()
        if len(query_in.query) > 50:
            title += "..."
        conversation_crud.update_title(db, conversation_id, title)

    # Fetch conversation history for context
    history_messages = chat_message.get_last_messages(db, conversation_id, limit=20)
    # Reverse to get chronological order, exclude the just-added user message
    conversation_history = []
    for msg in reversed(history_messages[:-1]):  # exclude the last message (just added user msg)
        conversation_history.insert(0, {"role": msg.role, "content": msg.content})

    if query_in.stream:
        # For streaming, collect sources from chat_service and return them
        # after the stream completes
        collected_sources = []

        async def stream_and_save():
            full_response = ""
            try:
                async for chunk in chat_service.stream_chat_with_context(
                    query_in.query,
                    current_user.id,
                    model=query_in.model,
                    provider=query_in.provider,
                    api_key=api_key,
                    search_internet=search_internet,
                    conversation_history=conversation_history,
                ):
                    full_response += chunk
                    yield chunk
            except LLMProviderError as e:
                logger.error(f"Stream failed for provider={e.provider}: {e.message}")
                yield f"\n\n[ERROR {e.status_code}/{e.provider}] {e.message}"
                return
            # Save assistant response after streaming completes
            chat_message.create(db, conversation_id, "assistant", full_response)
            # Sources are stored on the generator's class attribute
            # For streaming, we embed sources in the response metadata
            # The frontend will parse the response for now

        return StreamingResponse(stream_and_save(), media_type="text/event-stream")

    try:
        response_text, sources = await chat_service.chat_with_context(
            query_in.query,
            current_user.id,
            model=query_in.model,
            provider=query_in.provider,
            api_key=api_key,
            search_internet=search_internet,
            conversation_history=conversation_history,
        )

        # Save assistant response
        chat_message.create(db, conversation_id, "assistant", response_text)

        return schemas.ChatResponse(
            response=response_text,
            context_used=True,
            conversation_id=conversation_id,
            sources=[schemas.Source(**s) for s in sources],
        )
    except LLMProviderError as e:
        logger.error(f"Chat query failed provider={e.provider} status={e.status_code}: {e.message}")
        raise HTTPException(
            status_code=e.status_code,
            detail={"code": e.code, "message": e.message, "provider": e.provider},
        )
    except Exception as e:
        logger.exception("Unexpected error generating AI response")
        raise HTTPException(
            status_code=500,
            detail={"code": "internal_error", "message": f"Error generating AI response: {str(e)}"},
        )
