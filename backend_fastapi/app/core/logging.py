import json
import sys
import time
import uuid
from collections import deque

from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware

BUFFER: deque = deque(maxlen=500)
_SENSITIVE = ("authorization", "api_key", "apikey", "token", "password", "x-api-key")


def _buffer_sink(message):
    r = message.record
    BUFFER.appendleft({
        "ts": time.time(),
        "level": r["level"].name,
        "source": "backend",
        "message": str(r["message"]).rstrip("\n"),
        "request_id": r["extra"].get("request_id"),
    })


def setup_logging():
    logger.remove()
    logger.add(sys.stderr, level="INFO", backtrace=False, diagnose=False)
    try:
        logger.add("logs/app.log", rotation="10 MB", retention="7 days", level="INFO")
    except Exception:
        pass
    logger.add(_buffer_sink, level="WARNING")


def get_recent_logs(limit: int = 200, level: str | None = None):
    out = []
    order = {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40, "CRITICAL": 50}
    min_level = order.get((level or "").upper(), 0)
    for e in BUFFER:
        if order.get(e["level"], 0) >= min_level:
            out.append(e)
        if len(out) >= limit:
            break
    return out


class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        rid = uuid.uuid4().hex[:12]
        start = time.perf_counter()
        user_id = self._user_id(request)
        try:
            response = await call_next(request)
        except Exception:
            duration = int((time.perf_counter() - start) * 1000)
            rid_var = rid
            BUFFER.appendleft({
                "ts": time.time(), "level": "ERROR", "source": "backend",
                "message": f"{request.method} {request.url.path} -> 500 unhandled",
                "request_id": rid_var, "method": request.method,
                "path": request.url.path, "status": 500, "duration_ms": duration,
                "user_id": user_id,
            })
            logger.opt(exception=True).error("Unhandled request error {rid}", rid=rid)
            raise
        duration = int((time.perf_counter() - start) * 1000)
        status = response.status_code
        entry = {
            "ts": time.time(), "level": "ERROR" if status >= 400 else "INFO",
            "source": "backend", "request_id": rid,
            "method": request.method, "path": request.url.path,
            "status": status, "duration_ms": duration, "user_id": user_id,
        }
        entry["message"] = f"{request.method} {request.url.path} -> {status} ({duration}ms)"
        BUFFER.appendleft(entry)
        response.headers["X-Request-ID"] = rid
        return response

    @staticmethod
    def _user_id(request):
        auth = request.headers.get("Authorization") or ""
        if not auth.startswith("Bearer "):
            return None
        try:
            import jwt
            from app.core.security import SECRET_KEY, ALGORITHM
            payload = jwt.decode(auth[7:], SECRET_KEY, algorithms=[ALGORITHM], options={"verify_signature": False})
            return payload.get("sub")
        except Exception:
            return None
