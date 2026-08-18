from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.api import deps
from app import crud, models, schemas
from app.db.database import get_db
from app.crud.subscription import subscription
from app.crud.user_setting import user_setting
from app.schemas.user_setting import UserSettingsUpdate, UserSettingsResponse
from cryptography.fernet import Fernet, InvalidToken
import json

router = APIRouter()

_SETTINGS_SECRET_KEY_ENV = "USER_SETTINGS_SECRET_KEY"
_fernet = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        import os
        secret = os.environ.get(_SETTINGS_SECRET_KEY_ENV)
        if not secret:
            raise RuntimeError(f"Missing {_SETTINGS_SECRET_KEY_ENV} for encrypted user settings.")
        _fernet = Fernet(secret.encode("utf-8") if isinstance(secret, str) else secret)
    return _fernet


def _safe_parse_json(raw: str | None):
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:
        return {}


def _safe_dumps_json(value: dict):
    return json.dumps(value or {})


def _decrypt_if_possible(value: str):
    try:
        return _get_fernet().decrypt(value.encode("utf-8") if isinstance(value, str) else value).decode("utf-8")
    except Exception:
        return value


def _encrypt_if_string(value: str):
    try:
        return _get_fernet().encrypt(value.encode("utf-8")).decode("utf-8")
    except Exception:
        return value


def _map_settings_response(db_obj: models.UserSetting) -> UserSettingsResponse:
    values = _safe_parse_json(db_obj.values)
    # Never expose secrets to frontend; keep only benign flags here.
    safe_values = {
        k: v
        for k, v in values.items()
        if k in {"selected_storage", "search_internet", "temperature"}
    }
    return UserSettingsResponse(
        user_id=db_obj.user_id,
        values=safe_values,
        temperature=values.get("temperature"),
        selected_storage=values.get("selected_storage"),
        search_internet=values.get("search_internet"),
    )


def _apply_update(db_obj: models.UserSetting, payload: UserSettingsUpdate) -> models.UserSetting:
    values = _safe_parse_json(db_obj.values)
    if payload.values is not None:
        merged = dict(values)
        merged.update(payload.values)
        values = merged
    if payload.temperature is not None:
        values["temperature"] = payload.temperature
    if payload.selected_storage is not None:
        values["selected_storage"] = payload.selected_storage
    if payload.search_internet is not None:
        values["search_internet"] = payload.search_internet
    db_obj.values = _safe_dumps_json(values)
    return db_obj

@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve users.
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    try:
        user = crud.user.create(db, obj_in=user_in)
        
        # Auto-start a 7-day trial for new users
        trial_sub = subscription.create_trial(db, user.id)
        user.subscription_tier = "trial"
        user.trial_end_date = trial_sub.trial_end
        db.commit()
        db.refresh(user)
        
        return user
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Database integrity error: User with this email or username already exists."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred during user creation: {str(e)}"
        )

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.patch("/me/preferences", response_model=schemas.User)
def update_user_preferences(
    *,
    db: Session = Depends(deps.get_db),
    search_internet: bool,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update current user's preferences.
    """
    current_user.search_internet = search_internet
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/settings", response_model=UserSettingsResponse)
def read_user_settings(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    obj = crud.user_setting.get(db, current_user.id)
    if not obj:
        return UserSettingsResponse(user_id=current_user.id, values={})
    return _map_settings_response(obj)


@router.patch("/me/settings", response_model=UserSettingsResponse)
def update_user_settings(
    *,
    db: Session = Depends(deps.get_db),
    payload: UserSettingsUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    obj = crud.user_setting.get(db, current_user.id)
    if not obj:
        obj = models.UserSetting(user_id=current_user.id, values="{}")
        db.add(obj)
        db.commit()
        db.refresh(obj)
    updated = _apply_update(obj, payload)
    db.add(updated)
    db.commit()
    db.refresh(updated)
    return _map_settings_response(updated)


@router.delete("/me/settings/keys")
def delete_user_secret_keys(
    *,
    db: Session = Depends(deps.get_db),
    keys: list[str],
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    obj = crud.user_setting.remove_keys(db, current_user.id, keys)
    db.refresh(obj)
    return {"removed_keys": keys, "settings": _map_settings_response(obj)}


@router.post("/me/settings/keys", response_model=UserSettingsResponse)
def set_user_api_keys(
    *,
    db: Session = Depends(deps.get_db),
    payload: Dict[str, Any],
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    obj = crud.user_setting.get(db, current_user.id)
    if not obj:
        obj = models.UserSetting(user_id=current_user.id, values="{}")
        db.add(obj)
        db.commit()
        db.refresh(obj)

    values = _safe_parse_json(obj.values)
    encrypted = dict(values)
    for k, v in payload.items():
        if isinstance(v, str) and v.strip() == "":
            encrypted.pop(k, None)
        else:
            encrypted[k] = _encrypt_if_string(str(v))
    obj.values = _safe_dumps_json(encrypted)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return _map_settings_response(obj)


@router.get("/me/settings/key-status")
def get_user_api_key_status(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    values = crud.user_setting.get_values(db, current_user.id)
    status = {}
    for key in ["nvidia", "openrouter", "openai", "anthropic", "huggingface", "mistral", "google"]:
        status[key] = bool(values.get(key))
    return status
