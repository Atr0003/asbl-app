from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from ..db import get_db
from .. import models, schemas

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.post("", response_model=schemas.EnrollmentOut)
def create_enrollment(payload: schemas.EnrollmentCreate, db: Session = Depends(get_db)):
    if not db.get(models.Student, payload.student_id): raise HTTPException(404, "Student not found")
    if not db.get(models.Course, payload.course_id): raise HTTPException(404, "Course not found")

    exists = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == payload.student_id,
        models.Enrollment.course_id == payload.course_id
    ).first()
    if exists: raise HTTPException(409, "Already enrolled")

    e = models.Enrollment(student_id=payload.student_id, course_id=payload.course_id)
    db.add(e); db.commit(); db.refresh(e)
    return e

# Roster d'un cours
@router.get("/course/{course_id}/roster", response_model=List[schemas.RosterItem])
def course_roster(course_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(models.Student.id, models.Student.name, models.Student.first_name, models.Student.class_name)
        .join(models.Enrollment, models.Enrollment.student_id == models.Student.id)
        .filter(models.Enrollment.course_id == course_id)
        .order_by(models.Student.name, models.Student.first_name)
        .all()
    )
    return [
        schemas.RosterItem(
            student_id=r.id,
            student_name=r.name,
            student_first_name=r.first_name,
            student_class=r.class_name
        )
        for r in rows
    ]


@router.delete("", status_code=204)
def delete_enrollment(student_id: int, course_id: int, db: Session = Depends(get_db)):
    e = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == student_id,
        models.Enrollment.course_id == course_id
    ).first()
    if not e:
        raise HTTPException(404, "Enrollment not found")
    db.delete(e); db.commit()
    return
