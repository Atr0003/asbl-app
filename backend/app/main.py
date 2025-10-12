# backend/app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from .db import Base, engine

# ✅ imports explicites des routers
from .routers.monitors import router as monitors_router
from .routers.sessions import router as sessions_router
from .routers.attendance import router as attendance_router
from .routers.reports import router as reports_router
from .routers import courses, students, enrollments, student_attendance, worklogs  

load_dotenv()

#app = FastAPI(title="ASBL API")
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield
    # any shutdown code can go here
app = FastAPI(title="ASBL API", lifespan=lifespan)

origins = [
    "http://localhost:5173",   # Vite dev server
    "http://127.0.0.1:5173"    # parfois utilisé aussi
]

#✅ configuration CORS
app.add_middleware( 
    CORSMiddleware, 
    allow_origins=origins, 
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Backend is running ✅"}

# ✅ enregistrement des routers
app.include_router(monitors_router)
app.include_router(sessions_router)
app.include_router(attendance_router)
app.include_router(reports_router)

#app.include_router(monitors.router)  # existant
app.include_router(courses.router)
app.include_router(students.router)
app.include_router(enrollments.router)
app.include_router(student_attendance.router)
app.include_router(worklogs.router)
