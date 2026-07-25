# ==========================================
# 	Sadik Company Support  - MAIN APP
# ==========================================
# This file wires together the FastAPI app: database setup, CORS,
# and every route module. Route logic itself lives in app/routes/*,
# app/crud/*, and app/services/* - this file just assembles them.

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.db.database import Base, engine, get_db
from app.models.user import User
from app.models.ticket import Ticket  # noqa: F401 (needed for metadata.create_all)
from app.models.comment import Comment  # noqa: F401 (needed for metadata.create_all)

from app.schemas.user import UserRegister
from app.crud.user import create_user, get_user_by_email
from app.auth.dependencies import get_current_user
from app.core.config import ALLOWED_ORIGINS

from app.routes import login, tickets, admin, ai, widget


# ==========================================
# FASTAPI APP
# ==========================================

app = FastAPI(
    title="	Sadik Company Support ",
    version="2.0.0",
    description=(
        "Authenticated ticketing platform plus a public, embeddable "
        "AI chat widget that can be dropped into any website."
    )
)


# ==========================================
# ROUTERS
# ==========================================
# Note: login and register share no prefix (they live at the API root),
# everything else is grouped under its own prefix (/tickets, /admin,
# /ai, /widget) as declared inside each router module.

app.include_router(login.router)
app.include_router(tickets.router)
app.include_router(admin.router)
app.include_router(ai.router)
app.include_router(widget.router)


# ==========================================
# DATABASE INITIALIZATION
# ==========================================

Base.metadata.create_all(bind=engine)


# ==========================================
# CORS
# ==========================================
# ALLOWED_ORIGINS defaults to "*" (see backend/.env) so the chat widget
# can be embedded on any external website. If ALLOWED_ORIGINS is set to
# a real list of domains instead of "*", allow_credentials is enabled
# since the origin list is then known and specific.

_using_wildcard = ALLOWED_ORIGINS == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=not _using_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# STATIC FILES (embeddable widget script)
# ==========================================
# Serves backend/app/static/widget.js at /static/widget.js so any website
# can embed the chat widget with a single <script> tag pointed at this API.

app.mount("/static", StaticFiles(directory="app/static"), name="static")


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/")
def home():
    return {
        "message": "	Sadik Company Support  API is running"
    }


# ==========================================
# REGISTER
# ==========================================

@app.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
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


# ==========================================
# CURRENT USER PROFILE
# ==========================================

@app.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }
