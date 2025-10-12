from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import select
from ..db import get_db
from .. import models, schemas

router = APIRouter(prefix="/student-attendance", tags=["student-attendance"])

@router.post("", response_model=schemas.StudentAttendanceOut)
def upsert_attendance(payload: schemas.StudentAttendanceUpsert, db: Session = Depends(get_db)):
    if not db.get(models.Student, payload.student_id): raise HTTPException(404, "Student not found")
    if not db.get(models.CourseSession, payload.session_id): raise HTTPException(404, "Session not found")

    a = db.query(models.StudentAttendance).filter(
        models.StudentAttendance.student_id == payload.student_id,
        models.StudentAttendance.session_id == payload.session_id
    ).first()
    if a:
        a.status = payload.status
        db.commit(); db.refresh(a)
        return a

    a = models.StudentAttendance(student_id=payload.student_id, session_id=payload.session_id, status=payload.status)
    db.add(a); db.commit(); db.refresh(a)
    return a

# Pour charger la colonne de la grille (une séance)
@router.get("/by-session", response_model=List[schemas.StudentAttendanceOut])
def list_by_session(session_id: int, db: Session = Depends(get_db)):
    return db.query(models.StudentAttendance).filter(models.StudentAttendance.session_id == session_id).all()
