import base64
import hashlib

from cryptography.fernet import Fernet

from app.core.config import settings
from app.core.security import SECRET_KEY

_KNOWN = None


def _fernet() -> Fernet:
    global _KNOWN
    if _KNOWN is None:
        key = settings.LLM_KEYS_FERNET_KEY
        if not key:
            key = base64.urlsafe_b64encode(hashlib.sha256(SECRET_KEY.encode()).digest()).decode()
        _KNOWN = Fernet(key.encode() if isinstance(key, str) else key)
    return _KNOWN


def encrypt_key(plain: str) -> str:
    return _fernet().encrypt(plain.encode()).decode()


def decrypt_key(cipher: str) -> str | None:
    try:
        return _fernet().decrypt(cipher.encode()).decode()
    except Exception:
        return None


def mask_key(plain: str) -> str:
    if not plain:
        return ""
    if len(plain) < 8:
        return "***"
    return f"{plain[:3]}...{plain[-4:]}"
