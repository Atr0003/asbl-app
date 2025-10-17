from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from sqlalchemy import select
from ..db import get_db
from .. import models, schemas

router = APIRouter(prefix="/courses", tags=["courses"])

@router.post("", response_model=schemas.CourseOut)
def create_course(payload: schemas.CourseCreate, db: Session = Depends(get_db)):
    c = models.Course(name=payload.name, description=payload.description, monitor_id=payload.monitor_id)
    db.add(c); db.commit(); db.refresh(c)
    return c

@router.get("", response_model=List[schemas.CourseOut])
def list_courses(monitor_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Course)
    if monitor_id:
        q = q.filter(models.Course.monitor_id == monitor_id)
    return q.order_by(models.Course.id.desc()).all()

@router.post("/{course_id}/sessions/generate", response_model=List[schemas.CourseSessionOut])
def generate_sessions(
    course_id: int,
    count: int = Query(25, ge=1, le=100),
    start_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    course = db.get(models.Course, course_id)
    if not course: raise HTTPException(404, "Course not found")

    # calcule la prochaine index de séance
    max_idx = db.query(models.CourseSession.index).filter(models.CourseSession.course_id == course_id)\
               .order_by(models.CourseSession.index.desc()).first()
    start_idx = (max_idx[0] if max_idx else 0) + 1

    sessions = []
    for i in range(count):
        d = (start_date + timedelta(days=7*i)) if start_date else None  # hebdo si date fournie
        s = models.CourseSession(course_id=course_id, index=start_idx + i, date=d)
        db.add(s); sessions.append(s)
    db.commit()
    for s in sessions: db.refresh(s)
    return sessions

@router.get("/{course_id}/sessions", response_model=List[schemas.CourseSessionOut])
def list_course_sessions(course_id: int, db: Session = Depends(get_db)):
    return db.query(models.CourseSession)\
        .filter(models.CourseSession.course_id == course_id)\
        .order_by(models.CourseSession.index.asc()).all()

from fastapi import Body

@router.post("/{course_id}/sessions/by-date", response_model=schemas.CourseSessionOut)
def get_or_create_session_by_date(
    course_id: int,
    date_: date = Body(..., embed=True, alias="date"),
    db: Session = Depends(get_db),
):
    course = db.get(models.Course, course_id)
    if not course:
        raise HTTPException(404, "Course not found")

    # 1) existe déjà ?
    existing = db.query(models.CourseSession)\
        .where(models.CourseSession.course_id == course_id, models.CourseSession.date == date_)\
        .first()
    if existing:
        return existing

    # 2) sinon créer avec prochain index
    max_idx = db.query(models.CourseSession.index)\
        .filter(models.CourseSession.course_id == course_id)\
        .order_by(models.CourseSession.index.desc()).first()
    next_idx = (max_idx[0] if max_idx else 0) + 1

    s = models.CourseSession(course_id=course_id, index=next_idx, date=date_)
    db.add(s); db.commit(); db.refresh(s)
    return s
