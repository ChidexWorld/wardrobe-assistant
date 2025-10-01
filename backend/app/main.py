from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

from .api import wardrobe, outfits, external_stores
from .routes import auth

load_dotenv()

app = FastAPI(
    title="Interactive Visual Wardrobe & Style Assistant API",
    description="Backend API for wardrobe management, style recommendations, and outfit visualization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

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