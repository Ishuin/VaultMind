from typing import Optional
from sqlalchemy.orm import Session
from app.models.user_setting import UserSetting
from cryptography.fernet import Fernet, InvalidToken
import json
import os

_SETTINGS_SECRET_KEY_ENV = "USER_SETTINGS_SECRET_KEY"
_fernet = None

def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        from app.core.config import settings as _settings
        secret = _settings.USER_SETTINGS_SECRET_KEY
        if not secret:
            raise RuntimeError(f"Missing USER_SETTINGS_SECRET_KEY for encrypted user settings.")
        _fernet = Fernet(secret.encode("utf-8") if isinstance(secret, str) else secret)
    return _fernet


SECRET_KEYS = {
    "nvidia",
    "openrouter",
    "openai",
    "anthropic",
    "huggingface",
    "mistral",
    "google",
}


def get_decrypted_value(db: Session, user_id: int, key: str) -> Optional[str]:
    obj: Optional[UserSetting] = db.query(UserSetting).filter(UserSetting.user_id == user_id).first()
    if not obj or not obj.values:
        return None
    values = _safe_parse_json(obj.values)
    raw = values.get(key)
    if not raw or not isinstance(raw, str):
        return None
    try:
        return _get_fernet().decrypt(raw.encode("utf-8")).decode("utf-8")
    except InvalidToken:
        return raw
    except Exception:
        return raw


def set_encrypted_value(db: Session, user_id: int, key: str, value: str) -> UserSetting:
    obj = db.query(UserSetting).filter(UserSetting.user_id == user_id).first()
    values = _safe_parse_json(obj.values) if obj and obj.values else {}
    if value.strip() == "":
        values.pop(key, None)
    else:
        encrypted = _get_fernet().encrypt(value.encode("utf-8")).decode("utf-8")
        values[key] = encrypted
    if not obj:
        obj = UserSetting(user_id=user_id, values="{}")
        db.add(obj)
    obj.values = _safe_dumps_json(values or {})
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def remove_keys(db: Session, user_id: int, keys: list) -> UserSetting:
    obj = db.query(UserSetting).filter(UserSetting.user_id == user_id).first()
    values = _safe_parse_json(obj.values) if obj and obj.values else {}
    for k in keys:
        values.pop(k, None)
    if not obj:
        obj = UserSetting(user_id=user_id, values="{}")
        db.add(obj)
    obj.values = _safe_dumps_json(values or {})
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
