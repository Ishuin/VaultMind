import json
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api import deps
from app.core.crypto import decrypt_key, encrypt_key, mask_key
from app.schemas.user import KeySetRequest
from app.services.audit_service import record

router = APIRouter()

ALLOWED_PROVIDERS = {"openai", "anthropic", "openrouter", "nvidia", "google", "mistral", "huggingface"}


def _load(user) -> Dict[str, str]:
    raw = getattr(user, "api_keys", None)
    if not raw:
        return {}
    try:
        data = json.loads(raw)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


@router.get("/me/keys")
def get_api_keys(current_user=Depends(deps.get_current_user)) -> Any:
    """Return configured state + masked values for every provider. Never plaintext."""
    stored = _load(current_user)
    out: Dict[str, Any] = {}
    for provider in sorted(ALLOWED_PROVIDERS):
        cipher = stored.get(provider)
        plain = decrypt_key(cipher) if cipher else None
        out[provider] = {"configured": bool(plain), "masked": mask_key(plain) if plain else None}
    return out


@router.put("/me/keys/{provider}")
def set_api_key(
    request: Request,
    provider: str,
    body: KeySetRequest,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
) -> Any:
    """Store (encrypted) or replace a provider API key for the current user."""
    provider = provider.lower()
    if provider not in ALLOWED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unknown provider '{provider}'")
    key = body.key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="Key must not be empty")
    if len(key) > 256:
        raise HTTPException(status_code=400, detail="Key too long")
    stored = _load(current_user)
    stored[provider] = encrypt_key(key)
    current_user.api_keys = json.dumps(stored)
    if provider == "nvidia":
        # New key => new NVIDIA account => entitlements must be re-probed
        current_user.nim_models_cache = None
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    record(
        db,
        current_user.id,
        "api_key.set",
        resource_type="provider",
        resource_id=provider,
        request=request,
    )
    return {"provider": provider, "configured": True, "masked": mask_key(key)}


@router.delete("/me/keys/{provider}")
def delete_api_key(
    request: Request,
    provider: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
) -> Any:
    """Remove a stored provider API key."""
    provider = provider.lower()
    if provider not in ALLOWED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unknown provider '{provider}'")
    stored = _load(current_user)
    if provider in stored:
        stored.pop(provider)
        current_user.api_keys = json.dumps(stored)
        if provider == "nvidia":
            current_user.nim_models_cache = None
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        record(
            db,
            current_user.id,
            "api_key.delete",
            resource_type="provider",
            resource_id=provider,
            request=request,
        )
    return {"provider": provider, "configured": False}
