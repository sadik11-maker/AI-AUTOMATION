from fastapi import FastAPI

app = FastAPI(
    title="AI Customer Support Platform",
    description="Backend API for AI-powered customer support.",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "Welcome to AI Customer Support Platform"
    }

@app.get("/health")
def health_check():
    return {
        "status": "OK"
    }