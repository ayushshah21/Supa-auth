from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routes.outreach import router as outreach_router

# Load environment variables
load_dotenv()

app = FastAPI(
    title="OutreachGPT API",
    description="API for generating personalized customer outreach messages",
    version="1.0.0",
    docs_url="/docs",  # Enable Swagger UI
    redoc_url="/redoc",  # Enable ReDoc
)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "https://ticket-ai-chi.vercel.app",
    ],  # Add production URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the outreach routes with proper prefix
app.include_router(outreach_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint to verify API is running."""
    return {"status": "healthy", "message": "OutreachGPT API is running"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
