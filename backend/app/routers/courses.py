from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..db import get_db
from .. import models, schemas

router = APIRouter(prefix="/courses", tags=["courses"])

@router.post("", response_model=schemas.CourseOut)
def create_course(payload: schemas.CourseCreate, db: Session = Depends(get_db)):
    # Moniteur obligatoire + doit exister
    if not db.get(models.Monitor, payload.monitor_id):
        raise HTTPException(404, "Monitor not found")
    c = models.Course(
        name=payload.name,
        description=payload.description,
        monitor_id=payload.monitor_id
    )
    db.add(c); db.commit(); db.refresh(c)
    return c

@router.get("", response_model=List[schemas.CourseOut])
def list_courses(monitor_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Course)
    if monitor_id:
        q = q.filter(models.Course.monitor_id == monitor_id)
    return q.order_by(models.Course.id.desc()).all()
