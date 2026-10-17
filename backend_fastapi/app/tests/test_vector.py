"""Vector store tenant isolation: LanceDB prefilter keeps other users' chunks out."""
import asyncio

from app.db.lancedb import get_lancedb
from app.services.vector_service import VectorService

PROBE_DIM = 384
PROBE_USERS = (990001, 990002)


def _chunk(user_id: int, marker: int) -> dict:
    vector = [0.0] * PROBE_DIM
    vector[0] = 1.0 if user_id == PROBE_USERS[0] else -1.0
    return {
        "id": f"probe_{user_id}",
        "document_id": 999999,
        "user_id": user_id,
        "text": f"isolation probe for user {marker}",
        "vector": vector,
        "metadata": '{"probe": true}',
    }


def test_search_never_crosses_user_boundary():
    """Searching as user A returns only A's probe row, even for the strongest query."""
    vs = VectorService()
    db = get_lancedb()
    table_name = "document_chunks"
    try:
        for uid in PROBE_USERS:
            db.open_table(table_name).delete(f"user_id = {uid}")

        for uid in PROBE_USERS:
            asyncio.run(vs.add_chunks([_chunk(uid, 0)]))

        query = [0.0] * PROBE_DIM
        query[0] = 1.0
        results = asyncio.run(vs.search(query, PROBE_USERS[0], limit=10))
        ids = {r["id"] for r in results}

        assert f"probe_{PROBE_USERS[0]}" in ids
        assert f"probe_{PROBE_USERS[1]}" not in ids, "cross-tenant chunk leaked"
    finally:
        for uid in PROBE_USERS:
            db.open_table(table_name).delete(f"user_id = {uid}")
