# VaultMind (ThoughtWeb Navigator)

[![CI](https://github.com/Ishuin/VaultMind/actions/workflows/ci.yml/badge.svg)](https://github.com/Ishuin/VaultMind/actions/workflows/ci.yml)

A retrieval-activated knowledge system. Ingest your material, index it semantically, and
ask questions — answers come back **with citations to the exact source passage**.

Built as **one codebase, two products** (see [`docs/SPEC.md`](./docs/SPEC.md)):

1. **Personal second brain** — one private place for Gmail, Notion, documents, and AI
   assistant chat histories (ChatGPT/Claude exports), with your own key (BYOK) or a fully
   local model via Ollama.
2. **Enterprise knowledge base** — organizational memory over Slack, docs, email, and
   conversations, including **decision records** (what was decided, when, why, by whom),
   with roles, audit, and tenant isolation.

> This repo's operating docs: [`docs/SPEC.md`](./docs/SPEC.md) (what/why) ·
> [`PLAN.md`](./PLAN.md) (what's next, phase states, tests, bug protocol) ·
> [`AGENTS.md`](./AGENTS.md) (engineering standards + repo rules for any agent).

## Stack

| Layer     | Tech                              | Directory         |
|-----------|-----------------------------------|-------------------|
| Backend   | Python FastAPI, PostgreSQL, LanceDB, Ollama, NVIDIA NIM, OpenAI/Anthropic/OpenRouter | `backend_fastapi/` |
| Frontend  | React, TypeScript, Vite, Tailwind CSS, shadcn/ui | `frontend/`      |

## Features

- **RAG chat with citations** — streamed answers backed by retrieved chunks, each with a relevance score
- **Document ingestion** — PDF/DOCX/TXT → extract → chunk (~500 tok, 50 overlap) → embed (`all-MiniLM-L6-v2`) → LanceDB
- **Multi-provider LLMs** — Ollama (local), NVIDIA NIM, OpenAI, Anthropic, OpenRouter; model pickers per provider
- **BYOK** — per-user API keys stored Fernet-encrypted; API responses return masks only
- **Auth & RBAC** — JWT auth, `admin` role gates the user directory and full audit view
- **Tenant isolation** — every query scoped by `user_id`; vector search pre-filters on `user_id` before scoring
- **Audit log** — append-only `audit_logs` table: logins, key changes, deletes, payment events (with IP + request id)
- **Retrieval eval harness** — golden-set hit rate / MRR / recall with hard thresholds, non-zero exit on regression
- **Structured request logging** — `X-Request-ID` propagation + in-memory ring buffer at `GET /api/logs`
- **Subscriptions** — free/trial/founder/lifetime plans, Razorpay order → verify → webhook, waitlist
- **Dashboard** — sources, chat, analytics, knowledge network, pricing, security pages

## Repository Layout

```
├── backend_fastapi/       # FastAPI backend (REST API, RAG, auth, payments, audit)
│   ├── app/
│   │   ├── api/           # deps + v1 endpoints (users, keys, sources, chat, subscription, audit, ...)
│   │   ├── services/      # document, chat, LLM, vector, embedding, audit services
│   │   ├── eval/          # retrieval eval harness (golden.json + retrieval_eval.py)
│   │   ├── models/        # SQLAlchemy models (User, Document, Conversation, Subscription, AuditLog)
│   │   └── schemas/       # Pydantic schemas
│   ├── alembic/           # migrations (head: e3a7c9d14b2f)
│   ├── requirements.txt
│   └── .env.example       # Backend env template
├── frontend/              # React/Vite frontend (src: components, context, lib, pages)
├── docs/
│   ├── SPEC.md            # ← product + technical specification (source of truth)
│   └── *.md               # legacy planning docs (SPEC wins on conflict)
├── PLAN.md                # ← phase states, tests per phase, autonomous flow, bug protocol
├── AGENTS.md              # ← engineering standards + repo rules for AI agents
├── docker-compose.yml     # Local PostgreSQL (maps 5433 -> 5432)
├── run-product.ps1        # One-command dev launcher (backend + frontend)
└── .env.example           # Root env template
```

## Quick Start

### Prerequisites

- Python 3.13 with a virtual environment at `backend_fastapi/.venv`
- Node.js 18+
- PostgreSQL on port **5433** (`docker-compose.yml` up, or a local `thoughtweb_navigator` DB)
- Ollama (optional, for local models — absence is logged, not fatal)

### Run both services

```powershell
.\run-product.ps1
# Backend:  http://127.0.0.1:8000
# Frontend: http://localhost:8080
```

Or manually:

```powershell
# Terminal 1 — Backend
cd backend_fastapi
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1

# Terminal 2 — Frontend
cd frontend
npm run dev
```

If port 8000 looks wedged after a reload: `netstat -ano | Select-String ":8000"` → stop those PIDs, restart.

### Configuration

- Backend: `backend_fastapi/.env.example` → `backend_fastapi/.env` (DB URL, CORS, provider keys, limits)
- Frontend: `frontend/.env.example` → `frontend/.env` (`VITE_API_URL`, defaults to `http://127.0.0.1:8000/api/v1`)
- **Never commit `.env` files or print key values.**

## Database, migrations, evals, tests

```powershell
cd backend_fastapi

.\.venv\Scripts\python.exe -m alembic upgrade head        # apply migrations (single head)
.\.venv\Scripts\python.exe -m alembic check               # verify no model/DB drift
.\.venv\Scripts\python.exe -m app.eval.retrieval_eval     # retrieval quality gate (exit != 0 = regression)
.\.venv\Scripts\python.exe -m pytest                      # backend tests

cd ..\frontend
npm run build     # type-check + bundle
npm run lint      # baseline: 19 pre-existing errors — do not increase
npm test          # frontend tests
```

## API Endpoints

Base: `http://127.0.0.1:8000/api/v1` (JWT bearer unless noted). Full surface in [`docs/SPEC.md` §2.4](./docs/SPEC.md).

| Router        | Method + Path                              | Access / notes                              |
|---------------|--------------------------------------------|---------------------------------------------|
| Auth          | `POST /login/access-token`                 | public → JWT                                |
| Users         | `POST /users/`                             | public register (starts 7-day trial)        |
|               | `GET /users/`                              | **admin only** (403 otherwise)              |
|               | `GET /users/me`, `PATCH /users/me/preferences` | self                                  |
| Keys (BYOK)   | `GET /users/me/keys`                       | masked state per provider                   |
|               | `PUT/DELETE /users/me/keys/{provider}`     | encrypted at rest                           |
| Sources       | `GET /sources/`, `POST /sources/upload`, `DELETE /sources/{id}` | ownership-scoped   |
| Chat          | `POST /chat/query`                         | RAG, streaming (`[ERROR n/provider] msg` on failure) |
|               | `GET /chat/models` / `nim-models` / `openrouter-models` | per-provider catalogs        |
| Conversations | `GET/POST /conversations/`, `GET/DELETE /{id}` | ownership-scoped                     |
| Subscription  | `status`, `trial`, `plans`, `tiers`, `pricing`, `create-order`, `verify`, `cancel`, `webhook` | `plans/tiers/pricing` public; `webhook` = Razorpay |
| Audit         | `GET /audit/?action=&limit=&offset=`       | own events; admin sees all                   |
| Waitlist      | `POST /waitlist/subscribe`, `GET /waitlist/count` | public                               |
| Ops           | `GET /api/logs`, `/health`                 | request log ring buffer / health check       |

## Documentation

**Current (authoritative):**
- [Product & technical spec](./docs/SPEC.md) — two tracks, architecture, data model, security, glossary
- [Execution plan](./PLAN.md) — phase states, tests per phase, autonomous flow, bug/issue protocol
- [Agent rules](./AGENTS.md) — engineering standards, repo invariants, commands

**Legacy (context only):** [quick start](./docs/quick_start_guide.md) · [architecture](./docs/architecture.html) · [RAG](./docs/rag_implementation.md) · [deployment](./docs/deployment_guide.md) · [pricing](./docs/pricing.md) · [docs index](./docs/documentation_index.md)

## License

MIT
