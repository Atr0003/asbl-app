from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from ..db import get_db
from .. import models, schemas

router = APIRouter(prefix="/student-attendance", tags=["student-attendance"])

@router.post("", response_model=schemas.StudentAttendanceOut)
def upsert_attendance(payload: schemas.StudentAttendanceUpsert, db: Session = Depends(get_db)):
    # validations de base
    if not db.get(models.Student, payload.student_id):
        raise HTTPException(404, "Student not found")
    if not db.get(models.Course, payload.course_id):
        raise HTTPException(404, "Course not found")

    a = db.query(models.StudentAttendance).filter(
        models.StudentAttendance.student_id == payload.student_id,
        models.StudentAttendance.course_id == payload.course_id,
        models.StudentAttendance.date == payload.date,
    ).first()

    if a:
        a.status = payload.status
        db.commit(); db.refresh(a)
        return a

    a = models.StudentAttendance(
        student_id=payload.student_id,
        course_id=payload.course_id,
        date=payload.date,
        status=payload.status,
    )
    db.add(a); db.commit(); db.refresh(a)
    return a

# Charger les présences d'un jour (pour une "colonne" de grille)
@router.get("/by-day", response_model=List[schemas.StudentAttendanceOut])
def list_by_day(course_id: int, date: date, db: Session = Depends(get_db)):
    return db.query(models.StudentAttendance).filter(
        models.StudentAttendance.course_id == course_id,
        models.StudentAttendance.date == date
    ).all()
