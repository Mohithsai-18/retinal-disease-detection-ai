from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Dict, Any
import os
import aiofiles
import uuid
import sys

# Add model path so we can import model components
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'model'))

try:
    from demo_model import demo_model_instance
except ImportError:
    demo_model_instance = None

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/predict", summary="Predict retinal disease from fundus image")
async def predict(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload JPEG or PNG")

    # Generate unique filename to avoid collisions
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save uploaded file asynchronously
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)

    # Note: In a true production app, we would use the actual PyTorch model weights here.
    # We are using demo_model_instance since the APTOS dataset and GPU training are assumed manual steps.
    try:
        # Run prediction
        result = demo_model_instance.predict(file_path)
        
        # Include original file path or URL for frontend to use if needed
        result["file_path"] = f"/uploads/{filename}"
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
