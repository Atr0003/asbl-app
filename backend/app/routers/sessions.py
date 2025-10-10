# backend/app/routers/sessions.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from .. import models, schemas

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("", response_model=schemas.SessionOut)
def create_session(payload: schemas.SessionCreate, db: Session = Depends(get_db)):
    s = models.Session(**payload.model_dump())
    db.add(s); db.commit(); db.refresh(s)
    return s

@router.get("", response_model=List[schemas.SessionOut])
def list_sessions(db: Session = Depends(get_db)):
    return db.query(models.Session).order_by(models.Session.date.desc()).all()
