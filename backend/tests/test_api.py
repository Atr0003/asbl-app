# backend/tests/test_api.py
import os
os.environ["DB_URL"] = "sqlite:///./test.db"  # DB jetable pour tests

from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine

client = TestClient(app)

def setup_module(_):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_health():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["message"].startswith("Backend is running")

def test_monitors_create_and_list():
    r = client.post("/monitors", json={"name":"Alice","email":"alice@examples.org","active":True})
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Alice"
    # duplicate
    r2 = client.post("/monitors", json={"name":"X","email":"alice@examples.org","active":True})
    assert r2.status_code == 409
    # list
    r3 = client.get("/monitors")
    assert r3.status_code == 200
    assert any(m["email"] == "alice@examples.org" for m in r3.json())

def test_sessions_and_attendance_and_report():
    # session
    r = client.post("/sessions", json={
        "date":"2025-10-10","activity":"Cours","location":"ULB",
        "start_time":"17:00:00","end_time":"19:00:00"
    })
    assert r.status_code == 200
    session_id = r.json()["id"]

    # attendance create
    r2 = client.post("/attendance", json={"monitor_id":1,"session_id":session_id,"status":"present","hours":2.0})
    assert r2.status_code == 200
    assert r2.json()["hours"] == 2.0

    # update same pair -> 3.5h
    r3 = client.post("/attendance", json={"monitor_id":1,"session_id":session_id,"status":"present","hours":3.5})
    assert r3.status_code == 200
    assert r3.json()["hours"] == 3.5

    # report month
    r4 = client.get("/reports/monthly", params={"month":"2025-10"})
    assert r4.status_code == 200
    rows = r4.json()
    assert any(row["monitor_name"] == "Alice" and abs(row["total_hours"] - 3.5) < 1e-6 for row in rows)
