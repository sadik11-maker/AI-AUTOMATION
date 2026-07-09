from sqlalchemy.orm import Session

from app.models.ticket import Ticket


def create_ticket(
    db: Session,
    title: str,
    description: str,
    priority: str,
    user_id: int
):

    ticket = Ticket(
        title=title,
        description=description,
        priority=priority,
        user_id=user_id
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket
from app.models.ticket import Ticket


def get_user_tickets(
    db: Session,
    user_id: int
):

    return (
        db.query(Ticket)
        .filter(Ticket.user_id == user_id)
        .all()
    )
def get_ticket_by_id(
    db: Session,
    ticket_id: int,
    user_id: int
):

    return (
        db.query(Ticket)
        .filter(
            Ticket.id == ticket_id,
            Ticket.user_id == user_id
        )
        .first()
    )    