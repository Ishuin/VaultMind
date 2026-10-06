from typing import Optional
from sqlalchemy.orm import Session
from app.models.waitlist import Waitlist


class CRUDWaitlist:
    def get_by_email(self, db: Session, email: str) -> Optional[Waitlist]:
        return db.query(Waitlist).filter(Waitlist.email == email).first()
    
    def create(self, db: Session, email: str, source: str = "landing_page") -> Waitlist:
        # Check if email already exists
        existing = self.get_by_email(db, email)
        if existing:
            return existing
        
        waitlist_entry = Waitlist(email=email, source=source)
        db.add(waitlist_entry)
        db.commit()
        db.refresh(waitlist_entry)
        return waitlist_entry
    
    def count(self, db: Session) -> int:
        return db.query(Waitlist).count()


waitlist = CRUDWaitlist()
