from typing import List

class EmbeddingServiceFallback:
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        # Return empty embeddings; interface must be compatible.
        return [[] for _ in texts]

    def generate_embedding(self, text: str) -> List[float]:
        return []

embedding_service = EmbeddingServiceFallback()
