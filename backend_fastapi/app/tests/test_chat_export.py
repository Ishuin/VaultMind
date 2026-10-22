"""Chat-export import (A1): ChatGPT/Claude parsers + end-to-end ingest."""
import io
import json
import zipfile

import pytest

from app.services.chat_export import parse_chat_export

CHATGPT_PAYLOAD = [
    {
        "title": "Kubernetes rollout help",
        "create_time": 1718000000.0,
        "mapping": {
            "n1": {"message": {"author": {"role": "user"}, "content": {"parts": ["How do I roll back a Helm chart?"]}, "create_time": 1718000001.0}},
            "n2": {"message": {"author": {"role": "assistant"}, "content": {"parts": ["Use `helm rollback <release> <revision>`."]}, "create_time": 1718000002.0}},
            "n3": {"message": {"author": {"role": "user"}, "content": {"parts": ["And list revisions?"]}, "create_time": 1718000003.0}},
            "n4": {"message": {"author": {"role": "assistant"}, "content": {"parts": ["`helm history <release>` shows every revision."]}, "create_time": 1718000004.0}},
            "n0": {"message": None},
        },
    },
    {
        "title": "Single turn stub",
        "create_time": 1718100000.0,
        "mapping": {
            "m1": {"message": {"author": {"role": "user"}, "content": {"parts": ["hi"]}, "create_time": 1718100001.0}},
        },
    },
]

CLAUDE_PAYLOAD = [
    {
        "name": "Rust ownership notes",
        "created_at": "2026-03-04T10:00:00Z",
        "chat_messages": [
            {"sender": "human", "text": "Explain borrow checker lifetimes briefly."},
            {"sender": "assistant", "text": "A borrow must not outlive the owner of the data."},
        ],
    },
]


def test_parse_chatgpt_json():
    """ChatGPT conversations.json parses; short stubs are skipped."""
    docs = parse_chat_export(json.dumps(CHATGPT_PAYLOAD).encode(), "conversations.json")
    assert len(docs) == 1, "single-turn stub must be filtered out"
    doc = docs[0]
    assert doc["title"] == "Kubernetes rollout help"
    assert doc["date"] == "2024-06-10"
    assert "User: How do I roll back a Helm chart?" in doc["text"]
    assert "Assistant: Use `helm rollback" in doc["text"]


def test_parse_chatgpt_zip():
    """A ChatGPT ZIP export works via its conversations.json member."""
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as zf:
        zf.writestr("conversations.json", json.dumps(CHATGPT_PAYLOAD))
    docs = parse_chat_export(buffer.getvalue(), "chatgpt-export.zip")
    assert [d["title"] for d in docs] == ["Kubernetes rollout help"]


def test_parse_claude_json():
    """Claude exports (name + chat_messages, human/assistant senders) parse."""
    docs = parse_chat_export(json.dumps(CLAUDE_PAYLOAD).encode(), "claude.json")
    assert len(docs) == 1
    assert docs[0]["title"] == "Rust ownership notes"
    assert "User: Explain borrow checker" in docs[0]["text"]
    assert "Assistant: A borrow must not outlive" in docs[0]["text"]


def test_parse_rejects_non_export_json():
    """Valid JSON that is not a chat export raises ValueError, not a crash."""
    with pytest.raises(ValueError):
        parse_chat_export(json.dumps({"foo": 1}).encode(), "random.json")


def test_parse_rejects_garbage():
    """Binary garbage raises ValueError."""
    with pytest.raises(ValueError):
        parse_chat_export(b"\x00\x01not json", "broken.json")


def test_upload_chat_export_end_to_end(client, make_user):
    """Uploading a ChatGPT export creates per-conversation chat_export sources
    with retrievable chunks in the vector store."""
    from app.db.lancedb import get_lancedb

    user = make_user(prefix="chatexp")
    payload = json.dumps(CHATGPT_PAYLOAD[:1]).encode()
    resp = client.post(
        "/api/v1/sources/upload",
        files={"file": ("chatgpt-export.json", payload, "application/json")},
        headers=user["headers"],
    )
    assert resp.status_code == 200, resp.text

    sources = client.get("/api/v1/sources/", headers=user["headers"]).json()
    names = [s["filename"] for s in sources if "::" in s["filename"]]
    assert any("Kubernetes rollout help" in n for n in names), names

    db = get_lancedb()
    rows = (
        db.open_table("document_chunks")
        .search()
        .where(f"user_id = {user['id']}")
        .limit(20)
        .to_list()
    )
    export_rows = [r for r in rows if "chat_export" in (r.get("metadata") or "")]
    assert export_rows, "chat export must produce vector chunks"
    assert any("Helm" in r["text"] or "helm" in r["text"] for r in export_rows)
