from sqlalchemy.orm import Session
from app.models.user import User


def authenticate_user(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()