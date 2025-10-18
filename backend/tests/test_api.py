# backend/tests/test_api.py
import os
# DB SQLite jetable pour les tests (fichier local)
os.environ["DB_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine

client = TestClient(app)


def setup_module(_):
    # Réinitialise le schéma pour une suite propre
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_health():
    r = client.get("/")
    assert r.status_code == 200
    assert "Backend is running" in r.json().get("message", "")


# ---------- MONITORS & COURSES (moniteur obligatoire) ----------

def test_create_monitor_and_list():
    # Crée un moniteur
    r = client.post("/monitors", json={"name": "Alice", "email": "alice@example.org", "active": True})
    assert r.status_code in (200, 201)
    m = r.json()
    assert m["name"] == "Alice"
    assert m["active"] is True

    # Liste
    r2 = client.get("/monitors")
    assert r2.status_code == 200
    emails = [row["email"] for row in r2.json()]
    assert "alice@example.org" in emails


def test_create_course_requires_existing_monitor():
    # Sans monitor_id -> validation FastAPI (422)
    r = client.post("/courses", json={"name": "Natation A"})
    assert r.status_code == 422

    # Monitor inexistant -> 404
    r2 = client.post("/courses", json={"name": "Natation A", "monitor_id": 9999})
    assert r2.status_code == 404

    # OK avec monitor_id = 1
    r3 = client.post("/courses", json={"name": "Natation A", "description": "Débutants", "monitor_id": 1})
    assert r3.status_code in (200, 201)
    c = r3.json()
    assert c["name"] == "Natation A"
    assert c["monitor_id"] == 1

    # Liste des cours (non filtrée)
    r4 = client.get("/courses")
    assert r4.status_code == 200
    names = [row["name"] for row in r4.json()]
    assert "Natation A" in names

    # Liste filtrée par moniteur
    r5 = client.get("/courses", params={"monitor_id": 1})
    assert r5.status_code == 200
    assert any(row["monitor_id"] == 1 for row in r5.json())


# ---------- STUDENTS & ENROLLMENTS ----------

def test_create_student_enroll_and_roster():
    # Créer un élève
    r = client.post("/students", json={"name": "Doe", "first_name": "John", "class_name": "P5A"})
    assert r.status_code in (200, 201)
    s = r.json()
    assert s["name"] == "Doe"
    assert s["first_name"] == "John"

    # Inscrire au cours id=1
    r2 = client.post("/enrollments", json={"student_id": s["id"], "course_id": 1})
    assert r2.status_code in (200, 201)

    # Roster du cours
    r3 = client.get("/enrollments/course/1/roster")
    assert r3.status_code == 200
    roster = r3.json()
    ids = [row["student_id"] for row in roster]
    assert s["id"] in ids


# ---------- STUDENT ATTENDANCE (par jour) ----------

def test_student_attendance_upsert_and_by_day():
    # Upsert présence PRESENT pour la date donnée
    date_str = "2025-10-21"
    payload = {"student_id": 1, "course_id": 1, "date": date_str, "status": "present"}
    r = client.post("/student-attendance", json=payload)
    assert r.status_code in (200, 201)
    att = r.json()
    assert att["status"] == "present"

    # Changer en ABSENT (même clé: student_id/course_id/date)
    payload["status"] = "absent"
    r2 = client.post("/student-attendance", json=payload)
    assert r2.status_code in (200, 201)
    assert r2.json()["status"] == "absent"

    # Lecture par jour
    r3 = client.get("/student-attendance/by-day", params={"course_id": 1, "date": date_str})
    assert r3.status_code == 200
    rows = r3.json()
    # trouver l'entrée de l'élève 1
    row = next((x for x in rows if x["student_id"] == 1 and x["course_id"] == 1 and x["date"] == date_str), None)
    assert row is not None
    assert row["status"] == "absent"


# ---------- WORKLOGS (présences moniteurs par jour) ----------

def test_worklogs_create_and_list_by_month():
    # Ajoute deux prestations pour le moniteur 1
    r = client.post("/worklogs", json={"monitor_id": 1, "date": "2025-10-21", "hours": 2.0, "course_id": 1})
    assert r.status_code in (200, 201)
    r2 = client.post("/worklogs", json={"monitor_id": 1, "date": "2025-10-22", "hours": 1.5})
    assert r2.status_code in (200, 201)

    # Liste pour le mois
    r3 = client.get("/worklogs", params={"monitor_id": 1, "month": "2025-10"})
    assert r3.status_code == 200
    rows = r3.json()
    # Doit contenir nos deux journées
    dates = sorted([row["date"] for row in rows])
    assert "2025-10-21" in dates and "2025-10-22" in dates
    # Heures totales (2.0 + 1.5) = 3.5
    total_hours = sum(float(row["hours"]) for row in rows)
    assert abs(total_hours - 3.5) < 1e-6


# ---------- ENROLLMENTS (désinscription) ----------

def test_unenroll_student():
    # Confirme qu'il est inscrit
    r0 = client.get("/enrollments/course/1/roster")
    assert r0.status_code == 200
    assert any(row["student_id"] == 1 for row in r0.json())

    # Retire l'élève 1 du cours 1
    r = client.delete("/enrollments", params={"student_id": 1, "course_id": 1})
    assert r.status_code in (200, 204)

    # Roster vide pour cet élève
    r2 = client.get("/enrollments/course/1/roster")
    assert r2.status_code == 200
    assert not any(row["student_id"] == 1 for row in r2.json())
