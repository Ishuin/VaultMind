from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from loguru import logger

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings
from app.services.document_service import document_service
from app.services.vector_service import vector_service
from app.db.database import SessionLocal

router = APIRouter()

@router.get("/", response_model=List[schemas.Document])
def read_sources(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:

    """
    Retrieve documents (sources).
    """
    sources = crud.document.get_multi_by_owner(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return sources

@router.post("/upload")
async def upload_source(
    *,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Upload a new document as a source.
    Creates SQL record immediately so source appears in list,
    then processes text extraction, chunking, and embedding in background.
    """
    # Read file content to check size
    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    
    # Per-file size limit (synchronous check)
    if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large: {file_size_mb:.1f}MB exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit."
        )
    
    # Per-user document count limit (synchronous check)
    db = SessionLocal()
    try:
        doc_count = crud.document.get_count_by_owner(db=db, user_id=current_user.id)
        if doc_count >= 2000:
            raise HTTPException(
                status_code=413,
                detail=f"Document limit reached: 2000 documents per user. Delete some first."
            )
    finally:
        db.close()
    
    # Create SQL record IMMEDIATELY so source appears in the list
    db = SessionLocal()
    try:
        from app.services.document_service import _detect_content_type
        content_type = _detect_content_type(file.filename, file.content_type or "")
        db_doc = crud.document.create_with_owner(
            db,
            filename=file.filename,
            content_type=content_type,
            user_id=current_user.id,
            processing_status="processing"
        )
        document_id = db_doc.id
        logger.info(f"Created SQL record for document ID: {document_id}")
    finally:
        db.close()
    
    # Store content for background processing
    import io
    file_bytes = content
    filename = file.filename
    user_id = current_user.id
    
    async def _process():
        # Create a fresh db session for background work
        db = SessionLocal()
        try:
            # Simple wrapper that mimics UploadFile for document_service
            class _FileWrapper:
                def __init__(self, filename, content_type, file_bytes):
                    self.filename = filename
                    self.content_type = content_type
                    self._file = io.BytesIO(file_bytes)
                async def read(self):
                    return self._file.read()
            
            bg_file = _FileWrapper(filename, content_type, file_bytes)
            # Process the upload (text extraction, chunking, embedding, LanceDB storage)
            await document_service.process_upload(db, bg_file, user_id, document_id)
            vector_service.maybe_rebuild_index()
            # Mark as completed
            crud.document.update_status(db, id=document_id, status="completed")
            logger.info(f"Background processing complete for {filename} (doc_id={document_id})")
        except Exception as e:
            logger.error(f"Background processing failed for {filename}: {e}")
            # Mark as failed with error message
            try:
                crud.document.update_status(db, id=document_id, status="failed", error=str(e))
            except Exception:
                logger.error(f"Failed to update document status for doc_id={document_id}")
        finally:
            db.close()
    
    background_tasks.add_task(_process)
    
    return {
        "status": "processing",
        "document_id": document_id,
        "filename": filename,
        "size_mb": round(file_size_mb, 2),
        "message": "File uploaded and being processed."
    }

@router.delete("/{document_id}")
async def delete_source(
    *,
    db: Session = Depends(deps.get_db),
    document_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a document and its vector chunks.
    """
    doc = crud.document.get(db, id=document_id)
    if not doc or doc.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    await vector_service.delete_by_document_id(document_id)
    crud.document.remove(db, id=document_id)
    return {"status": "deleted", "id": document_id}
