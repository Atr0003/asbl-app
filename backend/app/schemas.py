from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import date, time
from typing import Optional
from .models import AttendanceStatus

# ----- Course / CourseSession -----
class CourseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    monitor_id: Optional[int] = None

class CourseOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    monitor_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class CourseSessionCreate(BaseModel):
    index: int
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class CourseSessionOut(BaseModel):
    id: int
    course_id: int
    index: int
    date: Optional[date]
    start_time: Optional[time]
    end_time: Optional[time]
    model_config = ConfigDict(from_attributes=True)

# ----- Students / Enrollments -----
class StudentCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None

class StudentOut(BaseModel):
    id: int
    name: str
    email: Optional[EmailStr]
    model_config = ConfigDict(from_attributes=True)

class EnrollmentCreate(BaseModel):
    student_id: int
    course_id: int

class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    model_config = ConfigDict(from_attributes=True)

# ----- Student Attendance -----
class StudentAttendanceUpsert(BaseModel):
    student_id: int
    session_id: int
    status: AttendanceStatus

class StudentAttendanceOut(BaseModel):
    id: int
    student_id: int
    session_id: int
    status: AttendanceStatus
    model_config = ConfigDict(from_attributes=True)

# ----- Worklogs -----
class WorklogCreate(BaseModel):
    monitor_id: int
    date: date
    hours: float
    session_id: Optional[int] = None

class WorklogOut(BaseModel):
    id: int
    monitor_id: int
    date: date
    hours: float
    session_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

# ----- Roster (liste élèves d’un cours) -----
class RosterItem(BaseModel):
    student_id: int
    student_name: str
    student_email: Optional[str] = None

# ----- Monitors -----
class MonitorCreate(BaseModel):
    name: str
    email: EmailStr
    active: bool

class MonitorOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    active: bool
    model_config = ConfigDict(from_attributes=True)

class SessionCreate(BaseModel):
    date: date
    activity: str
    location: Optional[str]
    start_time: Optional[time]
    end_time: Optional[time]

class SessionOut(BaseModel):
    id: int
    date: date
    activity: str
    location: Optional[str]
    start_time: Optional[time]
    end_time: Optional[time]
    model_config = ConfigDict(from_attributes=True)

class AttendanceOut(BaseModel):
    id: int
    monitor_id: int
    session_id: int
    status: AttendanceStatus
    hours: float
    model_config = ConfigDict(from_attributes=True)

class AttendanceCreate(BaseModel):
    monitor_id: int
    session_id: int
    status: AttendanceStatus
    hours: float

class ReportLine(BaseModel):
    monitor_id: int
    monitor_name: str
    total_hours: float
    sessions_count: int
    # Ajoute d'autres champs si besoin
