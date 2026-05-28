from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class SeverityDetails(BaseModel):
    grade: int
    color: str
    desc: str

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    class_probs: Dict[str, float]
    heatmap_base64: str
    severity_details: SeverityDetails

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    dob: str
    gender: str
    history: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DiagnosisResponse(BaseModel):
    id: int
    primary_prediction: str
    confidence: float
    severity_grade: int
    created_at: datetime

    class Config:
        from_attributes = True

class ScanResponse(BaseModel):
    id: int
    eye: str
    uploaded_at: datetime
    notes: Optional[str] = None
    diagnoses: List[DiagnosisResponse] = []

    class Config:
        from_attributes = True

class PatientDetailResponse(PatientResponse):
    scans: List[ScanResponse] = []
