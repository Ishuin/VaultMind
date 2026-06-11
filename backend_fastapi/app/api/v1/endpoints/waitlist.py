from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.crud.waitlist import waitlist
from app.schemas.waitlist import WaitlistCreate, WaitlistResponse

router = APIRouter()


@router.post("/subscribe", response_model=WaitlistResponse)
def subscribe_to_waitlist(
    *,
    db: Session = Depends(get_db),
    waitlist_in: WaitlistCreate,
):
    """Subscribe to the waitlist"""
    entry = waitlist.create(db, email=waitlist_in.email, source=waitlist_in.source)
    return entry


@router.get("/count")
def get_waitlist_count(
    db: Session = Depends(get_db),
):
    """Get total waitlist count"""
    count = waitlist.count(db)
    return {"count": count}
