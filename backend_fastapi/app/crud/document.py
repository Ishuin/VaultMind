from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.document import Document

class CRUDDocument:
    def get(self, db: Session, id: int) -> Optional[Document]:
        return db.query(Document).filter(Document.id == id).first()

    def get_multi_by_owner(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Document]:
        return (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_with_owner(
        self, db: Session, *, filename: str, content_type: str, user_id: int
    ) -> Document:
        db_obj = Document(
            filename=filename,
            content_type=content_type,
            user_id=user_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Document:
        obj = db.query(Document).get(id)
        db.delete(obj)
        db.commit()
        return obj

document = CRUDDocument()
