# NIVARA — System Architecture & Multi-Tiered Design

NIVARA is an enterprise-grade Decision Support Platform built for the **Kerala State Disaster Management Authority (KSDMA)** and National Disaster Response agencies to automate cadastral red-zone demarcation, Bayesian hazard probability updating, and carrying-capacity-constrained relocation allocation.

---

## 🏛️ High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph Frontend["Frontend Layer (Vite + React + TS)"]
        UI["14 Interactive Dashboard Pages"]
        Leaflet["Leaflet GIS Vector Map Engine"]
        Charts["Recharts Hydrometeorology & Diagnostics"]
        State["AppContext (React Context + Hooks)"]
    end

    subgraph Intelligence["Decision Intelligence Layer"]
        HRI["Hazard Risk Index (0-100 Score)"]
        Bayes["Bayesian Beta-Logit (95% Credible Intervals)"]
        XGB["XGBoost ML Classifier (94.10% CV Accuracy)"]
        Mohr["Mohr-Coulomb Geotechnical FoS Calculator"]
        CCAS["Sphere Standards Carrying Capacity Solver"]
    end

    subgraph DataGIS["Data & Spatial Repositories"]
        Raw["datasets/raw/ (16 Official Sources)"]
        Processed["datasets/processed/data.json"]
        GeoJSON["gis/geojson/cadastral_parcels.geojson"]
        Telemetry["Open-Meteo Weather Station API"]
    end

    Telemetry -->|Hourly Ingestion| State
    Raw -->|scripts/data/build_data.py| Processed
    Processed --> State
    GeoJSON --> Leaflet
    State --> HRI
    State --> Bayes
    State --> XGB
    State --> Mohr
    State --> CCAS
    HRI --> UI
    Bayes --> UI
    XGB --> UI
    Mohr --> UI
    CCAS --> UI
```

---

## 📁 Repository Directory Structure

```text
NIVRA/
├── frontend/             # User Interface (React, TypeScript, Tailwind, Vite, Leaflet)
├── backend/              # Server-Side APIs, Microservices & Routing
├── ml/                   # Machine Learning Models (XGBoost 3.4.1, Bayesian Inference)
├── datasets/             # Ingestion Tables, Rainfall, Population, Soil, Elevation
├── gis/                  # Boundaries, Shapefiles, Cadastral GeoJSON Layers
├── scripts/              # Data Pipeline & Automation Utilities
├── docs/                 # Engineering Specifications & Mathematical Proofs
├── tests/                # Test Suites for Frontend, Backend & ML
├── .env.example          # Environment Variable Configuration Template
├── .gitignore            # Git Ignore Rules
└── README.md             # Master Project Overview
```
