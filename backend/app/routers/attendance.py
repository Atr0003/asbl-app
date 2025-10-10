# backend/app/routers/attendance.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from .. import models, schemas

router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.post("", response_model=schemas.AttendanceOut)
def mark_attendance(payload: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    if not db.get(models.Monitor, payload.monitor_id):
        raise HTTPException(404, "Monitor not found")
    if not db.get(models.Session, payload.session_id):
        raise HTTPException(404, "Session not found")

    # Unicité (monitor, session) → empêche doublons simples
    exists = (db.query(models.Attendance)
                .filter(models.Attendance.monitor_id == payload.monitor_id,
                        models.Attendance.session_id == payload.session_id)
                .first())
    if exists:
        # On met à jour plutôt que créer un doublon
        exists.status = payload.status
        exists.hours = payload.hours
        db.commit(); db.refresh(exists)
        return exists

    a = models.Attendance(**payload.model_dump())
    db.add(a); db.commit(); db.refresh(a)
    return a

@router.get("", response_model=List[schemas.AttendanceOut])
def list_attendance(db: Session = Depends(get_db)):
    return db.query(models.Attendance).all()
