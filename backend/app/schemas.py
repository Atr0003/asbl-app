# backend/app/schemas.py
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import date, time
from typing import Optional
from .models import AttendanceStatus

# ---------- Monitors ----------
class MonitorCreate(BaseModel):
    name: str
    email: EmailStr
    active: bool = True

class MonitorOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    active: bool
    model_config = ConfigDict(from_attributes=True)

# ---------- Sessions ----------
class SessionCreate(BaseModel):
    date: date
    activity: str
    location: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class SessionOut(BaseModel):
    id: int
    date: date
    activity: str
    location: Optional[str]
    start_time: Optional[time]
    end_time: Optional[time]
    model_config = ConfigDict(from_attributes=True)

# ---------- Attendance ----------
class AttendanceCreate(BaseModel):
    monitor_id: int
    session_id: int
    status: AttendanceStatus = AttendanceStatus.present
    hours: float = 0.0

class AttendanceOut(BaseModel):
    id: int
    monitor_id: int
    session_id: int
    status: AttendanceStatus
    hours: float
    model_config = ConfigDict(from_attributes=True)

# ---------- Reports ----------
class ReportLine(BaseModel):
    monitor_id: int
    monitor_name: str
    total_hours: float
