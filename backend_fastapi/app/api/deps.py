from typing import Generator, Optional
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core import security
from app.db.database import get_db
from app.models.user import User
from app.schemas.token import TokenData

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/v1/login/access-token"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, security.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenData(sub=payload.get("sub"))
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired or is invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required",
        )
    return current_user


def workspace_context(
    x_workspace_id: Optional[int] = Header(
        None,
        alias="X-Workspace-Id",
        description="Active workspace; defaults to the caller's personal workspace",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Resolve the request's workspace and the caller's role in it.

    Sent as the X-Workspace-Id header (never a path/query param, so it cannot
    collide with /workspaces/{workspace_id} routes). Non-members receive 404
    for an explicit id (no existence leak); role gates are applied by
    endpoints via workspace_service.require_role.
    """
    from app.services.workspace_service import resolve

    return resolve(db, current_user, x_workspace_id)
