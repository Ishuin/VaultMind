"""Parse ChatGPT / Claude conversation-export files into ingestible text.

Handles the two export shapes:
  ChatGPT: a JSON array (or a ZIP containing ``conversations.json``) of objects
           each with ``title`` and ``mapping`` (message-id -> node) where nodes
           carry ``author.role`` and ``message.content.parts``.
  Claude:  a JSON array of objects with ``name``/``title`` and ``chat_messages``
           (``sender`` + ``text``), or a flat JSONL of ``{role, text}`` records.

Output is plain text with speaker + timestamp lines so the existing splitter,
embedder, and citation metadata treat it like any other document.
"""
import io
import json
import zipfile
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from loguru import logger

# A conversation with fewer turns than this is skipped (nav stubs, empty chats).
MIN_TURNS = 2
MAX_CHARS = 400_000  # guard against absurd single-conversation blowups


def _iso(ts: Any) -> str:
    """Render an epoch-float / ISO string timestamp as YYYY-MM-DD, else ''."""
    if ts is None:
        return ""
    try:
        if isinstance(ts, (int, float)):
            return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")
        return str(ts)[:10]
    except (ValueError, OSError, OverflowError):
        return ""


def _chatgpt_conversations(data: Any) -> List[Tuple[str, str, List[Dict[str, Any]]]]:
    """Yield (title, date, turns) from a ChatGPT conversations.json payload."""
    if not isinstance(data, list):
        return []
    out: List[Tuple[str, str, List[Dict[str, Any]]]] = []
    for convo in data:
        if not isinstance(convo, dict):
            continue
        mapping = convo.get("mapping")
        if not isinstance(mapping, dict):
            continue  # not a ChatGPT-shaped conversation
        title = (convo.get("title") or "Untitled conversation").strip()
        date = _iso(convo.get("create_time"))
        turns: List[Dict[str, Any]] = []
        nodes = [n for n in mapping.values() if isinstance(n, dict)]
        nodes.sort(key=lambda n: (n.get("message") or {}).get("create_time") or 0)
        for node in nodes:
            msg = node.get("message")
            if not isinstance(msg, dict):
                continue
            role = (msg.get("author") or {}).get("role")
            if role not in ("user", "assistant"):
                continue
            content = msg.get("content") or {}
            parts = content.get("parts") or []
            text = "\n".join(p for p in parts if isinstance(p, str)).strip()
            if text:
                turns.append({"role": role, "text": text})
        out.append((title, date, turns))
    return out


def _claude_conversations(data: Any) -> List[Tuple[str, str, List[Dict[str, Any]]]]:
    """Yield (title, date, turns) from a Claude export payload."""
    if not isinstance(data, list):
        return []
    out: List[Tuple[str, str, List[Dict[str, Any]]]] = []
    for convo in data:
        if not isinstance(convo, dict):
            continue
        raw_messages = convo.get("chat_messages") or convo.get("messages")
        if not isinstance(raw_messages, list):
            continue  # not a Claude-shaped conversation
        title = (convo.get("name") or convo.get("title") or "Untitled conversation").strip()
        date = _iso(convo.get("created_at") or convo.get("create_time"))
        turns: List[Dict[str, Any]] = []
        for msg in raw_messages:
            if not isinstance(msg, dict):
                continue
            sender = (msg.get("sender") or msg.get("role") or "").lower()
            role = "user" if sender in ("human", "user") else "assistant" if sender in ("assistant", "ai") else None
            if role is None:
                continue
            text = (msg.get("text") or msg.get("content") or "").strip()
            if isinstance(text, list):  # Claude sometimes ships content blocks
                text = "\n".join(b.get("text", "") for b in text if isinstance(b, dict)).strip()
            if text:
                turns.append({"role": role, "text": text})
        out.append((title, date, turns))
    return out


def _synthesise(title: str, date: str, turns: List[Dict[str, Any]]) -> str:
    """Render one conversation into marker-embedded plain text."""
    header = f"[SECTION:{title}] {title}"
    if date:
        header += f" (started {date})"
    lines = [header, ""]
    for turn in turns:
        speaker = "User" if turn["role"] == "user" else "Assistant"
        lines.append(f"{speaker}: {turn['text']}")
        lines.append("")
    return "\n".join(lines).strip()


def parse_chat_export(content: bytes, filename: str) -> List[Dict[str, str]]:
    """Parse an uploaded chat-export file.

    Returns a list of ``{"title", "date", "text"}`` dicts, one per conversation
    with at least MIN_TURNS turns. Raises ValueError when the file does not
    look like a chat export at all.
    """
    payload: Any = None
    name = (filename or "").lower()

    if name.endswith(".zip") or content[:2] == b"PK":
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as zf:
                member = next(
                    (n for n in zf.namelist() if n.lower().endswith(("conversations.json", "messages.json"))),
                    None,
                )
                if member is None:
                    raise ValueError("ZIP has no conversations.json / messages.json member")
                payload = json.loads(zf.read(member).decode("utf-8"))
        except zipfile.BadZipFile as exc:
            raise ValueError(f"Not a valid ZIP export: {exc}") from exc
    else:
        try:
            payload = json.loads(content.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError(f"Not a valid JSON chat export: {exc}") from exc

    parsed = _chatgpt_conversations(payload) or _claude_conversations(payload)
    if not parsed:
        raise ValueError("Unrecognised chat-export format (no conversations found)")

    docs: List[Dict[str, str]] = []
    for title, date, turns in parsed:
        if len(turns) < MIN_TURNS:
            continue
        text = _synthesise(title, date, turns)[:MAX_CHARS]
        docs.append({"title": title, "date": date, "text": text})

    if not docs:
        raise ValueError("Export contained no conversations with enough messages")
    logger.info(f"Parsed chat export '{filename}': {len(docs)} conversation(s)")
    return docs
