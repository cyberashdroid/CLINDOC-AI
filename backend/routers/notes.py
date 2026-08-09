from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import uuid

from database import notes_col, patients_col
from models.schemas import NoteCreate, NoteUpdate, NoteResponse, GenerateNoteRequest, GenerateNoteResponse
from services.ai_service import generate_soap_note

router = APIRouter()

def serialize(doc) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc

@router.post("/generate", response_model=GenerateNoteResponse)
async def generate_note_ai(req: GenerateNoteRequest):
    """Generate SOAP note from transcript using AI."""
    try:
        result = await generate_soap_note(
            req.patient_name, req.patient_age, req.patient_gender,
            req.chief_complaint, req.visit_type, req.transcript
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@router.post("/", response_model=NoteResponse, status_code=201)
async def create_note(note: NoteCreate):
    """Create and save a new clinical note (with AI generation)."""
    try:
        ai_result = await generate_soap_note(
            note.patient_name, note.patient_age, note.patient_gender,
            note.chief_complaint, note.visit_type, note.transcript
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    doc = {
        "note_id": f"N{uuid.uuid4().hex[:8].upper()}",
        "patient_id": note.patient_id,
        "patient_name": note.patient_name,
        "patient_age": note.patient_age,
        "patient_gender": note.patient_gender,
        "chief_complaint": note.chief_complaint,
        "visit_type": note.visit_type,
        "doctor_name": note.doctor_name,
        "transcript": note.transcript,
        **ai_result,
        "approved": False,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await notes_col.insert_one(doc)

    # Update patient visit count
    await patients_col.update_one(
        {"patient_id": note.patient_id},
        {"$inc": {"total_visits": 1}, "$set": {"last_visit": datetime.utcnow()}}
    )
    return serialize(doc)

@router.get("/", response_model=List[NoteResponse])
async def get_all_notes(
    skip: int = 0,
    limit: int = 50,
    patient_id: Optional[str] = Query(None),
    approved: Optional[bool] = Query(None)
):
    """Get all clinical notes with optional filters."""
    query = {}
    if patient_id:
        query["patient_id"] = patient_id
    if approved is not None:
        query["approved"] = approved

    cursor = notes_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    return [serialize(doc) async for doc in cursor]

@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str):
    doc = await notes_col.find_one({"note_id": note_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Note not found")
    return serialize(doc)

@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, update: NoteUpdate):
    """Update or approve a clinical note."""
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.utcnow()
    if update_data.get("approved"):
        update_data["status"] = "approved"

    result = await notes_col.find_one_and_update(
        {"note_id": note_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Note not found")
    return serialize(result)

@router.delete("/{note_id}")
async def delete_note(note_id: str):
    result = await notes_col.delete_one({"note_id": note_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}

@router.get("/stats/summary")
async def get_stats():
    """Get dashboard statistics."""
    total_notes = await notes_col.count_documents({})
    approved_notes = await notes_col.count_documents({"approved": True})
    pending_notes = await notes_col.count_documents({"approved": False})
    total_patients = await patients_col.count_documents({})
    return {
        "total_notes": total_notes,
        "approved_notes": approved_notes,
        "pending_notes": pending_notes,
        "total_patients": total_patients,
        "approval_rate": round((approved_notes / total_notes * 100) if total_notes > 0 else 0, 1)
    }
