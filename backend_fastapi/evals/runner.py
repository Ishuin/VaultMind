import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

from loguru import logger

# Ensure backend package imports work when run as `python -m evals.runner`
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from evals.golden.schema import GoldenExample  # noqa: E402
from app.db.database import SessionLocal  # noqa: E402
from app.models.user import User  # noqa: E402
from app.services.chat_service import chat_service  # noqa: E402


RESULTS_DIR = BACKEND_DIR / "evals" / "results"
RESULTS_DIR.mkdir(exist_ok=True)


def _get_or_create_eval_user(db) -> User:
    user = db.query(User).filter(User.email == "eval@example.com").first()
    if not user:
        user = User(email="eval@example.com", hashed_password="eval", is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def _load_dataset() -> List[GoldenExample]:
    dataset_path = BACKEND_DIR / "evals" / "golden" / "dataset.json"
    with dataset_path.open("r", encoding="utf-8") as f:
        raw = json.load(f)
    return [GoldenExample(**item) for item in raw]


def _score_response(example: GoldenExample, response_text: str, sources: List[Dict[str, Any]], latency_ms: float, web_query: str = "") -> Dict[str, Any]:
    lower_text = response_text.lower()
    score = {
        "example_id": example.id,
        "category": example.category,
        "latency_ms": latency_ms,
        "web_query": web_query,
        "subject_hit": False,
        "citation_coverage": {
            "expected_doc_ids": example.expected_doc_source_ids,
            "actual_doc_ids": [s.get("id") for s in sources if s.get("source_type") == "file"],
            "expected_web_ids": example.expected_web_source_ids,
            "actual_web_ids": [s.get("id") for s in sources if s.get("source_type") == "web"],
        },
        "must_have_hits": [],
        "must_have_misses": [],
        "must_not_have_hits": [],
        "must_not_have_misses": [],
        "passes": False,
    }

    if example.subject_hint:
        hint_tokens = [token.lower() for token in example.subject_hint.replace("-", " ").split() if len(token) > 3]
        if hint_tokens:
            score["subject_hit"] = any(token in lower_text or token in web_query.lower() for token in hint_tokens)

    for phrase in example.must_have_phrases:
        hit = phrase.lower() in lower_text
        score["must_have_hits"].append({"phrase": phrase, "hit": hit})
        if not hit:
            score["must_have_misses"].append(phrase)

    for phrase in example.must_not_have_phrases:
        hit = phrase.lower() in lower_text
        score["must_not_have_hits"].append({"phrase": phrase, "hit": hit})
        if hit:
            score["must_not_have_misses"].append(phrase)

    score["passes"] = (
        not score["must_have_misses"]
        and not score["must_not_have_misses"]
    )
    return score


async def _run_example(db, example: GoldenExample) -> Dict[str, Any]:
    user = _get_or_create_eval_user(db)
    start = time.perf_counter()
    response_text, sources = await chat_service.chat_with_context(
        query=example.query,
        user_id=user.id,
        model="meta/llama-3.1-8b-instruct",
        provider="nvidia",
        search_internet=example.internet_required,
        conversation_history=[],
        db=db,
    )
    latency_ms = (time.perf_counter() - start) * 1000

    try:
        web_query = chat_service._extract_search_subject(example.query, "")
    except Exception:
        web_query = example.query

    score = _score_response(example, response_text, sources, latency_ms, web_query=web_query)
    score["response_preview"] = response_text[:1200]
    score["source_count"] = len(sources)
    return score


def run() -> int:
    logger.remove()
    logger.add(sys.stderr, level="WARNING")
    logger.add(RESULTS_DIR / "latest.log", rotation="10 MB", encoding="utf-8")

    examples = _load_dataset()
    results: List[Dict[str, Any]] = []

    with SessionLocal() as db:
        for example in examples:
            try:
                score = db.execute("SELECT 1").scalar()  # noqa: F841
            except Exception as exc:
                logger.error(f"Database unavailable: {exc}")
                return 2

            try:
                import asyncio
                score = asyncio.run(_run_example(db, example))
            except Exception as exc:
                logger.exception(f"Eval failed for {example.id}")
                score = {
                    "example_id": example.id,
                    "category": example.category,
                    "error": str(exc),
                    "passes": False,
                }
            results.append(score)

    total = len(results)
    passed = sum(1 for r in results if r.get("passes"))
    avg_latency = sum(r.get("latency_ms", 0) for r in results if "latency_ms" in r) / max(total, 1)

    summary = {
        "total": total,
        "passed": passed,
        "failed": total - passed,
        "pass_rate": passed / max(total, 1),
        "avg_latency_ms": avg_latency,
        "results": results,
    }

    out_path = RESULTS_DIR / "latest.json"
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(json.dumps({
        "total": total,
        "passed": passed,
        "failed": total - passed,
        "pass_rate": round(summary["pass_rate"], 4),
        "avg_latency_ms": round(avg_latency, 2),
        "output": str(out_path),
    }, indent=2))
    return 0 if passed == total else 1


if __name__ == "__main__":
    raise SystemExit(run())
