# backend/app/routers/monitors.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from .. import models
from .. import schemas

router = APIRouter(prefix="/monitors", tags=["monitors"])

@router.post("", response_model=schemas.MonitorOut, status_code=status.HTTP_201_CREATED)
def create_monitor(payload: schemas.MonitorCreate, db: Session = Depends(get_db)):
    exists = db.query(models.Monitor).filter(models.Monitor.email == payload.email).first()
    if exists:
        raise HTTPException(409, "Email already exists")
    m = models.Monitor(name=payload.name, email=payload.email, active=1 if payload.active else 0)
    db.add(m); db.commit(); db.refresh(m)
    return m

@router.get("", response_model=List[schemas.MonitorOut])
def list_monitors(db: Session = Depends(get_db)):
    return db.query(models.Monitor).order_by(models.Monitor.name).all()
