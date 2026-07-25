from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    message = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    ticket_id = Column(
        Integer,
        ForeignKey("tickets.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    ticket = relationship(
        "Ticket",
        back_populates="comments"
    )

    user = relationship(
        "User",
        back_populates="comments"
    )