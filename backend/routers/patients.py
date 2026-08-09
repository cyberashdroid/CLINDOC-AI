from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import uuid

from database import patients_col, notes_col
from models.schemas import PatientCreate, PatientUpdate, PatientResponse

router = APIRouter()

def serialize(doc) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc

@router.post("/", response_model=PatientResponse, status_code=201)
async def create_patient(patient: PatientCreate):
    existing = await patients_col.find_one({"name": patient.name, "age": patient.age})
    if existing:
        return serialize(existing)

    doc = {
        "patient_id": f"P{uuid.uuid4().hex[:6].upper()}",
        "total_visits": 0,
        "created_at": datetime.utcnow(),
        **patient.dict()
    }
    await patients_col.insert_one(doc)
    return serialize(doc)

@router.get("/", response_model=List[PatientResponse])
async def get_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None)
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"patient_id": {"$regex": search, "$options": "i"}}
        ]
    cursor = patients_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    return [serialize(doc) async for doc in cursor]

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str):
    doc = await patients_col.find_one({"patient_id": patient_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Patient not found")
    return serialize(doc)

@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(patient_id: str, update: PatientUpdate):
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    result = await patients_col.find_one_and_update(
        {"patient_id": patient_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return serialize(result)

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str):
    result = await patients_col.delete_one({"patient_id": patient_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient deleted"}

@router.get("/{patient_id}/notes")
async def get_patient_notes(patient_id: str):
    cursor = notes_col.find({"patient_id": patient_id}).sort("created_at", -1)
    notes = [doc async for doc in cursor]
    for n in notes:
        n["_id"] = str(n["_id"])
    return notes
