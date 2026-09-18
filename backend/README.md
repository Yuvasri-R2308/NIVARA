# NIVARA — Backend API & Microservices

This directory contains the server-side API endpoints, database schemas, and microservice handlers for NIVARA.

---

## 🏗️ Architecture

```text
backend/
├── app/
│   ├── api/             # API Router definitions
│   ├── routes/          # Domain endpoint handlers (hazard, capacity, weather)
│   ├── controllers/     # Business logic orchestrators
│   ├── services/        # External proxies (Open-Meteo, InSAR telemetry)
│   ├── models/          # Relational / Document ORM schemas
│   ├── schemas/         # Pydantic data validation schemas
│   ├── middleware/      # CORS, rate limiting, and security
│   ├── utils/           # Helper functions
│   └── config/          # Environment configuration and endpoints
├── requirements.txt     # Python backend dependencies
└── README.md
```

---

## 🚀 Running the Backend

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start development server with Uvicorn
uvicorn backend.app.api.endpoints:app --reload --port 8000
```
