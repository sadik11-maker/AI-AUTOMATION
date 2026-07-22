from pydantic import BaseModel, Field
from typing import Literal

class TicketCreate(BaseModel):
    title: str = Field(
        min_length=5,
        max_length=200
    )
    description: str = Field(
        min_length=10
    )
    priority: str = Field(
        default="Medium"
    )

class TicketUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None

class TicketStatusUpdate(BaseModel):
    status: Literal[
        "Open",
        "In Progress",
        "Pending",
        "Resolved",
        "Closed"
    ]