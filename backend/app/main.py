from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import Base, engine, get_db

from app.models.user import User
from app.models.ticket import Ticket

from app.schemas.user import UserRegister
from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate
)

from app.crud.user import create_user, get_user_by_email
from app.crud.auth import authenticate_user
from app.crud.ticket import (
    create_ticket,
    get_user_tickets,
    get_ticket_by_id,
    update_ticket,
    delete_ticket,
    close_ticket
)

from app.utils.security import verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.dependencies import get_current_user


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


# -----------------------------
# Register
# -----------------------------
@app.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

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


# -----------------------------
# Login
# -----------------------------
@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = authenticate_user(
        db,
        form_data.username
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    if not verify_password(
        form_data.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    access_token = create_access_token(
        {
            "sub": db_user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# -----------------------------
# Current User
# -----------------------------
@app.get("/me")
def get_profile(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email
    }


# -----------------------------
# Create Ticket
# -----------------------------
@app.post("/tickets")
def create_new_ticket(
    ticket: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_ticket = create_ticket(
        db=db,
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        user_id=current_user.id
    )

    return {
        "message": "Ticket Created Successfully",
        "ticket_id": new_ticket.id,
        "title": new_ticket.title,
        "status": new_ticket.status,
        "priority": new_ticket.priority
    }


# -----------------------------
# Get All My Tickets
# -----------------------------
@app.get("/tickets")
def get_my_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    tickets = get_user_tickets(
        db,
        current_user.id
    )

    return tickets


# -----------------------------
# Get Single Ticket
# -----------------------------
@app.get("/tickets/{ticket_id}")
def get_single_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
        user_id=current_user.id
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket
# -----------------------------
# Update Ticket
# -----------------------------
@app.put("/tickets/{ticket_id}")
def update_my_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
        user_id=current_user.id
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    updated_ticket = update_ticket(
        db=db,
        ticket=ticket,
        title=ticket_data.title,
        description=ticket_data.description,
        priority=ticket_data.priority,
        status=ticket_data.status
    )

    return {
        "message": "Ticket Updated Successfully",
        "ticket": updated_ticket
    }
# -----------------------------
# Delete Ticket
# -----------------------------
@app.delete("/tickets/{ticket_id}")
def delete_my_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
        user_id=current_user.id
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    delete_ticket(
        db=db,
        ticket=ticket
    )

    return {
        "message": "Ticket Deleted Successfully"
    }
# -----------------------------
# Close Ticket
# -----------------------------
@app.patch("/tickets/{ticket_id}/close")
def close_my_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
        user_id=current_user.id
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    closed_ticket = close_ticket(
        db=db,
        ticket=ticket
    )

    return {
        "message": "Ticket Closed Successfully",
        "ticket": closed_ticket
    }        