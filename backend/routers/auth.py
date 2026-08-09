from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import Optional
import uuid, hashlib, os, jwt

from database import users_col
from models.schemas import UserCreate, UserLogin, UserResponse

router = APIRouter()
security = HTTPBearer(auto_error=False)
SECRET = os.getenv("JWT_SECRET", "clindoc-secret-key-change-in-production")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def serialize(doc) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user: UserCreate):
    existing = await users_col.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "user_id": f"U{uuid.uuid4().hex[:8].upper()}",
        "name": user.name,
        "email": user.email,
        "password_hash": hash_password(user.password),
        "role": user.role,
        "specialization": user.specialization,
        "created_at": datetime.utcnow()
    }
    await users_col.insert_one(doc)
    return serialize(doc)

@router.post("/login")
async def login(creds: UserLogin):
    user = await users_col.find_one({
        "email": creds.email,
        "password_hash": hash_password(creds.password)
    })
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user["user_id"], user["email"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "specialization": user.get("specialization")
        }
    }

@router.get("/me")
async def get_me(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET, algorithms=["HS256"])
        user = await users_col.find_one({"user_id": payload["user_id"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return serialize(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
