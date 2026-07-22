from sqlalchemy.orm import Session
from app.models.user import User
from app.models.ticket import Ticket


def get_dashboard_stats(db: Session):

    total_users = db.query(User).count()

    total_tickets = db.query(Ticket).count()

    open_tickets = (
        db.query(Ticket)
        .filter(Ticket.status == "Open")
        .count()
    )

    closed_tickets = (
        db.query(Ticket)
        .filter(Ticket.status == "Closed")
        .count()
    )

    high_priority = (
        db.query(Ticket)
        .filter(Ticket.priority == "High")
        .count()
    )

    return {
        "total_users": total_users,
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "closed_tickets": closed_tickets,
        "high_priority": high_priority
    }