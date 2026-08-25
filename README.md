# NIVARA — Multi-Hazard Risk & Smart Relocation Platform

> **Sanskrit Root:** *Nivara* (निवारा) — Protection, Shelter, Refuge.  
> **Target Problem Statement:** SIH26191 — *Intelligent Identification of Hazard-Based Red Zones, Carrying Capacity Assessment, and Immediate Relocation Needs for Vulnerable Habitations.*  
> **Target User:** State Disaster Management Authority (SDMA), Kerala.

---

## 🏛️ System Architecture

NIVARA is a decision-support and spatial relocation intelligence platform designed for State Disaster Management Authority (SDMA) commissioners and engineers. It operationalizes 7 core decision engines across 14 dedicated operational views:

```
NIVARA Pipeline Architecture:
├── Stage 01–03: Data Foundation (Multi-Source Ingestion Checklist, 16/16 Verified)
├── Stage 04–05: Dynamic Red-Zone Map (HRI-Driven Cadastral Risk Scoring)
├── Stage 06:    Vulnerability & Priority Queue (RPI-Ranked Habitation Phasing)
├── Stage 07:    Hazard Impact & Runout (Debris Flow Propagation Simulator)
├── Stage 08:    Candidate Relocation Sites (4-Step Spatial Exclusion Screening)
├── Stage 09:    Carrying Capacity Engine (CCAS Multi-Factor Suitability)
├── Stage 10:    Smart Relocation Engine [CORE] (Multi-Objective Community Pairing)
├── Stage 11:    SDMA Executive Command [SDMA] (War Room & Directives)
├── Stage 12:    Live Early Warning [LIVE] (Hourly Hydrometeorological Feeds)
└── Intelligence Modules:
    ├── InSAR Ground Subsidence & Illegal Construction Surveillance
    ├── 4-Village Inter-Area Vulnerability Comparative Matrix
    ├── Real-Time What-If Rainfall Intensity & Red-Zone Flip Simulator
    ├── Tabular Datasets, Sources & Schema Explorer
    └── Mathematical Methodology & Audit Defense Dossier
```

---

## 🔬 The 7 Core Decision Engines & Formulations

### 1. Multi-Hazard Red-Zone Index (HRI)
$$\text{HRI} = 0.30 \cdot S_{\text{norm}} + 0.25 \cdot R_{\text{norm}} + 0.25 \cdot L_{\text{GSI}} + 0.10 \cdot F_{\text{depth}} + 0.10 \cdot M_{\text{soil}}$$
- **High Risk (Red Zone):** $\text{HRI} \ge 60$ (Mandatory Physical Relocation)
- **Medium Risk (Caution):** $35 \le \text{HRI} < 60$ (Slope Mitigation / Monitoring)
- **Low Risk (Safe):** $\text{HRI} < 35$ (Resilient flatland baseline)

### 2. AI Relocation Priority Score (RPI)
$$\text{RPI} = 0.45(\text{HRI}) + 0.25(\text{PopDensity}) + 0.15(\text{RoadDist}) + 0.15(\text{DisasterHistory})$$

### 3. Carrying Capacity Assessment (CCAS)
$$\text{CCAS} = 0.25(S_{\text{slope}}) + 0.25(W_{\text{water}}) + 0.20(R_{\text{road}}) + 0.15(E_{\text{eco}}) + 0.15(I_{\text{social}})$$

### 4. Smart Relocation Allocation Function
$$\min \sum_{i,j} X_{ij} \cdot \left[ 0.40 d_{ij} + 0.35 (100 - \text{CCAS}_j) + 0.15 C_{\text{transit}} \right]$$

---

## 📊 Benchmark Aggregates (100% Precision Verified)

| Village | Parcels | Avg HRI | Avg Flood P | Avg Landslide P | High Risk | Medium Risk | Low Risk |
|---|---|---|---|---|---|---|---|
| **Achooranam** | 250 | 44.28 | 0.416 | 0.466 | 77 | 169 | 4 |
| **Kottathara** | 250 | 44.14 | 0.421 | 0.437 | 69 | 177 | 4 |
| **Kuppadithara** | 250 | 40.66 | 0.448 | 0.363 | 28 | 216 | 6 |
| **Meppadi (Epicenter)** | 250 | **84.46** | **0.675** | **0.835** | **250 (100%)** | 0 | 0 |

---

## 🛠️ How to Run & Build

### 1. Data Ingestion & Transformation
```bash
# Ingests raw CSVs/GeoJSON into /public/data.json
python scripts/build_data.py
```

### 2. Development Server
```bash
npm install
npm run dev
```

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## ⚖️ Data Transparency & Honesty Protocol

> **CRITICAL CITATION NOTICE:**
> - **Synthetic Prototype Layers:** Parcel-level risk scores (`06_Cadastral_Prototype.csv`) are synthetic demonstrations engineered for algorithmic evaluation and do **not** constitute legal land boundaries.
> - **Official Government Datasets:** IMD 2024 rainfall station observations (July 29–31), KSDMA flood hazard return scenarios, Census of India 2011 demographics, SRTM digital elevation models, and GSI 2022 landslide susceptibility registers are cited official government records.
