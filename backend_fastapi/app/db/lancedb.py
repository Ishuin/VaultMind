import lancedb
import os
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
    """
    db = get_lancedb()
    
    # Create the table if it doesn't exist
    if "document_chunks" not in db.table_names():
        db.create_table("document_chunks", schema=DocumentChunk)
        
    return db
