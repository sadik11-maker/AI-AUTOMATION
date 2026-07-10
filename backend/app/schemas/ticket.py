from pydantic import BaseModel, Field


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

    status: str = Field(
        default="Open"
    )