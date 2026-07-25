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
    TicketStatusUpdate
)


# ==========================================
# 5. CRUD - ADMIN
# ==========================================

from app.crud.admin import (
    get_dashboard_stats
)


# ==========================================
# 6. CRUD - TICKETS
# ==========================================

from app.crud.ticket import (
    get_all_tickets,
    get_ticket_by_id_any,
    admin_update_status
)


# ==========================================
# 6b. CRUD - COMMENTS
# ==========================================

from app.crud.comment import (
    create_comment,
    get_ticket_comments
)

from app.schemas.comment import CommentCreate


# ==========================================
# 7. AUTHENTICATION
# ==========================================

from app.auth.admin import (
    admin_required
)


# ==========================================
# 8. ROUTER
# ==========================================

router = APIRouter(

    prefix="/admin",

    tags=[
        "Admin"
    ]

)


# ==========================================
# 9. ADMIN DASHBOARD
# ==========================================

@router.get("/dashboard")
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

        "message":
        f"Welcome {current_user.full_name}",

        "data":
        stats

    }


# ==========================================
# 10. ADMIN - GET ALL TICKETS
# ==========================================

@router.get("/tickets")
def admin_all_tickets(

    current_user: User = Depends(
        admin_required
    ),

    db: Session = Depends(
        get_db
    )

):

    tickets = get_all_tickets(

        db

    )


    return tickets


# ==========================================
# 11. ADMIN - UPDATE TICKET STATUS
# ==========================================

@router.patch(
    "/tickets/{ticket_id}/status"
)
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

    # --------------------------------------
    # FIND TICKET
    # --------------------------------------

    from app.models.ticket import Ticket


    ticket = (

        db.query(Ticket)

        .filter(
            Ticket.id == ticket_id
        )

        .first()

    )


    # --------------------------------------
    # CHECK TICKET
    # --------------------------------------

    if ticket is None:

        raise HTTPException(

            status_code=404,

            detail="Ticket not found"

        )


    # --------------------------------------
    # UPDATE STATUS
    # --------------------------------------

    updated_ticket = admin_update_status(

        db=db,

        ticket=ticket,

        status=status_data.status

    )


    return {

        "message":
        "Ticket Status Updated Successfully",

        "ticket_id":
        updated_ticket.id,

        "status":
        updated_ticket.status

    }


# ==========================================
# 12. ADMIN - GET ANY SINGLE TICKET
# ==========================================
# Regular users can only fetch tickets they own (see routes/tickets.py).
# Admins need to open ANY customer's ticket, so this route intentionally
# does not filter by user_id.

@router.get("/tickets/{ticket_id}")
def admin_get_ticket(
    ticket_id: int,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):

    ticket = get_ticket_by_id_any(db=db, ticket_id=ticket_id)

    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket


# ==========================================
# 13. ADMIN - GET ANY TICKET'S COMMENTS
# ==========================================

@router.get("/tickets/{ticket_id}/comments")
def admin_get_comments(
    ticket_id: int,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):

    ticket = get_ticket_by_id_any(db=db, ticket_id=ticket_id)

    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return get_ticket_comments(db, ticket_id)


# ==========================================
# 14. ADMIN - REPLY TO ANY TICKET
# ==========================================

@router.post("/tickets/{ticket_id}/comments")
def admin_add_comment(
    ticket_id: int,
    comment: CommentCreate,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):

    ticket = get_ticket_by_id_any(db=db, ticket_id=ticket_id)

    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

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