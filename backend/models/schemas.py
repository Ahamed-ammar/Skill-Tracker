from pydantic import BaseModel, EmailStr
from typing import List, Optional


class JobInput(BaseModel):
    job_text: str


class AnalysisInput(BaseModel):
    resume_text: str
    job_text: str


class SkillGap(BaseModel):
    skill: str
    level: str  # "Critical" | "Secondary"


class RoadmapItem(BaseModel):
    days: str
    skill: str
    tasks: List[str]
    status: str  # "in-progress" | "upcoming" | "locked"


class AnalysisResult(BaseModel):
    match_score: float
    resume_skills: List[str]
    job_skills: List[str]
    skill_gaps: List[SkillGap]
    roadmap: List[RoadmapItem]


# ── Auth schemas ──────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    created_at: str
