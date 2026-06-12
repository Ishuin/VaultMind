from loguru import logger
import json
from typing import List, Dict, Any, Optional
from app.db.lancedb import get_lancedb, DocumentChunk

# Distance threshold: chunks with cosine distance > this are considered irrelevant
# Cosine distance ranges from 0 (identical) to 2 (opposite). Lower is better.
DEFAULT_DISTANCE_THRESHOLD = 1.5

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

    async def search(
        self,
        query_vector: List[float],
        user_id: int,
        limit: int = 5,
        distance_threshold: float = DEFAULT_DISTANCE_THRESHOLD,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar chunks in the vector database.
        Filters results by distance threshold to exclude irrelevant matches.
        """
        logger.info(f"Searching Vault for user_id={user_id}...")
        table = self.get_table()
        
        try:
            results = (
                table.search(query_vector)
                .where(f"user_id = {user_id}", prefilter=True)
                .limit(limit)
                .to_pydantic(DocumentChunk)
            )
            
            found_list = []
            for res in results:
                d = res.dict()
                dist = d.get("_distance", 0)
                if dist <= distance_threshold:
                    found_list.append(d)
                else:
                    logger.debug(f"Filtered out chunk (distance={dist:.3f} > {distance_threshold})")
            
            logger.info(f"Vector search returned {len(found_list)} relevant results (filtered from {len(results)}).")
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

    def maybe_rebuild_index(self):
        """
        Rebuild vector index if table has grown significantly since last index.
        Called after bulk uploads to keep search fast.
        """
        try:
            table = self.get_table()
            count = len(table)
            if count < 256:
                return
            
            stats = table.index_stats()
            has_vector_index = any(
                idx.get("columns", [None])[0] == "vector"
                for idx in stats.values()
            ) if stats else False
            
            if not has_vector_index:
                num_partitions = min(max(count // 1000, 2), 1024)
                logger.info(f"Rebuilding vector index: {count} rows, {num_partitions} partitions")
                table.create_index(
                    metric="cosine",
                    num_partitions=num_partitions,
                    num_sub_vectors=16,
                    index_type="IVF_PQ",
                )
                logger.info("Vector index rebuilt")
        except Exception as e:
            logger.warning(f"Index rebuild skipped: {e}")

vector_service = VectorService()
