import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()


# ==========================================
# DATABASE CONFIGURATION
# ==========================================

DB_HOST = os.getenv(
    "DB_HOST",
    "localhost"
)

DB_PORT = os.getenv(
    "DB_PORT",
    "3306"
)

DB_USER = os.getenv(
    "DB_USER",
    "root"
)

DB_PASSWORD = os.getenv(
    "DB_PASSWORD",
    ""
)

DB_NAME = os.getenv(
    "DB_NAME",
    "ai_customer_support"
)


# ==========================================
# DATABASE URL
# ==========================================

DATABASE_URL = (
    f"mysql+pymysql://"
    f"{DB_USER}:{DB_PASSWORD}@"
    f"{DB_HOST}:{DB_PORT}/"
    f"{DB_NAME}"
)


# ==========================================
# JWT CONFIGURATION
# ==========================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "your-super-secret-key-change-this"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# ==========================================
# AI CONFIGURATION (Groq - free tier)
# ==========================================

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY",
    ""
)

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)

# ==========================================
# CORS CONFIGURATION
# ==========================================
# ALLOWED_ORIGINS="*" allows the widget to be embedded on any website.
# Set a comma-separated list (e.g. "https://a.com,https://b.com") to restrict it.

_allowed_origins_raw = os.getenv(
    "ALLOWED_ORIGINS",
    "*"
)

if _allowed_origins_raw.strip() == "*":
    ALLOWED_ORIGINS = ["*"]
else:
    ALLOWED_ORIGINS = [
        origin.strip()
        for origin in _allowed_origins_raw.split(",")
        if origin.strip()
    ]