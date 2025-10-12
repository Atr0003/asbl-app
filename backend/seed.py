# backend/seed.py
import os
from datetime import date, timedelta
from app.db import SessionLocal, Base, engine
from app import models

def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def run():
    reset_db()
    db = SessionLocal()
    try:
        # Moniteur
        alice = models.Monitor(name="Alice Martin", email="alice@demo.org", active=1)
        db.add(alice); db.commit(); db.refresh(alice)

        # Cours
        course = models.Course(name="Natation A", description="Débutants", monitor_id=alice.id)
        db.add(course); db.commit(); db.refresh(course)

        # 5 séances hebdomadaires
        start = date.today()
        sessions = []
        for i in range(5):
            s = models.CourseSession(
                course_id=course.id,
                index=i+1,
                date=start + timedelta(days=7*i),
            )
            db.add(s); sessions.append(s)
        db.commit()

        # Élèves
        students = []
        names = ["Bob", "Cara", "Diane", "Eli", "Farah", "Gus"]
        for n in names:
            st = models.Student(name=n, email=f"{n.lower()}@demo.org")
            db.add(st); students.append(st)
        db.commit()

        # Inscriptions au cours
        for st in students:
            db.add(models.Enrollment(student_id=st.id, course_id=course.id))
        db.commit()

        # Présences (séance 1) : Bob présent, Cara absente, les autres présents
        session1 = db.query(models.CourseSession).filter_by(course_id=course.id, index=1).first()
        present = [students[0], students[2], students[3], students[4], students[5]]  # Bob, Diane, Eli, Farah, Gus
        absent  = [students[1]]  # Cara

        for st in present:
            db.add(models.StudentAttendance(student_id=st.id, session_id=session1.id, status=models.AttendanceStatus.present))
        for st in absent:
            db.add(models.StudentAttendance(student_id=st.id, session_id=session1.id, status=models.AttendanceStatus.absent))
        db.commit()

        # Worklog du moniteur
        db.add(models.MonitorWorkLog(monitor_id=alice.id, date=start, hours=2.0, session_id=session1.id))
        db.commit()

        print("✅ Seed OK")
        print(f"Monitor Alice id={alice.id}, Course id={course.id}, Session1 id={session1.id}")
    finally:
        db.close()

if __name__ == "__main__":
    run()
