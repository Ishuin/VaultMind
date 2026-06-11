from loguru import logger
import json
from typing import List, Dict, Any, Optional
from app.db.lancedb import get_lancedb, DocumentChunk

class VectorService:
    def __init__(self):
        self.db = get_lancedb()
        self.table_name = "document_chunks"

    def get_table(self):
        return self.db.open_table(self.table_name)

    async def add_chunks(self, chunks: List[Dict[str, Any]]):
        """
        Add chunks to the vector database.
        chunks: List of dicts matching DocumentChunk schema.
        """
        table = self.get_table()
        table.add(chunks)

    async def search(self, query_vector: List[float], user_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search for similar chunks in the vector database.
        """
        logger.info(f"Searching Vault for user_id={user_id}...")
        table = self.get_table()
        
        # Log if user has any chunks at all
        try:
            results = (
                table.search(query_vector)
                .where(f"user_id = {user_id}", prefilter=True)
                .limit(limit)
                .to_pydantic(DocumentChunk)
            )
            found_list = [res.dict() for res in results]
            logger.info(f"Vector search returned {len(found_list)} results.")
            return found_list
        except Exception as e:
            logger.error(f"LanceDB search failed: {str(e)}")
            return []

    async def delete_by_document_id(self, document_id: int):
        """
        Delete all chunks associated with a document.
        """
        table = self.get_table()
        table.delete(f"document_id = {document_id}")

    def get_count(self) -> int:
        """
        Get total number of chunks in the table.
        """
        try:
            table = self.get_table()
            return len(table)
        except Exception:
            return 0

vector_service = VectorService()
