import os
from loguru import logger
from app.core.config import settings
from app.services.db_selector_service import db_selector_service

if db_selector_service.is_using_fallback():
    raise RuntimeError("LanceDB module should not be imported when database fallback is active.")

import lancedb
from lancedb.pydantic import LanceModel, Vector

class DocumentChunk(LanceModel):
    id: str
    document_id: int
    user_id: int
    text: str
    vector: Vector(384)
    metadata: str

def get_lancedb():
    db_path = settings.LANCEDB_URI
    if not db_path.startswith("s3://") and not db_path.startswith("azure://"):
        os.makedirs(db_path, exist_ok=True)
    return lancedb.connect(db_path)

def init_lancedb():
    db = get_lancedb()
    if "document_chunks" not in db.table_names():
        db.create_table("document_chunks", schema=DocumentChunk)
        logger.info("Created document_chunks table")
    table = db.open_table("document_chunks")
    count = len(table)
    MIN_INDEX_ROWS = 256
    if count >= MIN_INDEX_ROWS:
        try:
            existing_indexes = table.index_stats()
            has_vector_index = any(
                idx.get("columns", [None])[0] == "vector"
                for idx in existing_indexes.values()
            ) if existing_indexes else False
            if not has_vector_index:
                num_partitions = min(max(count // 1000, 2), 1024)
                logger.info(f"Creating IVF_PQ vector index: {count} rows, metric=cosine, num_partitions={num_partitions}")
                table.create_index(
                    metric="cosine",
                    num_partitions=num_partitions,
                    num_sub_vectors=16,
                    index_type="IVF_PQ",
                )
                logger.info("Vector index created successfully")
        except Exception as e:
            logger.warning(f"Could not create vector index (will use flat search): {e}")
    if count >= 50:
        try:
            existing_indexes = table.index_stats()
            has_user_id_index = any(
                idx.get("columns", [None])[0] == "user_id"
                for idx in existing_indexes.values()
            ) if existing_indexes else False
            if not has_user_id_index:
                logger.info("Creating scalar index on user_id")
                table.create_scalar_index("user_id")
                logger.info("user_id index created successfully")
        except Exception as e:
            logger.warning(f"Could not create user_id index: {e}")
    return db
