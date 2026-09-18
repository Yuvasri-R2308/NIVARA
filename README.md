# 🌲 NIVARA — Automated Multi-Hazard Risk & Resilient Relocation Intelligence Platform

> **Smart India Hackathon (SIH26191) | Kerala State Disaster Management Authority (KSDMA) Decision-Support System**  
> *Target Region: Wayanad District, Western Ghats, Kerala (Meppadi, Achooranam, Kottathara, Kuppadithara)*

---

## 🏛️ Project Architecture Overview

```text
NIVRA/
│
├── frontend/                 # Complete React 18 + Vite + TypeScript + Tailwind UI
│   ├── public/               # Static GeoJSON, cached datasets & icons
│   ├── src/
│   │   ├── components/       # Modular UI components
│   │   │   ├── common/       # Header, Sidebar, Footer, StatCards, Chatbot
│   │   │   ├── map/          # Interactive Leaflet GIS mapping engine
│   │   │   ├── capacity/     # Sphere Standards carrying capacity calculators
│   │   │   ├── geotechnical/ # Mohr-Coulomb soil moisture & liquefaction hub
│   │   │   ├── search/       # Instant global categorical search dropdown
│   │   │   ├── modals/       # Multi-hazard detailed dossier & evidence modals
│   │   │   └── risk/         # Factor breakdown & confidence visualizers
│   │   ├── pages/            # 14 Full Dashboard views & Decision Workspaces
│   │   ├── context/          # Global application state (AppContext)
│   │   ├── services/         # Live Open-Meteo weather & Bayesian inference
│   │   ├── utils/            # Capacity solvers & bottleneck algorithms
│   │   ├── data/             # Static area hazard profiles & site registries
│   │   ├── types/            # Complete TypeScript interfaces
│   │   ├── App.tsx           # Main application router
│   │   └── main.tsx          # React application entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── backend/                  # Server-Side APIs & Microservice Controllers
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── routes/           # Hazard, capacity, and weather routes
│   │   ├── controllers/      # Command dispatchers
│   │   ├── services/         # Open-Meteo & InSAR telemetry proxies
│   │   └── config/           # Server settings & CORS configuration
│   ├── requirements.txt
│   └── README.md
│
├── ml/                       # Machine Learning & Bayesian Layer
│   ├── data/                 # Training and processed feature sets
│   ├── models/               # XGBoost weights & Bayesian posterior JSONs
│   ├── training/             # train_xgboost.py (94.10% CV Accuracy)
│   ├── prediction/           # bayesian_risk_inference.py (Beta-Logit with 95% CIs)
│   ├── evaluation/           # evaluate_models.py (Multi-model benchmarks)
│   ├── requirements.txt
│   └── README.md
│
├── datasets/                 # Unified Project Data Repositories
│   ├── raw/                  # 16 official government CSV registers (Census, DEM, IMD, GSI)
│   ├── processed/            # data.json (1.7 MB master database), bayesian_risk.json
│   ├── gis/                  # cadastral_parcels.geojson (1,000 parcel polygons)
│   ├── rainfall/             # IMD precipitation time series & summaries
│   ├── population/           # Census 2011 gender-disaggregated records
│   ├── soil/                 # Soil saturation & moisture matrices
│   └── elevation/            # 30m ALOS PALSAR DEM slope & elevation points
│
├── gis/                      # Spatial GIS Boundary & Polygon Repositories
│   ├── boundaries/           # Official administrative village boundaries
│   ├── geojson/              # Cadastral parcels and runout polygons
│   └── processing/           # Geospatial overlay and buffer tools
│
├── scripts/                  # Data Pipelines & Setup Automation
│   ├── data/
│   │   └── build_data.py     # Master data ingestion generator
│   ├── setup/                # Migration and installation utilities
│   └── deployment/           # Production build and startup scripts
│
├── docs/                     # Engineering & Scientific Documentation
│   ├── architecture/         # SYSTEM_ARCHITECTURE.md
│   ├── ml/                   # ML_METHODOLOGY.md
│   ├── gis/                  # GIS_SPECIFICATION.md
│   └── api/                  # API_REFERENCE.md
│
├── tests/                    # Automated Test Suites
│   ├── frontend/             # Component and UI tests
│   └── ml/                   # Model validation and data integrity tests
│
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore configuration
└── package.json              # Root script runner delegating to frontend/
```

---

## ⚡ Quick Start & Commands

### 1. Run the Frontend Development Server:
```bash
# Run directly from root (or inside frontend/)
npm run dev
```
Open **[http://localhost:3000/](http://localhost:3000/)** in your browser.

### 2. Build for Production:
```bash
npm run build
```

### 3. Re-generate Datasets from Raw CSVs:
```bash
python scripts/data/build_data.py
```

### 4. Train Machine Learning Models:
```bash
# Train XGBoost Classifier (120 Trees, 94.10% CV Accuracy)
python ml/training/train_xgboost.py

# Run Bayesian Beta-Logit Inference
python ml/prediction/bayesian_risk_inference.py
```

---

## 🔬 Multi-Model Triangulation Framework

1. **Hazard Risk Index (HRI 0–100)**: Multi-criteria weighted score for legal cadastral red-zone demarcation.
2. **Bayesian Posterior Probability ($P \in [0, 1]$)**: Beta prior updating with **95% Credible Intervals** ($79\%–93\%$) to eliminate false alarms.
3. **XGBoost Classifier (v3.4.1)**: Empirical ML validation achieving $94.10\%$ 5-Fold Cross-Validation Accuracy.
4. **Mohr-Coulomb Factor of Safety ($\text{FoS}$)**: Dynamic soil pore water pressure liquefaction calculator.
5. **Sphere Standards CCAS Solver**: Weakest-link bottleneck calculation for emergency land carrying capacity.

---

## 👥 Authors & Recognition
Developed for **Smart India Hackathon (SIH 2024 - Problem ID SIH26191)**.  
*Team NIVARA — Transforming Disaster Risk into Resilient Action.*
