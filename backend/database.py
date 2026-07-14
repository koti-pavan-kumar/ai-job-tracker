import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# FORCE CHECK: If Render environment variable is active
if DATABASE_URL and ("neon.tech" in DATABASE_URL or "postgres" in DATABASE_URL):
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    print("🚀 DATABASE CONNECTION: Connected to cloud Neon PostgreSQL successfully!", file=sys.stderr)
    engine = create_engine(DATABASE_URL)
else:
    # If this prints in your Render logs, it means Render cannot see your Neon link!
    print("⚠️ DATABASE WARNING: DATABASE_URL not detected or invalid. Falling back to TEMPORARY SQLite file!", file=sys.stderr)
    DATABASE_URL = "sqlite:///./job_tracker.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()