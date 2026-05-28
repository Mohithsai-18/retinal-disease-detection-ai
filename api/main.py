from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import init_db
from predict import router as predict_router
from patients import router as patients_router
from report import router as report_router
from compare import router as compare_router

app = FastAPI(
    title="Retinal Disease Detection API",
    description="AI-powered diagnostic API for retinal fundus images with Grad-CAM.",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, update in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads serving
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(predict_router, prefix="/api/predict", tags=["Prediction"])
app.include_router(patients_router, prefix="/api/patients", tags=["Patients"])
app.include_router(report_router, prefix="/api/report", tags=["Reports"])
app.include_router(compare_router, prefix="/api/compare", tags=["Compare"])

@app.on_event("startup")
async def startup_event():
    await init_db()
    print("Database initialized.")

@app.get("/health", tags=["System"])
async def root():
    return {"status": "healthy", "service": "Retinal AI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
