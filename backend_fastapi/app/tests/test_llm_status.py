"""A4 local-first SLM mode: Ollama detection/status endpoint."""
import httpx
import pytest

from app.services import llm_service as llm_module


@pytest.mark.asyncio
async def test_status_reports_reachable_ollama(monkeypatch, client, make_user):
    """With a live Ollama, status reports reachable + models + a default model."""
    fake_models = [{"name": "llama3.2:1b"}, {"name": "qwen2.5:3b"}]

    async def fake_get(self):
        return [m["name"] for m in fake_models]

    monkeypatch.setattr(llm_module.llm_service.__class__, "get_available_models", fake_get)

    user = make_user(prefix="llmstatus")
    resp = client.get("/api/v1/llm/status", headers=user["headers"])
    assert resp.status_code == 200
    data = resp.json()
    assert data["ollama_reachable"] is True
    assert data["local_processing"] is True
    assert data["models"] == ["llama3.2:1b", "qwen2.5:3b"]
    assert data["default_model"], "a reachable Ollama must suggest a default local model"


@pytest.mark.asyncio
async def test_status_reports_unreachable_ollama(monkeypatch, client, make_user):
    """When Ollama is down, status reports unreachable with no default model."""
    async def fake_get(self):
        return []

    monkeypatch.setattr(llm_module.llm_service.__class__, "get_available_models", fake_get)

    user = make_user(prefix="llmdown")
    resp = client.get("/api/v1/llm/status", headers=user["headers"])
    assert resp.status_code == 200
    data = resp.json()
    assert data["ollama_reachable"] is False
    assert data["local_processing"] is False
    assert data["default_model"] is None
    assert data["models"] == []


def test_status_requires_auth(client):
    """The status endpoint is authenticated like the rest of the app."""
    assert client.get("/api/v1/llm/status").status_code in (401, 403)


def test_get_available_models_handles_connection_error(monkeypatch):
    """Detection never raises: a dead Ollama is treated as 'no models'."""
    def fake_get(url, *a, **k):
        raise httpx.ConnectError("refused")

    class FakeAsyncClient:
        def __init__(self, *a, **k):
            pass
        async def __aenter__(self):
            return self
        async def __aexit__(self, *a):
            return False
        async def get(self, url):
            raise httpx.ConnectError("refused")

    monkeypatch.setattr("httpx.AsyncClient", FakeAsyncClient)
    import asyncio
    result = asyncio.run(llm_module.llm_service.get_available_models())
    assert result == [], "a connection error must yield an empty list, not a crash"
