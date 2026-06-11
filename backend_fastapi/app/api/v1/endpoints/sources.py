from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.services.document_service import document_service
from app.services.vector_service import vector_service

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
    # This will be updated once we have a proper Document schema
    sources = crud.document.get_multi_by_owner(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return sources

@router.post("/upload")
async def upload_source(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Upload a new document as a source.
    """
    try:
        doc = await document_service.process_upload(db, file, current_user.id)
        return {"status": "success", "filename": doc.filename, "id": doc.id}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing upload: {str(e)}"
        )

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
