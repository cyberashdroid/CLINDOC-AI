import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "clindoc_db")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
patients_col = db["patients"]
notes_col = db["clinical_notes"]
transcripts_col = db["transcripts"]
users_col = db["users"]

async def init_db():
    """Create indexes on startup"""
    await patients_col.create_index("patient_id", unique=True)
    await notes_col.create_index("note_id", unique=True)
    await notes_col.create_index("patient_id")
    await transcripts_col.create_index("transcript_id", unique=True)
    await users_col.create_index("email", unique=True)
    print("✅ Database indexes created")
