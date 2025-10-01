from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from pathlib import Path

from .api import wardrobe, outfits, external_stores
from .routes import auth

load_dotenv()

app = FastAPI(
    title="Interactive Visual Wardrobe & Style Assistant API",
    description="Backend API for wardrobe management, style recommendations, and outfit visualization",
    version="1.0.0"
)

# Get allowed origins from environment variable or use defaults
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handle static directory path - works both locally and on Render
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Include API routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(wardrobe.router)
app.include_router(outfits.router)
app.include_router(external_stores.router)

@app.get("/")
async def root():
    return {"message": "Interactive Visual Wardrobe & Style Assistant API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)