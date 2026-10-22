from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func
from app.models.document import Document

class CRUDDocument:
    def get(self, db: Session, id: int) -> Optional[Document]:
        return db.query(Document).filter(Document.id == id).first()

    def get_multi_by_owner(
        self, db: Session, *, user_id: int, workspace_id: Optional[int] = None,
        skip: int = 0, limit: int = 100
    ) -> List[Document]:
        query = db.query(Document).filter(Document.user_id == user_id)
        if workspace_id is not None:
            query = query.filter(Document.workspace_id == workspace_id)
        return query.offset(skip).limit(limit).all()

    def get_count_by_owner(self, db: Session, *, user_id: int) -> int:
        return db.query(sql_func.count(Document.id)).filter(
            Document.user_id == user_id
        ).scalar() or 0

    def create_with_owner(
        self, db: Session, *, filename: str, content_type: str, user_id: int,
        processing_status: str = "processing", file_size: Optional[int] = None,
        workspace_id: Optional[int] = None
    ) -> Document:
        db_obj = Document(
            filename=filename,
            content_type=content_type,
            user_id=user_id,
            workspace_id=workspace_id,
            processing_status=processing_status,
            file_size=file_size
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_status(
        self, db: Session, *, id: int, status: str, error: Optional[str] = None
    ) -> Optional[Document]:
        db_obj = db.query(Document).filter(Document.id == id).first()
        if db_obj:
            db_obj.processing_status = status
            db_obj.processing_error = error
            db.commit()
            db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Document:
        obj = db.query(Document).get(id)
        db.delete(obj)
        db.commit()
        return obj

document = CRUDDocument()
