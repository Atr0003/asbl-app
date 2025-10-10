# backend/app/routers/reports.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List
from app.db import get_db
from .. import models, schemas

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/monthly", response_model=List[schemas.ReportLine])
def monthly_report(month: str = Query(..., examples="2025-10"), db: Session = Depends(get_db)):
    # month "YYYY-MM"
    try:
        year, m = month.split("-")
        year, m = int(year), int(m)
    except:
        raise ValueError("month must be YYYY-MM")

    q = (
        db.query(
            models.Monitor.id.label("monitor_id"),
            models.Monitor.name.label("monitor_name"),
            func.coalesce(func.sum(models.Attendance.hours), 0.0).label("total_hours"),
        )
        .join(models.Attendance, models.Attendance.monitor_id == models.Monitor.id, isouter=True)
        .join(models.Session, models.Attendance.session_id == models.Session.id, isouter=True)
        .filter(func.strftime("%Y", models.Session.date) == f"{year}")
        .filter(func.strftime("%m", models.Session.date) == f"{m:02d}")
        .group_by(models.Monitor.id, models.Monitor.name)
        .order_by(models.Monitor.name)
    )

    rows = q.all()
    return [schemas.ReportLine(monitor_id=r.monitor_id, monitor_name=r.monitor_name, total_hours=float(r.total_hours or 0)) for r in rows]
