# Vercel serverless entry point for FastAPI backend
# This file re-exports the FastAPI app so Vercel can find it as `app`
import sys
import os

# Add backend root to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app  # noqa: F401 — Vercel picks up `app` from this module
