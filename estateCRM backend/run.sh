#!/bin/bash
set -e

# Navigate to script directory
cd "$(dirname "$0")"

echo "=========================================="
echo "    EstateOS Backend Server Launcher     "
echo "=========================================="

# Check for virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

export PYTHONPATH="."

# Seed database if not yet present
if [ ! -f "estateos_dev.db" ] && [ -z "$DATABASE_URL" ]; then
    echo "Initializing local database with seed data..."
    DATABASE_URL_OVERRIDE="sqlite:///estateos_dev.db" python scripts/seed.py
fi

# Set default local database if none specified
if [ -z "$DATABASE_URL" ] && [ -z "$DATABASE_URL_OVERRIDE" ]; then
    export DATABASE_URL_OVERRIDE="sqlite:///estateos_dev.db"
fi

echo "Starting FastAPI on http://localhost:8000"
echo "Interactive Swagger API Docs: http://localhost:8000/docs"
echo "------------------------------------------"

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

