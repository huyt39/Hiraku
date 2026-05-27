from datetime import datetime
from typing import Optional
import hashlib
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import col_students, col_results, col_roadmaps

router = APIRouter()


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=6)
    school: Optional[str] = ""
    year: Optional[str] = ""
    target_domain: Optional[str] = "undecided"


class LoginRequest(BaseModel):
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=1)


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2)
    school: Optional[str] = None
    year: Optional[str] = None
    target_domain: Optional[str] = None


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _public_student(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = doc.pop("_id")
    doc.pop("password_hash", None)
    return doc


@router.post("/register")
async def register(req: RegisterRequest):
    existing = await col_students().find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    now = datetime.utcnow().isoformat()
    doc = {
        "_id": str(uuid.uuid4()),
        "name": req.name,
        "email": req.email.lower(),
        "password_hash": _hash_password(req.password),
        "school": req.school,
        "year": req.year,
        "target_domain": req.target_domain,
        "created_at": now,
        "updated_at": now,
    }
    await col_students().insert_one(doc)
    return {"student": _public_student(doc), "session_token": doc["_id"]}


@router.post("/login")
async def login(req: LoginRequest):
    doc = await col_students().find_one({"email": req.email.lower()})
    if not doc or doc.get("password_hash") != _hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"student": _public_student(doc), "session_token": doc["_id"]}


@router.get("/profile/{student_id}")
async def get_profile(student_id: str):
    doc = await col_students().find_one({"_id": student_id})
    if not doc:
        if student_id == "student_001":
            now = datetime.utcnow().isoformat()
            doc = {
                "_id": student_id,
                "name": "Nguyễn Văn A",
                "email": "nguyenvana@student.edu.vn",
                "password_hash": "",
                "school": "Đại học Công nghệ",
                "year": "Năm 3",
                "target_domain": "web",
                "created_at": now,
                "updated_at": now,
            }
            await col_students().insert_one(doc)
        else:
            raise HTTPException(status_code=404, detail="Student not found")

    profile = _public_student(doc)
    profile["assessment_count"] = await col_results().count_documents({"student_id": student_id})
    profile["roadmap_count"] = await col_roadmaps().count_documents({"student_id": student_id})
    return profile


@router.patch("/profile/{student_id}")
async def update_profile(student_id: str, req: ProfileUpdate):
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=422, detail="No profile fields to update")
    updates["updated_at"] = datetime.utcnow().isoformat()

    result = await col_students().update_one({"_id": student_id}, {"$set": updates})
    if result.matched_count == 0:
        doc = {
            "_id": student_id,
            "email": f"{student_id}@local.test",
            "password_hash": "",
            "created_at": datetime.utcnow().isoformat(),
            **updates,
        }
        await col_students().insert_one(doc)

    doc = await col_students().find_one({"_id": student_id})
    return _public_student(doc)
