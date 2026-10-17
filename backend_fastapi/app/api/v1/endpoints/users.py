from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.api import deps
from app import crud, models, schemas
from app.db.database import get_db
from app.crud.subscription import subscription

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    List all users (administrators only).
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    try:
        user = crud.user.create(db, obj_in=user_in)
        
        # Auto-start a 7-day trial for new users
        trial_sub = subscription.create_trial(db, user.id)
        user.subscription_tier = "trial"
        user.trial_end_date = trial_sub.trial_end
        db.commit()
        db.refresh(user)
        
        return user
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Database integrity error: User with this email or username already exists."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred during user creation: {str(e)}"
        )

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.patch("/me/preferences", response_model=schemas.User)
def update_user_preferences(
    *,
    db: Session = Depends(deps.get_db),
    search_internet: bool,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update current user's preferences.
    """
    current_user.search_internet = search_internet
    db.commit()
    db.refresh(current_user)
    return current_user
