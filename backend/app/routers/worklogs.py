from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import func
from ..db import get_db
from .. import models, schemas

router = APIRouter(prefix="/worklogs", tags=["worklogs"])

@router.post("", response_model=schemas.WorklogOut)
def create_worklog(payload: schemas.WorklogCreate, db: Session = Depends(get_db)):
    if not db.get(models.Monitor, payload.monitor_id):
        raise HTTPException(404, "Monitor not found")
    if payload.course_id and not db.get(models.Course, payload.course_id):
        raise HTTPException(404, "Course not found")

    w = models.MonitorWorkLog(
        monitor_id=payload.monitor_id,
        date=payload.date,
        hours=payload.hours,
        course_id=payload.course_id
    )
    db.add(w); db.commit(); db.refresh(w)
    return w

@router.get("", response_model=List[schemas.WorklogOut])
def list_worklogs(monitor_id: Optional[int] = None, month: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.MonitorWorkLog)
    if monitor_id:
        q = q.filter(models.MonitorWorkLog.monitor_id == monitor_id)
    if month:
        # SQLite: YYYY-MM
        q = q.filter(func.strftime("%Y-%m", models.MonitorWorkLog.date) == month)
    return q.order_by(models.MonitorWorkLog.date.desc()).all()
