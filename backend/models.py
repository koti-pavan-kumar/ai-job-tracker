from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)  # Added phone number column tracking

class JobApplication(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) 
    
    job_title = Column(String)
    company_name = Column(String)
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    jd_url = Column(String, nullable=True)
    raw_jd = Column(Text, nullable=False)
    parsed_skills = Column(Text, nullable=True)  # Comma-separated or JSON string
    status = Column(String, default="Applied")   # Applied, Interviewing, Offered, Rejected
    tailored_resume = Column(Text, nullable=True)
    tailored_cover_letter = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))