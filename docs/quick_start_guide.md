# ThoughtWeb Navigator — Quick Start Guide

Quick start for running the ThoughtWeb Navigator app locally: a Python FastAPI backend and a React/Vite frontend.

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (or use the bundled `docker-compose.yml`)
- Ollama running locally (`http://127.0.0.1:11434`) for local LLM inference

## 1. Set Up the Backend

```bash
cd backend_fastapi
python -m venv .venv
.\.venv\Scripts\Activate.ps1     # Windows
pip install -r requirements.txt

cp .env.example .env             # then fill in your values
```

Start PostgreSQL:

```bash
docker compose up -d db          # runs pgvector on port 5433
```

Run the API:

```bash
python -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
```

Verify: <http://127.0.0.1:8000/health> → `{"status":"healthy"}`

## 2. Set Up the Frontend

```bash
cd frontend
npm install
cp .env.example .env             # VITE_API_URL defaults to http://127.0.0.1:8000/api/v1
npm run dev
```

Open <http://localhost:8080>.

## 3. One-Command Launcher (Windows)

```powershell
.\run-product.ps1
```

Launches the FastAPI backend and Vite frontend in two separate terminal windows.

## Troubleshooting

1. **Backend fails to start — DB connection refused**: make sure the `db` container is up and `DATABASE_URL` uses port `5433` (matches `docker-compose.yml`).
2. **Ollama warnings at startup**: the app runs without Ollama, but RAG queries need it. Install at <https://ollama.com> and pull a model (e.g. `llama3.2:1b`).
3. **Auth problems**: set `VITE_SUPABASE_BYPASS_REDIRECTS=true` in the frontend `.env` for local development only. Never use in production.

For more detail, see the [README](../README.md) and the [Documentation Index](./documentation_index.md).