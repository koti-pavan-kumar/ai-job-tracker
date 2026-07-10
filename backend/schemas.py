from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class URLIngestRequest(BaseModel):
    url: str

class AssetGenerationRequest(BaseModel):
    job_id: int
    resume_base: str
    asset_type: str  # "resume" or "cover_letter"

class JobCreate(BaseModel):
    company_name: str
    job_title: str
    jd_url: Optional[str] = None
    raw_jd: str
    parsed_skills: Optional[str] = None
    status: Optional[str] = "Applied"

class JobUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    status: Optional[str] = None
    tailored_resume: Optional[str] = None
    tailored_cover_letter: Optional[str] = None

class JobResponse(BaseModel):
    id: int
    company_name: str
    job_title: str
    jd_url: Optional[str]
    raw_jd: str
    parsed_skills: Optional[str]
    status: str
    tailored_resume: Optional[str]
    tailored_cover_letter: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True