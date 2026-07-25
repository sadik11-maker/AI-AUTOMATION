# ==========================================
# 1. IMPORTS
# ==========================================

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session


# ==========================================
# 2. DATABASE
# ==========================================

from app.db.database import get_db


# ==========================================
# 3. MODELS
# ==========================================

from app.models.user import User


# ==========================================
# 4. SCHEMAS
# ==========================================

from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate
)

from app.schemas.comment import (
    CommentCreate
)


# ==========================================
# 5. CRUD - TICKETS
# ==========================================

from app.crud.ticket import (
    create_ticket,
    get_user_tickets,
    get_ticket_by_id,
    update_ticket,
    close_ticket,
    delete_ticket
)


# ==========================================
# 6. CRUD - COMMENTS
# ==========================================

from app.crud.comment import (
    create_comment,
    get_ticket_comments
)


# ==========================================
# 7. AUTHENTICATION
# ==========================================

from app.auth.dependencies import (
    get_current_user
)


# ==========================================
# 8. ROUTER
# ==========================================

router = APIRouter(

    prefix="/tickets",

    tags=[
        "Tickets"
    ]

)


# ==========================================
# 9. CREATE NEW TICKET
# ==========================================

@router.post("")
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

        "message":
        "Ticket Created Successfully",

        "ticket_id":
        new_ticket.id,

        "title":
        new_ticket.title,

        "description":
        new_ticket.description,

        "priority":
        new_ticket.priority,

        "status":
        new_ticket.status

    }


# ==========================================
# 10. GET MY TICKETS
# ==========================================

@router.get("")
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
# 11. GET SINGLE TICKET
# ==========================================

@router.get("/{ticket_id}")
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
# 12. UPDATE MY TICKET
# ==========================================

@router.put("/{ticket_id}")
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

        "message":
        "Ticket Updated Successfully",

        "ticket":
        updated_ticket

    }


# ==========================================
# 13. CLOSE MY TICKET
# ==========================================

@router.patch("/{ticket_id}/close")
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

        "message":
        "Ticket Closed Successfully",

        "ticket":
        closed_ticket

    }


# ==========================================
# 14. DELETE MY TICKET
# ==========================================

@router.delete("/{ticket_id}")
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

        "message":
        "Ticket Deleted Successfully"

    }


# ==========================================
# 15. ADD COMMENT TO TICKET
# ==========================================

@router.post("/{ticket_id}/comments")
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

    # --------------------------------------
    # CHECK TICKET BELONGS TO USER
    # --------------------------------------

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


    # --------------------------------------
    # CREATE COMMENT
    # --------------------------------------

    new_comment = create_comment(

        db=db,

        message=comment.message,

        ticket_id=ticket.id,

        user_id=current_user.id

    )


    return {

        "message":
        "Comment Added Successfully",

        "comment_id":
        new_comment.id,

        "comment":
        new_comment.message

    }


# ==========================================
# 16. GET MY TICKET COMMENTS
# ==========================================

@router.get("/{ticket_id}/comments")
def get_comments(

    ticket_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    # --------------------------------------
    # CHECK TICKET BELONGS TO USER
    # --------------------------------------

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


    # --------------------------------------
    # GET COMMENTS
    # --------------------------------------

    comments = get_ticket_comments(

        db,

        ticket_id

    )


    return comments