from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from .. import models, schemas

router = APIRouter(prefix="/students", tags=["students"])

@router.post("", response_model=schemas.StudentOut)
def create_student(payload: schemas.StudentCreate, db: Session = Depends(get_db)):
    if payload.email:
        exists = db.query(models.Student).filter(models.Student.email == payload.email).first()
        if exists:
            raise HTTPException(409, "Email already exists")
    s = models.Student(name=payload.name, email=payload.email)
    db.add(s); db.commit(); db.refresh(s)
    return s

@router.get("", response_model=List[schemas.StudentOut])
def list_students(db: Session = Depends(get_db)):
    return db.query(models.Student).order_by(models.Student.name).all()
