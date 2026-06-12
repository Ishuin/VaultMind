import lancedb
import os
from loguru import logger
from app.core.config import settings
from lancedb.pydantic import LanceModel, Vector

class DocumentChunk(LanceModel):
    """
    Schema for document chunks in LanceDB.
    """
    id: str  # Unique ID for the chunk (e.g., doc_id_chunk_index)
    document_id: int
    user_id: int
    text: str
    vector: Vector(384)  # Dimension for all-MiniLM-L6-v2
    metadata: str  # JSON string for additional metadata

def get_lancedb():
    """
    Get or create the LanceDB connection.
    The database will be stored at settings.LANCEDB_URI.
    """
    db_path = settings.LANCEDB_URI
    
    # Ensure the directory exists if it's a local path
    if not db_path.startswith("s3://") and not db_path.startswith("azure://"):
        os.makedirs(db_path, exist_ok=True)
        
    return lancedb.connect(db_path)

def init_lancedb():
    """
    Initialize the database and tables if they don't exist.
    Creates indexes for efficient vector search and user filtering.
    """
    db = get_lancedb()
    
    # Create the table if it doesn't exist
    if "document_chunks" not in db.table_names():
        db.create_table("document_chunks", schema=DocumentChunk)
        logger.info("Created document_chunks table")
        
    table = db.open_table("document_chunks")
    count = len(table)
    
    # Create vector index once we have enough data (>= 256 rows for meaningful IVF)
    # IVF_PQ requires at least num_partitions * sample_rate rows to train
    MIN_INDEX_ROWS = 256
    if count >= MIN_INDEX_ROWS:
        try:
            existing_indexes = table.index_stats()
            # Check if vector index already exists (any index on the vector column)
            has_vector_index = any(
                idx.get("columns", [None])[0] == "vector" 
                for idx in existing_indexes.values()
            ) if existing_indexes else False
            
            if not has_vector_index:
                num_partitions = min(max(count // 1000, 2), 1024)
                logger.info(
                    f"Creating IVF_PQ vector index: {count} rows, "
                    f"metric=cosine, num_partitions={num_partitions}"
                )
                table.create_index(
                    metric="cosine",
                    num_partitions=num_partitions,
                    num_sub_vectors=16,
                    index_type="IVF_PQ",
                )
                logger.info("Vector index created successfully")
        except Exception as e:
            logger.warning(f"Could not create vector index (will use flat search): {e}")
    
    # Create scalar index on user_id for faster filtered searches
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
