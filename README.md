# EstateCRM (EstateOS) — Multi-Tenant Real Estate Platform

A production-ready, full-stack real estate CRM and property management platform built with **React (Vite) + DM Sans Typography** on the frontend and **FastAPI + SQLAlchemy + MySQL/SQLite** on the backend.

---

## 🏗 System Architecture

- **Frontend (`estatecrm/`)**:
  - React 19 + Vite
  - Modern geometric typography system (DM Sans) inspired by executive real estate dashboards
  - Multi-panel CRM: Properties, Leads, Contacts, Deals & Pipeline, Appointments, Tasks, Team Collaboration, Documents Vault, and Analytics
  - Centralized API layer (`src/api/` and `src/services/api.js`) with automatic auth recovery and multi-tenant header management (`X-Tenant-ID`)

- **Backend (`estateCRM backend/`)**:
  - FastAPI + Python 3.12+
  - SQLAlchemy 2.x ORM + Alembic database migrations
  - Row-level multi-tenant isolation (Deny-by-default architecture)
  - Full domain coverage across 18 modules: Auth, Leads, Properties, Listings, Enquiries, Appointments, Tasks, Deals, Finance & Commissions, Organization, Communications, Documents, Analytics, Billing, and Audit
  - Comprehensive automated test suite with pytest

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- (Optional) MySQL 8.0+ or Docker (uses local SQLite `estateos_dev.db` by default)

---

### 2. Backend Setup (`estateCRM backend/`)

```bash
cd "estateCRM backend"

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run server with auto-reload (defaults to http://localhost:8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

To run the backend test suite:
```bash
pytest tests
```

---

### 3. Frontend Setup (`estatecrm/`)

```bash
cd estatecrm

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```

- **Web App**: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Default Agency Admin Credentials (Dev Environment)

- **Email**: `admin@estatecrm.com`
- **Password**: `Password123!`
- **Agency**: Apex Horizon Capital (`t_apex_01`)

---

## 📜 License
MIT License. Developed for enterprise real estate agency mandate and inventory operations.

