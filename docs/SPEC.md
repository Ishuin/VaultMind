# VaultMind — Product & Technical Specification

> Source of truth for what the product is, why it exists, and how the system is built.
> Implementation sequencing lives in `PLAN.md`. Agent operating rules live in `AGENTS.md`.
> Status tags: **[LIVE]** = shipped and usable, **[PARTIAL]** = works with gaps, **[PLANNED]** = designed, not built.

---

## 1. Product

**VaultMind** (internal codename: ThoughtWeb Navigator, domain: vaultmind.app) is a
retrieval-activated knowledge system. It ingests a user's or an organization's material,
indexes it semantically, and answers questions with citations back to the exact source
passage. It ships as **one codebase, two products**:

### 1.1 Track A — Personal Second Brain (P2P)
For individuals who want one private place for everything they know and have saved.

| Aspect | Definition |
|---|---|
| User | One person. Data belongs to them alone. |
| Sources | Gmail, Notion, personal docs (PDF/DOCX/TXT), browser/knowledge exports, and **chat histories with AI assistants** (ChatGPT, Claude exports). |
| Model | BYOK: their own OpenAI/Anthropic/OpenRouter/NVIDIA key, **or local SLM via Ollama** (no data leaves the machine). |
| Differentiator | Privacy. Local vector store, encrypted per-user keys, no vendor training, optional fully-local mode. |
| Monetization | Free tier → 7-day trial → founder tiers / lifetime / standard subscription. |

### 1.2 Track B — Enterprise Knowledge Base
For organizations that need institutional memory: what was decided, when, why, by whom.

| Aspect | Definition |
|---|---|
| User | An organization. Multiple members with roles. |
| Sources | Slack, company docs/wiki, shared drives, **email**, and meeting/conversation records — not only a docs page. |
| Derived knowledge | **Decision records**: an entity extracted from source material capturing *what* was decided, *when*, *why*, and *who* decided it, each linked to its originating passage. |
| Model | Tenant-scoped; BYOK or org-managed keys; local/on-prem deployment option. |
| Differentiator | Answers with provenance. Every claim cites a passage; every decision cites its origin and owner. |
| Compliance | Audit trail (who did what, when), role-based access, data residency. |

**Shared core (built once, both tracks):** ingestion pipeline, chunking, embedding,
vector store with per-user tenant pre-filter, citation-returning RAG chat, conversation
history, BYOK key management, audit log, RBAC foundation, subscriptions/payments.

---

## 2. Current System [LIVE]

### 2.1 Stack

| Layer | Tech | Path |
|---|---|---|
| Backend | Python 3.13, FastAPI, SQLAlchemy, Alembic | `backend_fastapi/` |
| Primary DB | PostgreSQL (users, documents, subscriptions, audit) | `DATABASE_URL` |
| Vector store | LanceDB, embedded, `user_id` pre-filter | `LANCEDB_URI=./.lancedb` |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` (384-dim, local) | `app/services/embedding_service.py` |
| LLMs | Ollama (local), NVIDIA NIM, OpenAI, Anthropic, OpenRouter, etc. | `app/services/llm_service.py` |
| Frontend | React 18, TypeScript, Vite, Tailwind, shadcn/ui | `frontend/` |
| Hosting | Backend: any container/host. Frontend: Netlify (`base: frontend`) | `frontend/netlify.toml` |

### 2.2 Data flow

```
Upload → extract text (PDF/DOCX/TXT) → chunk (~500 tok, 50 overlap) → embed (MiniLM)
      → LanceDB rows (text + vector + user_id + document_id)
Query  → embed question → top-k by cosine, pre-filtered by user_id → threshold 1.5
      → passages injected into LLM prompt → streamed answer + citations (relevance score)
```

### 2.3 Data model [LIVE]

| Table | Purpose | Key columns |
|---|---|---|
| `users` | Accounts | email, username, hashed_password, is_active, **is_superuser**, subscription_tier, trial_end_date, api_keys (Fernet-encrypted JSON), nim_models_cache |
| `documents` | Ingested sources | user_id, filename, content_type, processing_status/error, **file_size** (bytes, quota accounting) |
| `document_chunks` (LanceDB) | Vector index | id, document_id, **user_id**, text, vector(384), metadata |
| `conversations` / `chat_messages` | Chat history | user_id, title, role, content, relevance_score |
| `subscriptions` | Plans | user_id, plan_id, status, trial window, razorpay ids, founder flags |
| `waitlist` | Marketing | email, source |
| `audit_logs` | Security trail [LIVE] | user_id, action, resource_type/id, detail JSON, ip, request_id, created_at |

### 2.4 API surface (all `/api/v1`, JWT unless noted)

| Area | Routes | Access |
|---|---|---|
| Auth | `POST /login/access-token`, `POST /users/` (register, auto-trial), `GET/PATCH /users/me` | public / self |
| Users | `GET /users/` | **admin only** [LIVE] |
| Keys (BYOK) | `GET /users/me/keys`, `PUT/DELETE /users/me/keys/{provider}` | self; values never returned |
| Sources | `POST /sources/upload`, `GET /sources/`, `DELETE /sources/{id}` | self (ownership filtered) |
| Chat-export import | via `POST /sources/upload` — `.json`/`.zip` ChatGPT or Claude export files | parsed into one `chat_export` document per conversation, ingested through the normal pipeline [LIVE] |
| Chat | `POST /chat/query` (stream + non-stream), `GET /chat/nim-models` (24h cache) | self |
| Conversations | CRUD `/conversations/` | self |
| Subscription | `/subscription/status\|trial\|plans\|tiers\|pricing\|create-order\|verify\|cancel\|webhook` | self; plans public; webhook = Razorpay |
| Audit | `GET /audit/?action=&limit=&offset=`, `GET /audit/export?format=csv\|json` | own events (export is self-scoped even for admin); admin list sees all [LIVE] |
| Ops | `GET /api/logs` (ring buffer, in-memory), health on root | operator |

**Plan limits are enforced at use time** [LIVE]: exceeding a tier's cap on `POST /sources/upload`
(document count / total storage) or `POST /chat/query` (messages sent today) returns **402**
`{"code": "plan_limit_exceeded", "limit", "tier", "message"}`. Caps — free: 20 docs / 100 MB /
50 msgs/day; trial: 100 / 1000 MB / 500; paid tiers: unlimited. An expired trial counts as free.
Registration starts every account on an active 7-day trial.

### 2.5 Security model [LIVE]

- **Authentication:** JWT bearer (OAuth2 password flow), passlib password hashing.
- **Tenant isolation:** every SQL query scoped by `user_id`; LanceDB search applies
  `WHERE user_id = ?` as a **prefilter** (other tenants' chunks are never scored).
- **RBAC foundation:** two roles — user, admin (`is_superuser`). Admin gates the user
  directory; audit endpoint is role-scoped. *No team/workspace roles yet (Track B).*
- **BYOK:** per-provider keys encrypted at rest with Fernet (key derived from `SECRET_KEY`
  or explicit `LLM_KEYS_FERNET_KEY`); API responses return masks (`sk-...abc`) only.
  **Rotation:** generate a new Fernet key, re-encrypt every stored `user_api_keys` row
  (decrypt old → encrypt new) with a one-off script, set `LLM_KEYS_FERNET_KEY`, restart.
  `SECRET_KEY` is env-driven (`Settings.SECRET_KEY`); the built-in default is for local
  dev only — real deployments must override it (it also seeds the Fernet fallback).
  CI runs a gitleaks secret scan on every push/PR (`.gitleaks.toml` allowlists test
  fixtures, which use fake credential-shaped strings by definition).
- **Audit log:** append-only DB table for security-relevant actions (login success/fail,
  key set/delete, document upload/delete, conversation delete, subscription changes).
  Written via `app/services/audit_service.py::record()` — never raises, never logs secrets.
  **Retention:** rows older than `AUDIT_RETENTION_DAYS` (default 90) are pruned daily at
  03:00 UTC by a background job; users can download their own trail as CSV/JSON.
- **Known gaps:** secrets only in `.env` (never commit); no workspace/tenant roles yet.

### 2.6 Quality gates [LIVE]

- **Retrieval eval harness** — `cd backend_fastapi && .venv/Scripts/python -m app.eval.retrieval_eval`
  Indexes `app/eval/golden.json` (8 docs / 24 chunks / 13 labelled queries) into an isolated
  `eval_document_chunks` table through the real search path. Scores **hit_rate@5, MRR,
  recall@5** against thresholds. Exits non-zero on regression. Current: 1.0 / 1.0 / 1.0.
- **Automated tests:** backend `app/tests/` — 38 pytest (auth, ownership scoping, BYOK,
  audit + retention/export, RBAC, vector prefilter, plan quota enforcement, chat-export
  import); frontend vitest — 17 (api error mapping, AuthContext, form field). Both run in
  CI on every push/PR.
- **Lint:** frontend `npm run lint` (19 pre-existing errors — baseline, do not inflate).

---

## 3. Non-functional requirements

| # | Requirement | Target |
|---|---|---|
| N1 | Privacy (Track A) | No plaintext keys at rest; no source text in logs; local model path works offline |
| N2 | Isolation (Track B) | No cross-tenant read via API or vector search, enforced server-side |
| N3 | Provenance | Every answer carries citations to the exact retrieved passage |
| N4 | Traceability | Security-relevant actions queryable in `audit_logs` within 24h |
| N5 | Retrieval quality | Golden-set hit_rate@5 ≥ 0.9, MRR ≥ 0.8, recall@5 ≥ 0.85 (CI-enforced) |
| N6 | Usage limits | Per-file 50 MB (env); per-tier caps enforced at use — free 20 docs/100 MB/50 msgs/day, trial 100/1000 MB/500, paid unlimited; absolute backstop 2000 docs/user |
| N7 | Availability | Backend stateless (except local LanceDB); frontend static |

---

## 4. Roadmap themes (detail in `PLAN.md`)

- **Track A:** connector ingestion (Gmail, Notion), AI-chat export import, local-SLM-first UX,
  full-account export/delete.
- **Track B:** workspaces + roles, Slack/email connectors, **decision timeline**
  (what/when/why/who + source link), audit UI, SSO.
- **Cross-cutting hardening:** pytest + vitest suites, CI with eval gate, server-side plan
  enforcement, audit retention + export, dependency/secret hygiene.

## 5. Non-goals (explicit)

- Training or fine-tuning models on customer data.
- Real-time multi-user collaborative editing.
- Mobile apps (web-first).
- Replacing the customer's source systems (VaultMind indexes them, does not own them).

## 6. Open decisions

1. Brand of record: **VaultMind** vs ThoughtWeb Navigator (README currently says ThoughtWeb; domain says vaultmind).
2. Track A "fully local" mode scope: Ollama-only, or also local embedding UI config.
3. Connector auth: OAuth per provider (recommended) vs API-key paste.
4. Decision-extraction format (Track B): structured table vs graph edges — deferred to design phase.

## 7. Glossary

- **Chunk** — ~500-token slice of a document; the unit of embedding and retrieval.
- **Citation** — a returned answer's link to the chunk(s) it used, with a relevance score.
- **BYOK** — Bring Your Own Key: user supplies the LLM provider key; server encrypts it.
- **Prefilter** — SQL-style filter applied before the vector scan so non-tenant rows are never scored.
- **Decision record** — Track B entity: {what, when, why, who} + provenance link. **[PLANNED]**
