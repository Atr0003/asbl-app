from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import courses, students, enrollments, student_attendance, worklogs, monitors

app = FastAPI(title="ASBL API")

# CORS (ajoute 127.0.0.1 aussi si besoin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://eduspark-asbl.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(courses.router)
app.include_router(students.router)
app.include_router(enrollments.router)
app.include_router(student_attendance.router)
app.include_router(worklogs.router)
app.include_router(monitors.router)

@app.get("/")
def read_root():
    return {"message": "Backend is running ✅"}
