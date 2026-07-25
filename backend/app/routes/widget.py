import secrets

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.crud.user import get_user_by_email, create_user
from app.crud.ticket import create_ticket
from app.auth.jwt_handler import create_access_token


router = APIRouter(
    prefix="/widget",
    tags=["Public Widget"]
)


# ==========================================
# SCHEMA
# ==========================================

class WidgetTicketCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    title: str = Field(min_length=5, max_length=200)
    description: str = Field(min_length=10)
    priority: str = Field(default="Medium")


# ==========================================
# PUBLIC: CREATE A TICKET FROM ANY WEBSITE
# ==========================================
# Called by the embeddable widget when the AI chat can't resolve the
# customer's issue on its own and a human needs to follow up. No login
# is required from the visitor: if this is their first time contacting
# support, an account is created automatically behind the scenes so the
# ticket has somewhere to live, and an access token is handed straight
# back so the widget can let them check their ticket status without
# ever showing them a password screen.

@router.post("/create-ticket")
def widget_create_ticket(
    payload: WidgetTicketCreate,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, payload.email)

    if user is None:
        # Auto-register a lightweight account for this visitor.
        # The random password is never shown to them; access is handled
        # entirely through the access_token returned below.
        random_password = secrets.token_urlsafe(24)

        user = create_user(
            db=db,
            full_name=payload.name,
            email=payload.email,
            password=random_password
        )

    new_ticket = create_ticket(
        db=db,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        user_id=user.id
    )

    access_token = create_access_token(
        data={
            "sub": user.email,
            "email": user.email,
            "role": user.role
        }
    )

    return {
        "message": "Ticket created successfully",
        "ticket_id": new_ticket.id,
        "status": new_ticket.status,
        "access_token": access_token,
        "token_type": "bearer"
    }
