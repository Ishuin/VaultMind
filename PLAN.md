# VaultMind — Execution Plan

How an agent (human or AI) drives this repo without being told what to do next.
**Read this top-to-bottom once, then work top-to-bottom.**

- Spec (what/why): `docs/SPEC.md`
- Agent rules (how to work here): `AGENTS.md`
- This file (what's next and when it's done): `PLAN.md`

---

## 0. State machine

Every phase below carries exactly one state:

| State | Meaning | Entry rule |
|---|---|---|
| `DONE` | Shipped, verified by its phase's tests, nothing left | All deliverables + tests pass |
| `IN-PROGRESS` | Actively being worked | Only one phase at a time per track |
| `BLOCKED` | Cannot proceed; reason recorded in the phase's Issues | Do not start the next phase |
| `PENDING` | Designed, not started | Starts only when its dependency is `DONE` |

**Updating state is part of finishing work.** After any implementation chunk:
1. run the phase's tests,
2. update the state line and date in this file,
3. append anything learned to the phase's Issues section,
4. commit only when the user asks.

---

## 1. DONE — Foundation (shipped on `bridge`, through `317e50f`)

| Item | Evidence |
|---|---|
| RAG pipeline: upload → extract → chunk → embed → LanceDB → cited chat | working end-to-end |
| Multi-provider LLM + model picker (Ollama, NIM, OpenAI, Anthropic, OpenRouter) | `llm_service.py` |
| BYOK per-user keys, encrypted, masked | `keys.py`, `crypto.py` |
| NIM model discovery (free probe, 24h cache, aligned fallbacks) | `chat.py:/nim-models` |
| Structured request/error logging (X-Request-ID, ring buffer) | `core/logging.py`, `GET /api/logs` |
| Retrieval eval harness with thresholds + exit code | `app/eval/` — hit_rate@5 1.0, MRR 1.0, recall@5 1.0 |
| Audit log (table + `record()` + `GET /audit`, 9 call sites, admin sees all) | `audit_service.py`, migration `e3a7c9d14b2f` |
| RBAC foundation: `get_current_admin_user`; user directory admin-only | `deps.py`, `users.py` |
| Alembic repaired: lost migration restored, single merged head | `alembic current` = `e3a7c9d14b2f` |
| Subscriptions (trial/founder/lifetime + Razorpay order/verify/cancel) | `subscription.py` — **usage limits not enforced (see H3)** |
| Frontend: landing, pricing, dashboard, sources, chat, settings, Netlify deploy | `frontend/`, Netlify base=`frontend` |
| Password show/hide on auth forms | `Auth.tsx` |

---

## 2. Next up — Cross-cutting Hardening (do this BEFORE either track ships features)

### H1 — Test suites `DONE` (2026-10-17)
- Backend: pytest for auth, ownership scoping, BYOK crypto/masking, audit `record()` write+scope,
  admin gate 403, vector search prefilter. Uses `TestClient` + real Postgres (docker-compose db).
- Frontend: vitest for `AuthContext` token restore, `api.ts` error mapping, `FormField` reveal toggle.
- Backend tests live in `backend_fastapi/app/tests/` (not gitignored — verified via `git check-ignore`).
- Tests: **20 backend passed**, **17 frontend passed** (as of H2 completion), lint at baseline (19 errors), eval harness passes.
- Done criteria met: `python -m pytest` green, `npm test` green, both documented in README.

### H2 — CI `DONE` (2026-10-17)
- Workflow `.github/workflows/ci.yml`, runs on push/PR to `bridge`, two parallel jobs:
  - **backend**: postgres:16 service on :5433 → `pip install -r requirements.txt` →
    `alembic upgrade head` on a fresh DB → **`alembic check` (schema drift gate)** → `pytest -q`
    → `app.eval.retrieval_eval` (eval gate: fails below thresholds). HF model cache.
  - **frontend**: `npm ci` → `eslint -f json` + `scripts/check-lint-baseline.mjs` (fails only
    above the 19-error baseline) → `npm run build` → `npm test` (vitest).
- Validated locally by replaying the exact pipeline against a fresh `vaultmind_ci` database:
  upgrade ✓ drift check ✓ 18 pytest ✓ eval PASS ✓; frontend `npm ci`/build/14 tests/baseline ✓.
- Ollama-absent path verified (startup logs a warning; tests pass with a dead URL).
- Done criteria met: CI workflow committed; status badge in README.

### H3 — Server-side plan enforcement `DONE` (2026-10-17)
- New `app/services/quota_service.py`: `USAGE_LIMITS` (free 20 docs / 100 MB / 50 msgs/day;
  trial 100 / 1000 MB / 500; paid tiers unlimited; unknown tier fails safe to free caps),
  `effective_tier()` (expired trial counts as free), `assert_can_upload`, `assert_can_chat`.
- Wired: `POST /sources/upload` (before any row is created) and `POST /chat/query`
  (before provider resolution and before the message is persisted) → **402**
  `{"code": "plan_limit_exceeded", "limit", "tier", "message"}`.
- New `documents.file_size` column (migration `c8d4e2f6a7b1`, guarded, single head,
  drift-free) + crud/schema support; per-file 413 and the 2000-doc backstop kept.
- Tests: **7 new** (`app/tests/test_plan_enforcement.py`) covering free blocked on count and
  on storage, trial passing caps that block free, paid unlimited, expired trial → free,
  chat daily cap 402-before-persist, paid chat sailing past the quota gate.
- Done criteria met: 402 with clear message; free/trial/paid covered; full suite 27 green.

### H4 — Audit retention + hygiene `DONE` (2026-10-17)
- Retention: `AUDIT_RETENTION_DAYS` (default 90) config; `prune_old_events()` deletes rows
  older than the window; daily 03:00 UTC APScheduler cron job on its **own** scheduler
  (independent of the broken trial scheduler — a failure in one never stops the other).
- Export: `GET /audit/export?format=csv|json` — self-scoped even for admins; CSV via
  `csv.DictWriter`, JSON streamed as one array; `Content-Disposition` attachment; unknown
  format → 422; endpoint auth-required (covered in the test_auth 401 loop).
- Tests: **5 new** (`app/tests/test_audit_retention.py`) — prune old-only, custom window,
  CSV own-only + header, JSON own-only + fields, format validation; suite 32 green.
- No migration (delete-only); eval PASS.

### H5 — Secret & dependency hygiene `DONE` (2026-10-17)
- CI: **gitleaks secret-scan job** on every push/PR (`fetch-depth: 0`; `.gitleaks.toml`
  allowlists `app/tests/` + `app/eval/` fixture strings).
- `SECRET_KEY` moved to env (`Settings.SECRET_KEY`, default = old dev literal): the old
  hardcoded value also made the `LLM_KEYS_FERNET_KEY` fallback deterministic for anyone
  reading the repo. Real deployments must override — documented in `.env.example`.
- Requirements fully pinned (direct deps at known-good versions; `sqlalchemy<2.1` and
  `bcrypt==4.0.1` pins retained with rationale; `pytest==9.1.1` in requirements-dev).
- `.env.example` aligned with `Settings` (+`SECRET_KEY`, +`AUDIT_RETENTION_DAYS`) and
  carries the **Fernet rotation procedure** (re-encrypt stored user keys, then swap).
- Done-when met: scan runs in CI; env example matches settings; suite 32 green.

---

## 3. Track A — Personal Second Brain

### A1 — AI chat history import `DONE` (2026-10-17)
- `app/services/chat_export.py`: format-sniffing parsers for ChatGPT (`conversations.json`
  in JSON or ZIP, `mapping` nodes ordered by timestamp) and Claude (`name` + `chat_messages`,
  human/assistant senders); conversations with <2 turns skipped; ValueError on non-exports.
- Ingestion: each conversation becomes its own `chat_export` document (`{file} :: {title}`);
  first conversation reuses the upload record, extras are added — all through the shared
  chunk/embed/LanceDB path (`_embed_and_store` refactor).
- Tests: **6 new** — parser units (ChatGPT JSON/ZIP, Claude, garbage rejection ×2) +
  end-to-end upload producing retrievable `chat_export` chunks; suite 38 green, eval PASS.
- Note: format detection requires the provider-specific key (`mapping` vs `chat_messages`);
  "or"-chaining parsers without it misroutes Claude exports into the ChatGPT parser.

### A2 — Email connector (Gmail) `BLOCKED` (2026-10-17)
- OAuth (Google) → fetch messages/threads → same ingestion pipeline. Store only tokens + ids.
- Tests: mocked Gmail responses; token refresh; no message bodies in logs.
- Done when: connected mailbox's selected labels are searchable via chat.
- BLOCKER: needs Google Cloud OAuth client id/secret from the owner — cannot be obtained
  by an agent. Unblocks the moment creds land in `.env` (`GOOGLE_CLIENT_ID/SECRET`).

### A3 — Notes connector (Notion) `BLOCKED` (2026-10-17)
- Notion OAuth → pages/databases → ingestion. Re-run sync = incremental (updated pages only).
- Tests: mocked Notion payloads; dedupe on re-sync.
- Done when: Notion pages appear as sources and sync on demand.
- BLOCKER: depends on A2's Google OAuth creds AND a Notion integration token from the owner.

### A4 — Local-first SLM mode `DONE` (2026-10-17)
- Backend: `GET /llm/status` (auth) — Ollama reachability, model list, suggested default
  local model, base URL, `local_processing` flag for the UI indicator.
- Frontend: `LocalModeIndicator` badge ("Local — data stays on this machine") rendered
  next to every Ollama model + inside the Ollama settings accordion; `OllamaStatus`
  readout (connected / not-reachable setup hint) wired into ModelSelector.
- Tests: **4 backend** (`test_llm_status.py`: reachable/unreachable/auth/never-raises on
  connection error) + **4 frontend** (indicator text, connected state with default model,
  offline hint, silent failure); backend 42, frontend 21, lint baseline 19 held.
- PRE-EXISTING (noted, not fixed here): the "Ollama Local Path" input in ModelSelector
  is local component state only — changes never persist or reach the backend.

### A5 — Privacy controls `DONE` (2026-10-17)
- `app/services/privacy_service.py`: `export_account()` (profile without password/keys,
  documents, conversations+messages, vector chunk texts, audit events) and
  `delete_account()` (vector chunks first, then messages → conversations → documents →
  subscription → audit → user in FK-safe order; post-delete audit row references no user).
- Endpoints: `GET /users/me/export` (JSON attachment), `DELETE /users/me`.
- Tests: **3 new** — export completeness + "no secrets in payload" (hash/api_keys/password
  absent), hard delete wipes Postgres + LanceDB + old token + re-login, auth gate on both;
  suite 45 green, eval PASS.
- Accepted existing behavior: unknown-user token → 404 (deps.py), unknown-account login →
  400; tests assert "not authenticated" (never 200) instead of a specific code.

---

## 4. Track B — Enterprise Knowledge Base

### B1 — Workspaces & roles `DONE` (2026-10-22)
- New tables `workspaces` + `workspace_members` (roles `owner | admin | member | viewer`;
  migration `d4e5f6a7b8c9`: guarded, backfills a personal workspace per existing user and
  attaches their orphan rows, single head, drift-free). Every registration creates the
  personal workspace; `resolve()` lazily creates it for stragglers.
- Active workspace = **`X-Workspace-Id` header** (a query param would collide with the
  `/workspaces/{workspace_id}` path param in FastAPI); omitted → personal workspace.
  Non-members get **404** for any explicit id (no existence leak). Role gates:
  viewer = read-only (403 on upload/create/delete/chat), member = read+write,
  admin = + member management, owner = + grant/revoke owner (never leave zero owners).
- Scoped ownership filters: documents, conversations, audit rows + LanceDB chunks
  (`DocumentChunk.workspace_id`, added in place via `table.add_columns`; NULL = legacy
  chunk, stays visible to its owner only — the user prefilter still applies). `record()`
  stamps `workspace_id`; `GET /audit/?workspace_id=` filters after a membership check.
- New endpoints: `POST/GET /workspaces/`, `GET /workspaces/{id}`,
  `GET/POST /workspaces/{id}/members`, `PATCH/DELETE /workspaces/{id}/members/{uid}`.
  `DELETE /users/me` now drops memberships and workspaces left with no members.
- Tests: **6 new** (`app/tests/test_workspaces.py`) — personal workspace at registration,
  cross-workspace 404s (workspace, conversations, audit), full role matrix (viewer/member/
  admin/owner), per-workspace source scoping incl. cross-ws delete 404, same-user
  two-workspace LanceDB prefilter with legacy-NULL visibility. Suite **51 green**, eval PASS.
- Done criteria met: two workspaces cannot see each other's data through any API or
  vector search.

### B2 — Slack connector `BLOCKED` (2026-10-22)
- Needs a Slack app (client id/secret + signing secret) owned by the project — same
  credential class as A2/A3. Once supplied: OAuth flow, per-workspace token storage,
  ingestion with channel + timestamp metadata.
- Tests: mocked events; per-workspace token storage; rate-limit handling.
- Done when: "why did we drop feature X?" returns channel citations with timestamps.

### B3 — Decision timeline `PENDING` (dep: B1, B2)
- Extract **decision records** `{what, when, why, who, source_ref}` during ingestion (LLM extraction pass, stored in Postgres).
- Timeline UI: filter by date/person/topic; every row links to the source passage.
- Tests: extraction schema validation; citation integrity; timeline API pagination/filter.
- Done when: a workspace can list its decisions oldest→newest, each traceable to origin.

### B4 — Email/meeting ingestion `PENDING` (dep: B2)
- Shared mailbox (Google Workspace / Microsoft 365) + meeting notes into the same pipeline, workspace-scoped.
- Done when: an org email thread is retrievable and, if it contains a decision, produces a decision record.

### B5 — SSO + audit UI `PENDING` (dep: B1, H4)
- SAML/OIDC login; audit log UI (filter by actor, action, date; export).
- Done when: SSO login works against one reference IdP; audit UI renders and exports.

---

## 5. The autonomous flow (what to do when you sit down)

```
1. Read PLAN.md → find the single IN-PROGRESS phase, else the first PENDING phase
   whose dependencies are all DONE (hardening before tracks).
2. Read that phase's block: Goal, Deliverables, Tests, Done-when.
3. Slice it into the smallest shippable steps; implement one step.
4. Run ONLY that step's self-check (import check / targeted test / build).
5. Run the phase's full test list when the last step lands.
6. Update PLAN.md state + append learnings to the phase's Issues.
7. Stop. Report in 3 lines: what changed, test result, what's next.
8. Commit/push ONLY when the user says so.
```

Never: start two phases at once, skip the phase's tests, "improve" unrelated code,
or assume a dependency works without running it.

---

## 6. Handling bugs and issues (no heroics)

**On hitting a bug while implementing:**
1. Reproduce it in isolation (script or failing test) before touching code.
2. Classify: `REGRESSION` (my change broke it) / `PRE-EXISTING` (was already broken) / `ENVIRONMENT` (machine, network, Ollama down).
3. `REGRESSION` → fix in the same step, add a failing-then-passing test.
4. `PRE-EXISTING` → record it under the current phase's **Issues** as a new line; do NOT fix it inside this phase unless the phase depends on it.
5. `ENVIRONMENT` → note the symptom, verify with the healthy path (e.g. TestClient vs live server), move on. Do not change code to paper over environment problems.

**On being blocked (needs a credential, a decision from §6 of SPEC.md, an external service):**
- Set the phase state to `BLOCKED`, write the blocker in its Issues, and pick the next
  unblocked PENDING phase. Never stall silently.

**Definition of a fixed bug:** the original failing case now passes, no phase test regressed,
and the fix is described in one line in the Issues log.

---

## 7. What "a completed phase" looks like

| Gate | Check |
|---|---|
| Code | Deliverables exist, follow `AGENTS.md` standards (docstrings, no magic values, validated inputs) |
| Tests | Phase's listed tests pass; eval harness still exits 0 |
| Frontend | `npm run build` succeeds; lint errors ≤ baseline (19) |
| Backend | imports clean; `alembic upgrade head` no-op; server starts |
| Docs | PLAN.md state updated; SPEC.md touched only if behavior changed |
| Git | Clean tree; commit made only on request, message = `type(scope): summary` |

---

## 8. Issues log

Append-only. Format: `- [YYYY-MM-DD] PHASE — symptom → resolution or "open"`.

- [2026-10-12] H1 — `backend_fastapi/app/tests/` is gitignored, hiding test source → resolved (no such ignore line exists; tests are tracked)
- [2026-10-17] H1 — pydantic EmailStr rejects `.local` domains (reserved) → tests use `@example.com`
- [2026-10-17] H1 — Node ≥22 experimental `localStorage` shadows jsdom's and is undefined → deterministic in-memory shim in `frontend/src/test/setup.ts`
- [2026-10-17] H1 — vitest@5 needs vite ≥6, repo has vite 5 → pinned `vitest@^3`
- [2026-10-17] H1 — `npm install` run outside `frontend/` created stray `package.json`/`node_modules` at repo root → deleted; always pass workdir `frontend`
- [2026-10-12] H3 — plan limits only checked at purchase time → open
- [2026-10-12] A1 — ChatGPT/Claude export formats change without notice → design parsers tolerantly, pin fixture versions
- [2026-10-12] env — `--reload` server appeared not to bind; cause was stale processes from prior days holding/confusing the port; clean restart fixed it → resolved (documented)
- [2026-10-17] H2 — PRE-EXISTING: fresh DB from `alembic upgrade head` alone was missing `waitlist`/`conversations`/`chat_messages`/`subscriptions` tables and 5 `users` columns (masked by startup `create_all`, so local dev never noticed) → fixed by guarded migration `b7c3d9e1f4a2`; `alembic check` drift gate now runs in CI
- [2026-10-17] H2 — repo lint has 19 pre-existing errors (`npm run lint` exits 1) → CI uses `frontend/scripts/check-lint-baseline.mjs` as a ratchet instead of failing on the baseline
- [2026-10-17] H2 — CI backend failed: unpinned `sqlalchemy` resolved to 2.1.5 where `postgresql://` defaults to the psycopg3 driver (not shipped; we have psycopg2-binary) → pinned `sqlalchemy>=2.0.49,<2.1`; validated locally on 2.0.55 (CI's fresh-install version)
- [2026-10-17] H2 — CI frontend crashed: undici@8 (via jsdom 30) is incompatible with Node 20 → CI bumped to Node 22 (matches local dev)
- [2026-10-17] H2 — CI `No module named pytest`: pytest was only in the local venv, never declared → added `requirements-dev.txt` (`-r requirements.txt` + pytest); CI installs it
- [2026-10-17] H2 — CI registration 500 on every user: unpinned `passlib[bcrypt]` pulled bcrypt 5.0.0, which passlib 1.7.4 cannot drive ("password cannot be longer than 72 bytes") → pinned `bcrypt==4.0.1` (the locally validated version)
- [2026-10-17] H2 — PRE-EXISTING: `app/services/trial_service.py` does not exist but `main.py` imports it inside `try/except ImportError`, so the trial scheduler never starts and the log wrongly blames missing APScheduler → open
- [2026-10-17] H2 — PRE-EXISTING: `razorpay_service.py` does `import razorpay` but `razorpay` is not in requirements.txt (no endpoint currently imports the module) → open (dependency hygiene)
- [2026-10-17] H3 — free-tier tests initially passed against real users because **registration auto-starts a 7-day trial** (`users.py`) → tests must explicitly move the user into the tier they claim to test; keep this in mind for any tier-sensitive test
- [2026-10-17] H3 — PRE-EXISTING: `MAX_USER_STORAGE_MB` (5000) in config is dead config, superseded by per-tier storage caps → open (remove or wire as an absolute ceiling)
- [2026-10-17] H4 — REGRESSION (caught by CI, not local): prune tests hardcoded `user_id=1`; fresh CI DB has no user 1 → FK violation swallowed by `record()` → empty result. Lesson: never assume pre-existing rows in a fresh DB — always use the `make_user` fixture for owned data
- [2026-10-22] A4 — REGRESSION (caught by CI, not local): first-ever `async def` tests, but `pytest-asyncio` was only in the local venv, never declared in `requirements-dev.txt`. Same fresh-env class as H2 — declare every test dep where CI installs it
- [2026-10-22] B1 — FastAPI raises "Cannot use `Query` for path param" when a dependency declares a query param whose name matches a route's path param (`workspace_id` on `/workspaces/{workspace_id}`) → active-workspace selection moved to the `X-Workspace-Id` **header**; `/workspaces/{id}` routes resolve membership against the PATH id via a dedicated `path_workspace_ctx` dependency. Lesson: a header-resolved ctx in a `{id}`-in-path route silently ignores the id (first test caught it returning 200 for another user's workspace)
- [2026-10-22] B1 — `alembic check` flags `add_column` without the model's ForeignKey → guarded migration adds the column **with** the FK; on an already-migrated dev DB, apply the constraint by hand once
- [2026-10-22] B1 — A5 `delete_account` broke on the new `workspace_members.user_id` FK → privacy delete now removes memberships and reassigns refs on then-empty workspaces before dropping them (any new FK to `users` must be added to that wipe list)
