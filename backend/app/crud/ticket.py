from sqlalchemy.orm import Session
from app.models.ticket import Ticket


# Create Ticket
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


# Get My Tickets
def get_user_tickets(
    db: Session,
    user_id: int
):

    return (
        db.query(Ticket)
        .filter(Ticket.user_id == user_id)
        .all()
    )


# Get Single Ticket
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


# Update Ticket
def update_ticket(
    db: Session,
    ticket: Ticket,
    title: str = None,
    description: str = None,
    priority: str = None
):

    if title is not None:
        ticket.title = title

    if description is not None:
        ticket.description = description

    if priority is not None:
        ticket.priority = priority

    db.commit()
    db.refresh(ticket)

    return ticket


# Close Ticket
def close_ticket(
    db: Session,
    ticket: Ticket
):

    ticket.status = "Closed"

    db.commit()
    db.refresh(ticket)

    return ticket


# Delete Ticket
def delete_ticket(
    db: Session,
    ticket: Ticket
):

    db.delete(ticket)
    db.commit()


# Admin All Tickets
def get_all_tickets(
    db: Session
):

    return db.query(Ticket).all()
# -----------------------------
# Admin Update Ticket Status
# -----------------------------
def admin_update_status(
    db: Session,
    ticket: Ticket,
    status: str
):

    ticket.status = status

    db.commit()
    db.refresh(ticket)

    return ticket