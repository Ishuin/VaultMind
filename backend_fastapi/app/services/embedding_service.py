from loguru import logger
from sentence_transformers import SentenceTransformer
from typing import List

# Batch size for embedding generation — bounded memory usage
EMBEDDING_BATCH_SIZE = 64

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of strings.
        Processes in batches to bound memory usage for large documents.
        """
        if not texts:
            return []
        
        all_embeddings = []
        for i in range(0, len(texts), EMBEDDING_BATCH_SIZE):
            batch = texts[i:i + EMBEDDING_BATCH_SIZE]
            embeddings = self.model.encode(batch, show_progress_bar=False)
            all_embeddings.extend(embeddings.tolist())
            
            if len(texts) > EMBEDDING_BATCH_SIZE:
                logger.debug(f"Embedded batch {i // EMBEDDING_BATCH_SIZE + 1}/{(len(texts) - 1) // EMBEDDING_BATCH_SIZE + 1} ({len(batch)} chunks)")
        
        return all_embeddings

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single string.
        """
        embedding = self.model.encode(text)
        return embedding.tolist()

embedding_service = EmbeddingService()
