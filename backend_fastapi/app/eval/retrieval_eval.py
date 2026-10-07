"""Retrieval evaluation harness.

    cd backend_fastapi
    .venv/Scripts/python -m app.eval.retrieval_eval [--k 5]

Indexes app/eval/golden.json into an isolated eval table through the real
VectorService search path, scores retrieval against the labelled queries, and
exits non-zero when a threshold regresses.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

from loguru import logger

logger.remove()
logger.add(sys.stderr, level="WARNING")

from app.db.lancedb import DocumentChunk, get_lancedb
from app.services.embedding_service import embedding_service
from app.services.vector_service import DEFAULT_DISTANCE_THRESHOLD, VectorService

EVAL_USER_ID = -999
EVAL_TABLE = "eval_document_chunks"
GOLDEN_PATH = Path(__file__).with_name("golden.json")


def load_golden() -> dict:
    return json.loads(GOLDEN_PATH.read_text(encoding="utf-8"))


def build_chunks(docs: list[dict]) -> list[dict]:
    chunks = []
    for doc_index, doc in enumerate(docs):
        paragraphs = [p.strip() for p in doc["text"].split("\n\n") if p.strip()]
        for para_index, paragraph in enumerate(paragraphs):
            chunks.append(
                {
                    "id": f"{doc['id']}#{para_index}",
                    "document_id": doc_index,
                    "user_id": EVAL_USER_ID,
                    "text": paragraph,
                    "metadata": json.dumps({"doc_id": doc["id"], "title": doc["title"]}),
                }
            )
    return chunks


async def index_golden(vs: VectorService, docs: list[dict], chunks: list[dict]) -> None:
    db = get_lancedb()
    if EVAL_TABLE in db.table_names():
        db.drop_table(EVAL_TABLE)
    db.create_table(EVAL_TABLE, schema=DocumentChunk)

    vectors = embedding_service.generate_embeddings([c["text"] for c in chunks])
    for chunk, vector in zip(chunks, vectors):
        chunk["vector"] = vector

    await vs.add_chunks(chunks)


async def score(
    vs: VectorService,
    golden: dict,
    chunks: list[dict],
    k: int,
) -> tuple[dict, list[dict]]:
    chunk_to_doc = {c["id"]: json.loads(c["metadata"])["doc_id"] for c in chunks}
    hit = 0
    reciprocal_rank = 0.0
    recall_total = 0.0
    rows = []

    for item in golden["queries"]:
        vector = embedding_service.generate_embedding(item["query"])
        results = await vs.search(
            vector, EVAL_USER_ID, limit=k, distance_threshold=DEFAULT_DISTANCE_THRESHOLD
        )

        retrieved_docs: list[str] = []
        for result in results:
            doc_id = chunk_to_doc.get(result.get("id"))
            if doc_id and doc_id not in retrieved_docs:
                retrieved_docs.append(doc_id)

        relevant = item["relevant"]
        position = next(
            (i + 1 for i, doc_id in enumerate(retrieved_docs) if doc_id in relevant), None
        )
        found = [d for d in relevant if d in retrieved_docs]

        hit += 1 if position else 0
        reciprocal_rank += (1 / position) if position else 0.0
        recall_total += len(found) / len(relevant)

        rows.append(
            {
                "query": item["query"],
                "expected": ",".join(relevant),
                "top": ",".join(retrieved_docs[:3]) or "-",
                "rank": position or ">k",
            }
        )

    total = len(golden["queries"])
    metrics = {
        f"hit_rate@{k}": round(hit / total, 4),
        "mrr": round(reciprocal_rank / total, 4),
        f"recall@{k}": round(recall_total / total, 4),
    }
    return metrics, rows


async def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate retrieval quality")
    parser.add_argument("--k", type=int, default=5, help="top-k cutoff")
    args = parser.parse_args()

    golden = load_golden()
    docs = golden["docs"]
    chunks = build_chunks(docs)

    vs = VectorService()
    vs.table_name = EVAL_TABLE

    await index_golden(vs, docs, chunks)
    metrics, rows = await score(vs, golden, chunks, args.k)

    print(f"\nIndexed {len(docs)} docs / {len(chunks)} chunks -> {EVAL_TABLE}\n")
    print(f"{'METRIC':<14}{'ACTUAL':>8}{'MIN':>8}   RESULT")
    failures = []
    for name, actual in metrics.items():
        required = golden["thresholds"].get(name.split("@")[0])
        if required is None:
            continue
        passed = actual >= required
        if not passed:
            failures.append(name)
        print(f"{name:<14}{actual:>8}{required:>8}   {'PASS' if passed else 'FAIL'}")

    if failures:
        print("\nQueries that missed their target:")
        for row in rows:
            if row["rank"] == ">k":
                print(f"  [{row['rank']:>3}] {row['query']}")
                print(f"        want={row['expected']} got={row['top']}")
        print(f"\nFAIL: {', '.join(failures)}")
        return 1

    print("\nPASS")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
