# Evals

Local evaluation harness for the RAG system.

## Structure

- `golden/schema.py` — Pydantic schema for golden examples.
- `golden/dataset.json` — Golden cases.
- `runner.py` — Eval runner with metrics.
- `results/` — JSON outputs from eval runs.

## Usage

```bash
cd backend_fastapi
python -m evals.runner
```

## Concepts

A golden example is one request/response expectation you can replay deterministically.
Start small, iterate fast, and only then move to Langfuse/LangSmith.