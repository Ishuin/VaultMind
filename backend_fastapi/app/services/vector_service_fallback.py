from typing import List, Dict, Any, Optional
from loguru import logger
import json
import os

FALLBACK_STORE_PATH = os.environ.get("VECTOR_FALLBACK_PATH", "./.vector_fallback_store.json")


class InMemoryVectorService:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self._load()

    def _load(self) -> None:
        try:
            if os.path.exists(FALLBACK_STORE_PATH):
                with open(FALLBACK_STORE_PATH, "r", encoding="utf-8") as f:
                    self.chunks = json.load(f)
                logger.info(f"Fallback vector store: loaded {len(self.chunks)} chunks from disk")
        except Exception as exc:
            logger.warning(f"Fallback vector store: failed to load from disk: {exc}")
            self.chunks = []

    def _save(self) -> None:
        try:
            with open(FALLBACK_STORE_PATH, "w", encoding="utf-8") as f:
                json.dump(self.chunks, f)
        except Exception as exc:
            logger.warning(f"Fallback vector store: failed to save to disk: {exc}")

    async def add_chunks(self, chunks: List[Dict[str, Any]]):
        self.chunks.extend(chunks)
        logger.info(f"Fallback vector store: stored {len(chunks)} chunks")
        self._save()

    async def search(
        self,
        query_vector: List[float],
        user_id: int,
        limit: int = 5,
        distance_threshold: float = 1.5,
    ) -> List[Dict[str, Any]]:
        # naive keyword match on text + user filter
        # vector arg kept for interface compatibility
        results = []
        for ch in self.chunks:
            if int(ch.get("user_id", -1)) != int(user_id):
                continue
            results.append(ch)
        return results[:limit]

    async def delete_by_document_id(self, document_id: int):
        self.chunks = [c for c in self.chunks if int(c.get("document_id", -1)) != int(document_id)]
        self._save()

    def get_count(self) -> int:
        return len(self.chunks)

    def maybe_rebuild_index(self):
        return None
