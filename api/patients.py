from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db, Patient, Scan, Diagnosis
from schemas import PatientCreate, PatientResponse, PatientDetailResponse

router = APIRouter()

@router.post("/", response_model=PatientResponse, summary="Create a new patient record")
async def create_patient(patient: PatientCreate, db: AsyncSession = Depends(get_db)):
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    await db.commit()
    await db.refresh(db_patient)
    return db_patient

@router.get("/", response_model=List[PatientResponse], summary="List all patients")
async def get_patients(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    query = select(Patient).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{patient_id}", response_model=PatientDetailResponse, summary="Get patient details with scans")
async def get_patient(patient_id: int, db: AsyncSession = Depends(get_db)):
    # Simple nested query placeholder - in production use joinedload
    query = select(Patient).where(Patient.id == patient_id)
    result = await db.execute(query)
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # Get scan history (simulated for simplicity, usually done via ORM relationships)
    return {
        "id": patient.id,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "dob": patient.dob,
        "gender": patient.gender,
        "history": patient.history,
        "created_at": patient.created_at,
        "scans": [] # Would populate from joinedload
    }
