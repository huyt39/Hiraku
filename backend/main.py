from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from database import connect_db, close_db
from routers import assessment, roadmap, projects, dashboard, ai_suggestion, auth, market

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(
    title="SkillBridge API",
    description="IT Student Skill Assessment & Personalized Roadmap Platform",
    version="2.0.0",
    lifespan=lifespan,
)

# Allow local dev + any Vercel preview/production deployment
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://*.vercel.app",
]
if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # wildcard needed for vercel preview URLs
    allow_credentials=False,       # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(assessment.router,    prefix="/api/assessment",  tags=["Assessment"])
app.include_router(roadmap.router,       prefix="/api/roadmap",     tags=["Roadmap"])
app.include_router(projects.router,      prefix="/api/projects",    tags=["Mini Projects"])
app.include_router(dashboard.router,     prefix="/api/dashboard",   tags=["Dashboard"])
app.include_router(ai_suggestion.router, prefix="/api/ai",          tags=["AI Suggestion"])
app.include_router(auth.router,          prefix="/api/auth",        tags=["Auth & Profile"])
app.include_router(market.router,        prefix="/api/market",      tags=["Market"])

@app.get("/")
def root():
    return {"message": "SkillBridge API v2.0", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}
