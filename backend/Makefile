# ─────────────────────────────────────────────────────────────────────────────
# SkillBridge Backend — Makefile
# Usage:
#   make dev      → start uvicorn with hot-reload (main entry)
#   make install  → create venv & install deps
#   make test     → run pytest
#   make lint     → run ruff / flake8 if available
#   make clean    → remove __pycache__ and .pytest_cache
# ─────────────────────────────────────────────────────────────────────────────

VENV      := venv
PYTHON    := $(VENV)/bin/python
PIP       := $(VENV)/bin/pip
UVICORN   := $(VENV)/bin/uvicorn
PYTEST    := $(VENV)/bin/pytest

.PHONY: dev install test lint clean help

## ── Default target ───────────────────────────────────────────────────────────
.DEFAULT_GOAL := help

help:
	@echo ""
	@echo "  SkillBridge Backend"
	@echo "  ─────────────────────────────────────────"
	@echo "  make install   Create venv & install deps"
	@echo "  make dev       Start API server (hot-reload)"
	@echo "  make test      Run test suite"
	@echo "  make lint      Lint source code"
	@echo "  make clean     Remove cache files"
	@echo ""

## ── Install: create venv and install requirements ────────────────────────────
install:
	@echo "🐍 Setting up virtual environment..."
	@python3 -m venv $(VENV)
	@$(PIP) install --upgrade pip --quiet
	@$(PIP) install -r requirements.txt --quiet
	@echo "✅ Dependencies installed. Run 'make dev' to start."

## ── Dev: start FastAPI with auto-reload ──────────────────────────────────────
dev: _ensure_venv
	@echo "🚀 Starting SkillBridge API on http://localhost:8000"
	@echo "   Docs: http://localhost:8000/docs"
	@echo "   Press Ctrl+C to stop."
	@$(UVICORN) main:app --reload --host 0.0.0.0 --port 8000

## ── Test: run pytest ─────────────────────────────────────────────────────────
test: _ensure_venv
	@echo "🧪 Running tests..."
	@$(PYTEST) tests/ -v

## ── Lint ─────────────────────────────────────────────────────────────────────
lint: _ensure_venv
	@if [ -f $(VENV)/bin/ruff ]; then \
		$(VENV)/bin/ruff check .; \
	else \
		echo "⚠️  ruff not installed. Add 'ruff' to requirements.txt for linting."; \
	fi

## ── Clean ────────────────────────────────────────────────────────────────────
clean:
	@echo "🧹 Cleaning cache files..."
	@find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	@find . -name "*.pyc" -delete 2>/dev/null || true
	@echo "✅ Clean done."

## ── Internal: ensure venv exists ────────────────────────────────────────────
_ensure_venv:
	@if [ ! -f "$(UVICORN)" ]; then \
		echo "❌ Virtual environment not found. Run 'make install' first."; \
		exit 1; \
	fi
