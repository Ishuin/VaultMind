from loguru import logger
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings

if settings.USE_LANCEDB_FALLBACK:
    from app.services.vector_service_fallback import InMemoryVectorService
    vector_service = InMemoryVectorService()
else:
    from app.db.lancedb import get_lancedb, DocumentChunk

    class VectorService:
        def __init__(self):
            self.db = get_lancedb()
            self.table_name = "document_chunks"

        def get_table(self):
            return self.db.open_table(self.table_name)

        async def add_chunks(self, chunks: List[Dict[str, Any]]):
            table = self.get_table()
            table.add(chunks)

        async def search(
            self,
            query_vector: List[float],
            user_id: int,
            limit: int = 5,
            distance_threshold: float = 1.5,
        ) -> List[Dict[str, Any]]:
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
            table = self.get_table()
            table.delete(f"document_id = {document_id}")

        def get_count(self) -> int:
            try:
                table = self.get_table()
                return len(table)
            except Exception:
                return 0

        def get_count_by_document(self, document_id: int) -> int:
            try:
                table = self.get_table()
                return len(table.search().where(f"document_id = {document_id}").to_pydantic(DocumentChunk))
            except Exception:
                return 0

        def maybe_rebuild_index(self):
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
