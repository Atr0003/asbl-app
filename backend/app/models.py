# app/models.py
from sqlalchemy import (
    Column, Integer, String, Date, Time, ForeignKey, Enum, Float, UniqueConstraint
)
from sqlalchemy.orm import relationship
from .db import Base
import enum

# ==== EXISTANT ====
class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    excused = "excused"

class Monitor(Base):
    __tablename__ = "monitors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    active = Column(Integer, default=1)
    # relations
    worklogs = relationship("MonitorWorkLog", back_populates="monitor", cascade="all, delete-orphan")

# ==== NOUVEAU NIVEAU COURS ====
class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True)
    name = Column(String(160), nullable=False)
    description = Column(String(255), nullable=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"), nullable=False)  # ← OBLIGATOIRE
    monitor = relationship("Monitor")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")


# ==== ELEVES & INSCRIPTIONS ====

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True)
    name = Column(String(160), nullable=False)         # nom
    first_name = Column(String(160), nullable=False)   # prénom
    class_name = Column(String(80), nullable=False)    # classe (ex: P5A, 3ème, etc.)
    email = Column(String(160), unique=True, index=True, nullable=True)  # optionnel

    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    attendances = relationship("StudentAttendance", back_populates="student", cascade="all, delete-orphan")



class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    __table_args__ = (UniqueConstraint("student_id", "course_id", name="uq_student_course"),)

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

# ==== PRESENCES ELEVES ====
class StudentAttendance(Base):
    __tablename__ = "student_attendances"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.present, nullable=False)
    __table_args__ = (UniqueConstraint("student_id", "course_id", "date", name="uq_student_course_date"),)
    student = relationship("Student")

# ==== JOURNAL DE TRAVAIL MONITEURS ====
class MonitorWorkLog(Base):
    __tablename__ = "monitor_worklogs"
    id = Column(Integer, primary_key=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"), nullable=False)
    date = Column(Date, nullable=False)
    hours = Column(Float, default=0.0)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    monitor = relationship("Monitor")

# ==== SEANCES DE COURS ====
class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    activity = Column(String, nullable=False)
    location = Column(String)
    start_time = Column(Time)
    end_time = Column(Time)


