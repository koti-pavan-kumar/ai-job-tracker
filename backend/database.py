import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Automatically pulls the cloud connection string from Render environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Fix standard Render connection formatting strings if necessary
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Secure engine connectivity parameters for cloud PostgreSQL
    engine = create_engine(DATABASE_URL)
else:
    # Safe fallback database for local computer coding environments
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