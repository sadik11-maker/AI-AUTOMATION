from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud.user import create_user, get_user_by_email

from app.db.database import Base, engine, get_db
from app.models.user import User
from app.schemas.user import UserRegister
from app.services.user_service import (
    create_user,
    get_user_by_email,
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Customer Support Platform",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "AI Customer Support Platform API is Running 🚀"
    }


@app.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    # Check if email already exists
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    # Create new user
    new_user = create_user(
        db=db,
        full_name=user.full_name,
        email=user.email,
        password=user.password
    )

    return {
        "message": "User registered successfully",
        "id": new_user.id,
        "name": new_user.full_name,
        "email": new_user.email
    }