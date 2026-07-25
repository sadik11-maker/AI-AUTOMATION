from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(120),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(20),
        default="user",
        nullable=False
    )

    tickets = relationship(
        "Ticket",
        back_populates="owner",
        cascade="all, delete"
    )

    comments = relationship(
        "Comment",
        back_populates="user",
        cascade="all, delete"
    )