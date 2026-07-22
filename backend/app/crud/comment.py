from sqlalchemy.orm import Session

from app.models.comment import Comment


# -----------------------------
# Create Comment
# -----------------------------
def create_comment(
    db: Session,
    message: str,
    ticket_id: int,
    user_id: int
):

    comment = Comment(
        message=message,
        ticket_id=ticket_id,
        user_id=user_id
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment


# -----------------------------
# Get Ticket Comments
# -----------------------------
def get_ticket_comments(
    db: Session,
    ticket_id: int
):

    return (
        db.query(Comment)
        .filter(Comment.ticket_id == ticket_id)
        .all()
    )