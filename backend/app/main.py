# backend/app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from .db import Base, engine

# ✅ imports explicites des routers
from app.routers.monitors import router as monitors_router
from app.routers.sessions import router as sessions_router
from app.routers.attendance import router as attendance_router
from app.routers.reports import router as reports_router

load_dotenv()

#app = FastAPI(title="ASBL API")
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield
    # any shutdown code can go here
app = FastAPI(title="ASBL API", lifespan=lifespan)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

#✅ configuration CORS
app.add_middleware( 
    CORSMiddleware, 
    allow_origins=[o.strip() for o in origins], 
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
