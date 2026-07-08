from fastapi import FastAPI

from app.db.database import Base, engine
from app.models.user import User
from app.schemas.user import UserRegister

# Create all database tables
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


@app.post("/register")
def register(user: UserRegister):
    return {
        "message": "User data received successfully!",
        "data": {
            "full_name": user.full_name,
            "email": user.email
        }
    }