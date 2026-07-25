from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.crud.user import get_user_by_email
from app.utils.security import verify_password
from app.auth.jwt_handler import create_access_token


router = APIRouter(
    prefix="",
    tags=["Authentication"]
)


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    # 1. Find user by email
    user = get_user_by_email(
        db,
        form_data.username
    )

    # 2. User not found
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 3. Verify password
    if not verify_password(
        form_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 4. Create JWT token
    access_token = create_access_token(
        data={
            "sub": user.email,
            "email": user.email,
            "role": user.role
        }
    )

    # 5. Return token
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }