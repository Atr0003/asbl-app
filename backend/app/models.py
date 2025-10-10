# backend/app/models.py
from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from .db import Base
import enum

class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"

class Monitor(Base):
    __tablename__ = "monitors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    active = Column(Integer, default=1)

    attendances = relationship("Attendance", back_populates="monitor")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    activity = Column(String(120), nullable=False)
    location = Column(String(120), nullable=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)

    attendances = relationship("Attendance", back_populates="session")

class Attendance(Base):
    __tablename__ = "attendances"
    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.present, nullable=False)
    hours = Column(Float, default=0.0)

    monitor = relationship("Monitor", back_populates="attendances")
    session = relationship("Session", back_populates="attendances")
