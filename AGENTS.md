# AGENTS.md — Operating rules for this repository

Read this before changing anything. It binds every agent (human or AI) working in this repo.

## Context map

| Doc | Use it for |
|---|---|
| `docs/SPEC.md` | What the product is: two tracks (personal second brain, enterprise knowledge base), current architecture, data model, API surface, security model, glossary |
| `PLAN.md` | What to do next: phase states (`DONE/IN-PROGRESS/BLOCKED/PENDING`), per-phase tests and done-criteria, autonomous flow, bug/issue protocol |
| `AGENTS.md` | This file: how to work here |
| `CLAUDE.md` | Legacy architecture notes; if it disagrees with `docs/SPEC.md`, SPEC wins |

## Engineering standards

### Scope and process
- Stay strictly on the task provided. Do not add unrequested features or expand scope beyond what was asked.
- No over-engineering.
- Plan once per chunk and move forward. No repeated re-verification or review cycles.
- After finishing a chunk, run it once to confirm it executes without errors before reporting it done. This is a basic self-check, not a full review cycle.
- Deliver the goal with minimal effort and minimal token usage, without sacrificing correctness.

### Design
- Follow DRY and SOLID principles.
- Separate code by logic responsibility, not by project phase.
- Keep functions small with a single responsibility, ideally readable at a glance.
- Keep functions free of hidden side effects wherever possible.
- Prefer explicit, readable code over clever or compact code.
- Avoid magic numbers and strings. Use named constants.

### Documentation and comments
- Write a docstring for every function.
- Comment only to explain why a decision was made, never to describe what the code does. If a line needs explaining, rewrite the line instead.

### Input and errors
- Validate all external inputs at the boundary.
- Raise clear, specific errors rather than generic exceptions.

## Repo rules

- **Secrets:** never print, log, or commit keys. `backend_fastapi/.env` and root `.env` are local-only. Only empty placeholders belong in `.env.example`. Per-user LLM keys are Fernet-encrypted in Postgres — responses return masks only (`app/core/crypto.py`).
- **Tenant isolation:** any new query touching user data MUST be scoped by `user_id` (and `workspace_id` once Track B/B1 lands). Vector searches MUST keep the `user_id` prefilter (`app/services/vector_service.py`).
- **Audit:** security-relevant actions (auth, keys, deletes, payments, role changes) MUST call `app/services/audit_service.py::record()` after the owning `db.commit()`. Never log secret material in `detail`.
- **Errors:** raise specific HTTP errors with actionable messages. Streaming chat surfaces provider failures as `[ERROR {status}/{provider}] {message}` (see `endpoints/chat.py`).
- **Migrations:** Alembic is authoritative. After model changes run `alembic upgrade head`, keep a single head, and guard destructive DDL. Current head: `c8d4e2f6a7b1`.
- **Evals:** retrieval changes MUST leave `python -m app.eval.retrieval_eval` exiting 0. If quality legitimately changes, update `app/eval/golden.json` thresholds in the same commit and say why.
- **Tests:** backend `python -m pytest` from `backend_fastapi/`; frontend `npm test`. Add a test for every bug you fix. Test fixtures live beside the tests, never in `app/`.
- **Fresh-env discipline (learned the hard way in H2 CI):** CI installs from scratch — declare every dependency where it runs (runtime → `requirements.txt`, test-only → `requirements-dev.txt`) and pin any dep whose major-version upgrade changes behavior (current pins: `sqlalchemy<2.1` psycopg2 driver, `bcrypt==4.0.1` passlib-compatible). CI frontend runs Node 22. When CI fails but local passes, suspect version drift first — fix requirements/workflow, never weaken tests. Note: registration auto-starts a 7-day trial, so tier-sensitive tests must set the tier they claim to test.
- **Frontend lint baseline:** 19 pre-existing errors. Do not increase that count.
- **Git:** commit/push only when explicitly asked. Style: `type(scope): summary` (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`). Stage only intended files; inspect `git status` first.
- **Docs:** after finishing a phase, update its state in `PLAN.md` and log learnings in PLAN's Issues section. Update `docs/SPEC.md` only when shipped behavior changes.

## Commands

```powershell
# Backend (port 8000)
cd backend_fastapi
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m app.eval.retrieval_eval
.\.venv\Scripts\python.exe -m pytest

# Frontend (port 8080)
cd frontend
npm install
npm run dev
npm run build
npm run lint
npm test

# Both (opens two terminal windows)
.\run-product.ps1
```

DB: PostgreSQL on `localhost:5433` via `docker-compose.yml`; LanceDB is embedded at `backend_fastapi/.lancedb`. Ollama runs on the host at `:11434` (optional — absence is logged, not fatal).

## Environment notes (Windows / PowerShell)

- Use `Select-Object -First N` instead of `head`; `Select-String` instead of `grep`.
- A wedged `--reload` server is usually a stale process holding `:8000` — check `netstat -ano | Select-String ":8000"` and kill the PIDs before restarting.
- System `C:\Python313\python.exe` lacks app dependencies; always use `backend_fastapi\.venv\Scripts\python.exe`.
