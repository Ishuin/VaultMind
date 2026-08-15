# ThoughtWeb Navigator

An AI-powered second brain application that helps users collect, organize, and query insights from their knowledge sources using Retrieval-Augmented Generation (RAG).

## Stack

| Layer     | Tech                              | Directory         |
|-----------|-----------------------------------|-------------------|
| Backend   | Python FastAPI, PostgreSQL, LanceDB, Ollama | `backend_fastapi/` |
| Frontend  | React, TypeScript, Vite, Tailwind CSS, shadcn/ui | `frontend/`      |

## Repository Layout

```
├── backend_fastapi/       # FastAPI backend (REST API, RAG, auth, payments)
│   ├── app/
│   │   ├── api/           # API endpoints (users, login, sources, chat, subscriptions)
│   │   ├── services/      # Business logic (document, chat, LLM, vector, embedding)
│   │   ├── models/        # SQLAlchemy models
│   │   └── schemas/       # Pydantic schemas
│   ├── alembic/           # Database migrations
│   └── requirements.txt
├── frontend/              # React/Vite frontend
│   └── src/
│       ├── components/    # Feature + UI components
│       ├── context/       # React context providers
│       ├── hooks/         # Custom hooks
│       ├── lib/           # API client & utilities
│       └── pages/         # Page components
├── docs/                  # Architecture & planning documents
├── docker-compose.yml     # Local PostgreSQL (pgvector)
├── run-product.ps1        # One-command dev launcher (backend + frontend)
└── .env.example           # Root env template
```

## Quick Start

### Prerequisites

- Python 3.10+ with a virtual environment in `backend_fastapi/.venv`
- Node.js 18+
- PostgreSQL (via `docker-compose.yml` or the docker-compose db service)
- Ollama running locally (for local LLM inference)

### Run Both Services

```powershell
.\run-product.ps1
# Backend:  http://127.0.0.1:8000
# Frontend: http://localhost:8080
```

Or run them manually:

```bash
# Terminal 1 - Backend
cd backend_fastapi
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Configuration

Copy the env templates and fill in values:

- Backend: `backend_fastapi/.env.example` → `backend_fastapi/.env`
- Frontend: `frontend/.env.example` → `frontend/.env`

The frontend expects the backend at `VITE_API_URL` (defaults to `http://127.0.0.1:8000/api/v1`). The local database runs on port 5433 by default (matches `docker-compose.yml`).

## Key Endpoints

- `POST /api/v1/login/access-token` - Authentication (JWT)
- `/api/v1/users/` - User management
- `/api/v1/sources/` - Document sources (upload, list, delete)
- `/api/v1/chat/` - RAG chat interface
- `/api/v1/subscriptions/` - Plan/payment management

## Documentation

- [Quick Start Guide](./docs/quick_start_guide.md)
- [Architecture](./docs/architecture.html)
- [RAG Implementation](./docs/rag_implementation.md)
- [Documentation Index](./docs/documentation_index.md)
- [Unified Product Strategy](./docs/unified_product_strategy.md)
- [Integration Plan](./docs/integration_plan.md)
- [Deployment Guide](./docs/deployment_guide.md)

## License

MIT