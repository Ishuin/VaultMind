# ThoughtWeb Navigator

An AI-powered second brain application that helps users collect, organize, and query insights from their knowledge sources using Retrieval-Augmented Generation (RAG).

## Stack

| Layer     | Tech                              | Directory         |
|-----------|-----------------------------------|-------------------|
| Backend   | Python FastAPI, PostgreSQL, LanceDB, Ollama, NVIDIA NIM, OpenRouter | `backend_fastapi/` |
| Frontend  | React, TypeScript, Vite, Tailwind CSS, shadcn/ui | `frontend/`      |

## Features

- **RAG-powered chat** - Query your documents with context retrieved from the vector store and citations back to source chunks
- **Multi-provider LLMs** - Model picker across Ollama (local), NVIDIA NIM, and OpenRouter (GPT-4o, Claude 3, Llama 3, Gemini, Mistral, and more)
- **Document ingestion** - Upload PDF, DOCX, or TXT files; text is extracted, chunked, embedded, and stored in LanceDB
- **Auth** - JWT token auth (register + login), password hashing via passlib/bcrypt
- **Conversations** - Save/load chat history per user
- **Subscriptions & payments** - Free/trial/founder/lifetime plans with Razorpay order + webhook flow, plus waitlist signup
- **Dashboard** - Sources, analytics, knowledge-network, and security pages

## Repository Layout

```
├── backend_fastapi/       # FastAPI backend (REST API, RAG, auth, payments)
│   ├── app/
│   │   ├── api/           # API endpoints (users, login, sources, chat, subscription, waitlist, conversations)
│   │   ├── services/      # Business logic (document, chat, LLM, vector, embedding)
│   │   ├── models/        # SQLAlchemy models (User, Document, Subscription)
│   │   └── schemas/       # Pydantic schemas
│   ├── requirements.txt
│   └── .env.example       # Backend env template
├── frontend/              # React/Vite frontend
│   ├── src/
│   │   ├── components/    # Feature + UI components (chat, sources, checkout, etc.)
│   │   ├── context/       # React context providers (AuthContext, AppContext)
│   │   ├── lib/           # API client & utilities
│   │   └── pages/         # Page components (Landing, Pricing, Dashboard, Sources, Settings, ...)
│   └── .env.example       # Frontend env template
├── docs/                  # Architecture & planning documents
├── docker-compose.yml     # Local PostgreSQL (maps 5433 -> 5432)
├── run-product.ps1        # One-command dev launcher (backend + frontend)
└── .env.example           # Root env template
```

## Quick Start

### Prerequisites

- Python 3.10+ with a virtual environment in `backend_fastapi/.venv`
- Node.js 18+
- PostgreSQL on port **5433** (start the `docker-compose.yml` db service, or use a local install with a `thoughtweb_navigator` database)
- Ollama running locally (for local LLM inference, e.g. `llama3.2:1b`)

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

Verify: `http://127.0.0.1:8000/health` should return `{"status": "healthy"}`.

### Configuration

Copy the env templates and fill in values:

- Backend: `backend_fastapi/.env.example` → `backend_fastapi/.env` (database URL, CORS origins)
- Frontend: `frontend/.env.example` → `frontend/.env` (`VITE_API_URL`)

The frontend expects the backend at `VITE_API_URL` (defaults to `http://127.0.0.1:8000/api/v1`). The local database runs on port 5433 (matches `docker-compose.yml`).

## API Endpoints

All endpoints live under `http://127.0.0.1:8000/api/v1`; health check is at `/health`.

| Router        | Method + Path                              | Description                                  |
|---------------|--------------------------------------------|----------------------------------------------|
| Auth          | `POST /login/access-token`                 | Login, returns JWT token                     |
| Users         | `GET /users/`                              | List users                                   |
|               | `POST /users/`                             | Register a new user                          |
|               | `GET /users/me`                            | Current user profile                         |
|               | `PATCH /users/me/preferences`              | Update user preferences                      |
| Sources       | `GET /sources/`                            | List user's documents                        |
|               | `POST /sources/upload`                     | Upload a document (PDF/DOCX/TXT, max 50MB)   |
|               | `DELETE /sources/{document_id}`            | Delete a document                            |
| Chat          | `GET /chat/models`                         | Models available from local Ollama           |
|               | `GET /chat/nim-models`                     | Models available from NVIDIA NIM             |
|               | `GET /chat/openrouter-models`              | Models available from OpenRouter             |
|               | `POST /chat/query`                         | RAG chat query (streaming)                   |
| Subscription  | `GET /subscription/status`                 | Current subscription status                  |
|               | `POST /subscription/trial`                 | Start a free trial                           |
|               | `GET /subscription/plans`                  | Available plans                              |
|               | `GET /subscription/tiers`                  | Subscription tiers                           |
|               | `GET /subscription/pricing`                | Pricing info                                 |
|               | `POST /subscription/create-order`          | Create a Razorpay order                      |
|               | `POST /subscription/verify`                | Verify a Razorpay payment                    |
|               | `POST /subscription/cancel`                | Cancel subscription                          |
| Waitlist      | `POST /waitlist/subscribe`                 | Join the waitlist                            |
|               | `GET /waitlist/count`                      | Waitlist signup count                        |
| Conversations | `GET /conversations/`                      | List conversations                           |
|               | `POST /conversations/`                     | Create a conversation                        |
|               | `GET /conversations/{conversation_id}`     | Get one conversation                         |
|               | `DELETE /conversations/{conversation_id}`  | Delete a conversation                        |

## Documentation

- [Quick Start Guide](./docs/quick_start_guide.md)
- [Architecture](./docs/architecture.html)
- [RAG Implementation](./docs/rag_implementation.md)
- [Documentation Index](./docs/documentation_index.md)
- [Unified Product Strategy](./docs/unified_product_strategy.md)
- [Integration Plan](./docs/integration_plan.md)
- [Deployment Guide](./docs/deployment_guide.md)
- [Pricing](./docs/pricing.md)

## License

MIT