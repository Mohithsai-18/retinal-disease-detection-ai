from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
import os
import sys
import uuid
import random

# Add model path so we can import model components
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'model'))

try:
    from demo_model import demo_model_instance
except ImportError:
    demo_model_instance = None

router = APIRouter()

class CompareRequest(BaseModel):
    baseline_id: str
    current_id: str

@router.post("/progression", summary="Compare two scans to detect disease progression")
async def calculate_progression(req: CompareRequest):
    """
    In a real app, this would fetch the images using baseline_id and current_id
    from the database, run them through a Siamese Network or compare bounding 
    boxes of lesions detected by the model to calculate progression metrics.

    Here we simulate the logic for demo purposes based on UI requirements.
    """
    
    # Simulate a delay for processing
    import asyncio
    await asyncio.sleep(1.5)
    
    # Generate some realistic mock comparison data
    severity_progression = {
        "baseline": "Moderate NPDR",
        "current": "Proliferative DR",
        "worsened": True
    }
    
    # Using random offsets to simulate real varied data
    ma_base = random.randint(10, 20)
    ma_current = ma_base + random.randint(10, 25)
    
    ex_base = round(random.uniform(1.0, 3.0), 1)
    ex_current = round(ex_base + random.uniform(1.5, 4.0), 1)
    
    metrics = {
        "microaneurysms": {
            "name": "Microaneurysms Count",
            "baseline": ma_base,
            "current": ma_current,
            "change_pct": round(((ma_current - ma_base) / ma_base) * 100),
            "unit": ""
        },
        "exudates": {
            "name": "Exudates Area",
            "baseline": ex_base,
            "current": ex_current,
            "change_pct": round(((ex_current - ex_base) / ex_base) * 100),
            "unit": "mm²"
        },
        "neovascularization": {
            "name": "New Neovascularization",
            "baseline": "None",
            "current": "Detected",
            "worsened": True
        }
    }
    
    clinical_assessment = (
        f"The comparison confirms significant disease progression from {severity_progression['baseline']} "
        f"to {severity_progression['current']}. New neovascularization is evident, indicating a high risk "
        f"of severe vision loss. Immediate specialist intervention is strongly recommended."
    )
    
    return {
        "status": "success",
        "severity_progression": severity_progression,
        "metrics": metrics,
        "clinical_assessment": clinical_assessment,
        "report_ready": True
    }
