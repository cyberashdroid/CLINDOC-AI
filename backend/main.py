from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import patients, notes, transcripts, auth
from database import init_db

app = FastAPI(title="ClinDoc AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(transcripts.router, prefix="/api/transcripts", tags=["Transcripts"])

@app.get("/")
def root():
    return {"status": "ClinDoc AI API running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
