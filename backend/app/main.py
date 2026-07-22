# ==========================================
# 1. Imports
# ==========================================

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session


# ==========================================
# 2. Database Imports
# ==========================================

from app.db.database import (
    Base,
    engine,
    get_db
)


# ==========================================
# 3. Models Imports
# ==========================================

from app.models.user import User
from app.models.ticket import Ticket
from app.models.comment import Comment


# ==========================================
# 4. Schema Imports
# ==========================================

from app.schemas.user import UserRegister

from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketStatusUpdate
)

from app.schemas.comment import CommentCreate


# ==========================================
# 5. CRUD Imports
# ==========================================

# User CRUD
from app.crud.user import (
    create_user,
    get_user_by_email
)


# Authentication CRUD
from app.crud.auth import authenticate_user


# Ticket CRUD
from app.crud.ticket import (
    create_ticket,
    get_user_tickets,
    get_ticket_by_id,
    update_ticket,
    close_ticket,
    delete_ticket,
    get_all_tickets,
    admin_update_status
)


# Comment CRUD
from app.crud.comment import (
    create_comment,
    get_ticket_comments
)


# Admin CRUD
from app.crud.admin import (
    get_dashboard_stats
)


# ==========================================
# 6. Security & Authentication Imports
# ==========================================

from app.utils.security import (
    verify_password
)

from app.auth.jwt_handler import (
    create_access_token
)

from app.auth.dependencies import (
    get_current_user
)

from app.auth.admin import (
    admin_required
)


# ==========================================
# 7. Database Initialization
# ==========================================

Base.metadata.create_all(
    bind=engine
)


# ==========================================
# 8. FastAPI Application
# ==========================================

app = FastAPI(
    title="AI Customer Support Platform",
    version="1.0.0"
)


# ==========================================
# 9. CORS Configuration
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================
# 10. Home / Health Check
# ==========================================

@app.get("/")
def home():

    return {
        "message": "AI Customer Support Platform API is Running 🚀"
    }


# ==========================================
# 11. REGISTER API
# ==========================================

@app.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    # Check if email already exists
    existing_user = get_user_by_email(
        db,
        user.email
    )

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


# ==========================================
# 12. LOGIN API
# ==========================================

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),

    db: Session = Depends(get_db)
):

    # Find user by email
    db_user = authenticate_user(
        db,
        form_data.username
    )

    # User not found
    if not db_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    # Verify password
    if not verify_password(
        form_data.password,
        db_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    # Create JWT Token
    access_token = create_access_token(
        {
            "sub": db_user.email,

            "role": db_user.role
        }
    )

    return {

        "access_token": access_token,

        "token_type": "bearer",

        "role": db_user.role
    }


# ==========================================
# 13. CURRENT USER PROFILE API
# ==========================================

@app.get("/me")
def get_profile(
    current_user: User = Depends(
        get_current_user
    )
):

    return {

        "id": current_user.id,

        "full_name": current_user.full_name,

        "email": current_user.email,

        "role": current_user.role
    }


# ==========================================
# 14. CREATE NEW TICKET
# ==========================================

@app.post("/tickets")
def create_new_ticket(

    ticket: TicketCreate,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
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

        "description": new_ticket.description,

        "priority": new_ticket.priority,

        "status": new_ticket.status
    }


# ==========================================
# 15. GET MY TICKETS
# ==========================================

@app.get("/tickets")
def get_my_tickets(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
):

    tickets = get_user_tickets(

        db,

        current_user.id
    )

    return tickets


# ==========================================
# 16. GET SINGLE TICKET
# ==========================================

@app.get("/tickets/{ticket_id}")
def get_single_ticket(

    ticket_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
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


# ==========================================
# 17. UPDATE MY TICKET
# ==========================================

@app.put("/tickets/{ticket_id}")
def update_my_ticket(

    ticket_id: int,

    ticket_data: TicketUpdate,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
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

        priority=ticket_data.priority
    )

    return {

        "message": "Ticket Updated Successfully",

        "ticket": updated_ticket
    }


# ==========================================
# 18. CLOSE MY TICKET
# ==========================================

@app.patch("/tickets/{ticket_id}/close")
def close_my_ticket(

    ticket_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
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


# ==========================================
# 19. DELETE MY TICKET
# ==========================================

@app.delete("/tickets/{ticket_id}")
def delete_my_ticket(

    ticket_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
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


# ==========================================
# 20. ADD COMMENT TO TICKET
# ==========================================

@app.post("/tickets/{ticket_id}/comments")
def add_comment(

    ticket_id: int,

    comment: CommentCreate,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
):

    # Check ticket belongs to current user
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

    new_comment = create_comment(

        db=db,

        message=comment.message,

        ticket_id=ticket.id,

        user_id=current_user.id
    )

    return {

        "message": "Comment Added Successfully",

        "comment_id": new_comment.id,

        "comment": new_comment.message
    }


# ==========================================
# 21. GET MY TICKET COMMENTS
# ==========================================

@app.get("/tickets/{ticket_id}/comments")
def get_comments(

    ticket_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
):

    # Check ticket belongs to current user
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

    comments = get_ticket_comments(

        db,

        ticket_id
    )

    return comments


# ==========================================
# 22. ADMIN DASHBOARD
# ==========================================

@app.get("/admin/dashboard")
def admin_dashboard(

    current_user: User = Depends(
        admin_required
    ),

    db: Session = Depends(
        get_db
    )
):

    stats = get_dashboard_stats(

        db
    )

    return {

        "message": f"Welcome {current_user.full_name}",

        "data": stats
    }


# ==========================================
# 23. ADMIN - GET ALL TICKETS
# ==========================================

@app.get("/admin/tickets")
def admin_all_tickets(

    current_user: User = Depends(
        admin_required
    ),

    db: Session = Depends(
        get_db
    )
):

    return get_all_tickets(

        db
    )


# ==========================================
# 24. ADMIN - UPDATE TICKET STATUS
# ==========================================

@app.patch("/admin/tickets/{ticket_id}/status")
def admin_update_ticket_status(

    ticket_id: int,

    status_data: TicketStatusUpdate,

    current_user: User = Depends(
        admin_required
    ),

    db: Session = Depends(
        get_db
    )
):

    ticket = admin_update_status(

        db=db,

        ticket_id=ticket_id,

        status=status_data.status
    )

    if ticket is None:

        raise HTTPException(

            status_code=404,

            detail="Ticket not found"
        )

    return {

        "message": "Ticket Status Updated Successfully",

        "ticket_id": ticket.id,

        "status": ticket.status
    }