#!/usr/bin/env bash
# Local dev launcher: fixes DB port (5435->5433) and isolates venv from Hermes.
cd "/d/Projects/second_brain/backend_fastapi" || exit 1
PW=$(grep -oE 'postgresql://postgres:[^@]+@' .env | sed -E 's#postgresql://postgres:##; s#@##')
export DATABASE_URL="postgresql://postgres:${PW}@localhost:5433/thoughtweb_navigator"
export PYTHONPATH=
export PATH="/d/Projects/second_brain/backend_fastapi/.venv/Scripts:$PATH"
exec .venv/Scripts/uvicorn.exe app.main:app --host 0.0.0.0 --port 8001
