from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid

from database import transcripts_col
from models.schemas import TranscriptCreate, TranscriptResponse

router = APIRouter()

def serialize(doc) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc

@router.post("/", response_model=TranscriptResponse, status_code=201)
async def save_transcript(transcript: TranscriptCreate):
    doc = {
        "transcript_id": f"T{uuid.uuid4().hex[:8].upper()}",
        "created_at": datetime.utcnow(),
        **transcript.dict()
    }
    await transcripts_col.insert_one(doc)
    return serialize(doc)

@router.get("/", response_model=List[TranscriptResponse])
async def get_transcripts(skip: int = 0, limit: int = 50):
    cursor = transcripts_col.find().sort("created_at", -1).skip(skip).limit(limit)
    return [serialize(doc) async for doc in cursor]

@router.get("/{transcript_id}", response_model=TranscriptResponse)
async def get_transcript(transcript_id: str):
    doc = await transcripts_col.find_one({"transcript_id": transcript_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return serialize(doc)

@router.delete("/{transcript_id}")
async def delete_transcript(transcript_id: str):
    result = await transcripts_col.delete_one({"transcript_id": transcript_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return {"message": "Transcript deleted"}
