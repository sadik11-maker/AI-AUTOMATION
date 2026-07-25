from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.security import hash_password


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, full_name: str, email: str, password: str):
    hashed_password = hash_password(password)

    user = User(
        full_name=full_name,
        email=email,
        password=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user