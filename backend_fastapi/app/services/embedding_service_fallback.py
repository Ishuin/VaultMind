from loguru import logger
from typing import List

from app.services.db_selector_service import db_selector_service

if db_selector_service.is_using_fallback():
    logger.warning("Using embedding fallback service because database is unavailable.")

    class EmbeddingServiceFallback:
        def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
            return [[] for _ in texts]

        def generate_embedding(self, text: str) -> List[float]:
            return []

    embedding_service = EmbeddingServiceFallback()
else:
    from app.services.embedding_service import embedding_service
