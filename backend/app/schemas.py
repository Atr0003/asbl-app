from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import date
from typing import Optional, List
from .models import AttendanceStatus

# ----- Courses -----
class CourseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    # Moniteur obligatoire
    monitor_id: int

class CourseOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    monitor_id: int
    model_config = ConfigDict(from_attributes=True)

# ----- Students / Enrollments -----
class StudentCreate(BaseModel):
    name: str          # nom
    first_name: str    # prénom
    class_name: str    # classe (ex: P5A)

class StudentOut(BaseModel):
    id: int
    name: str
    first_name: str
    class_name: str
    model_config = ConfigDict(from_attributes=True)

class EnrollmentCreate(BaseModel):
    student_id: int
    course_id: int

class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    model_config = ConfigDict(from_attributes=True)

# Roster d’un cours
class RosterItem(BaseModel):
    student_id: int
    student_name: str
    student_first_name: str
    student_class: str

# ----- Student Attendance (par jour) -----
class StudentAttendanceUpsert(BaseModel):
    student_id: int
    course_id: int
    date: date
    status: AttendanceStatus

class StudentAttendanceOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    date: date
    status: AttendanceStatus
    model_config = ConfigDict(from_attributes=True)

# ----- Worklogs (présences moniteurs) -----
class WorklogCreate(BaseModel):
    monitor_id: int
    date: date
    hours: float
    # rattacher optionnellement à un cours
    course_id: Optional[int] = None

class WorklogOut(BaseModel):
    id: int
    monitor_id: int
    date: date
    hours: float
    course_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

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
