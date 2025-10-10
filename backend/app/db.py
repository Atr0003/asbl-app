# backend/app/db.py
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DB_URL = os.getenv("DB_URL", "sqlite:///./asbl.db")

# sqlite: check_same_thread=False pour usage multithread (uvicorn)
connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite") else {}
engine = create_engine(DB_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

Base = declarative_base()

@contextmanager
def session_scope():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except:
        db.rollback()
        raise
    finally:
        db.close()

# FastAPI dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
