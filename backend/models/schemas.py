from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class GenderEnum(str, Enum):
    male = "Male"
    female = "Female"
    other = "Other"

class VisitTypeEnum(str, Enum):
    opd = "OPD Visit"
    follow_up = "Follow-up"
    emergency = "Emergency"
    telemedicine = "Telemedicine"

class StatusEnum(str, Enum):
    pending = "pending"
    completed = "completed"
    approved = "approved"

# ── Patient ──────────────────────────────────────────────────────────────
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: GenderEnum
    contact: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[GenderEnum] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None

class PatientResponse(BaseModel):
    patient_id: str
    name: str
    age: int
    gender: str
    contact: Optional[str]
    blood_group: Optional[str]
    allergies: Optional[str]
    medical_history: Optional[str]
    created_at: datetime
    total_visits: int = 0

# ── Note ─────────────────────────────────────────────────────────────────
class SOAPNote(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str

class NoteCreate(BaseModel):
    patient_id: str
    patient_name: str
    patient_age: int
    patient_gender: str
    chief_complaint: str
    visit_type: VisitTypeEnum
    transcript: str
    doctor_name: str = "Dr. Rohan Mehta"

class NoteUpdate(BaseModel):
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    diagnosis: Optional[str] = None
    medications: Optional[str] = None
    follow_up: Optional[str] = None
    approved: Optional[bool] = None

class NoteResponse(BaseModel):
    note_id: str
    patient_id: str
    patient_name: str
    patient_age: int
    patient_gender: str
    chief_complaint: str
    visit_type: str
    doctor_name: str
    subjective: Optional[str]
    objective: Optional[str]
    assessment: Optional[str]
    plan: Optional[str]
    diagnosis: Optional[str]
    medications: Optional[str]
    follow_up: Optional[str]
    approved: bool
    status: str
    created_at: datetime

# ── Transcript ────────────────────────────────────────────────────────────
class TranscriptCreate(BaseModel):
    patient_id: str
    patient_name: str
    raw_text: str
    duration_seconds: Optional[int] = None

class TranscriptResponse(BaseModel):
    transcript_id: str
    patient_id: str
    patient_name: str
    raw_text: str
    duration_seconds: Optional[int]
    created_at: datetime

# ── Auth ─────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "doctor"
    specialization: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    specialization: Optional[str]
    created_at: datetime

# ── AI ────────────────────────────────────────────────────────────────────
class GenerateNoteRequest(BaseModel):
    patient_name: str
    patient_age: int
    patient_gender: str
    chief_complaint: str
    visit_type: str
    transcript: str

class GenerateNoteResponse(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str
    diagnosis: str
    medications: str
    follow_up: str
