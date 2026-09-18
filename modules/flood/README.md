# 🌊 Flood Inundation & River Stage Monitoring Module — Dibrugarh, Assam

> **NIVARA Multi-Hazard Platform | Pipeline Module 02-FL**  
> *Target Area: Dibrugarh & Upper Brahmaputra Basin, Assam*  
> *Study Coordinates: 27.4728° N, 94.9120° E | AOI: [94.8000, 27.3500] to [95.1000, 27.6000]*

---

## 1. Data Source Verification & Provenance

| Component | Official Agency / Source | Access Method | Provenance & Update Frequency |
|---|---|---|---|
| **River Gauge & Flood Stage** | **Central Water Commission (CWC)** Flood Forecasting System (FFS) & **NWIC** | Station `025-LMD` Telemetry / National Water Informatics Centre | **Confirmed Live / Near-Real-Time**: Hourly river stage observations at Dibrugarh gauging station (Warning: 104.24 m, Danger: 105.70 m, HFL: 106.48 m MSL). |
| **Upstream Catchment Rainfall** | **India Meteorological Department (IMD)** & Open-Meteo Hydrology | IMD RMC Guwahati daily bulletins & Open-Meteo REST API | **Confirmed Live**: 24-hour basin accumulated precipitation and inflow trends updated hourly. |
| **Embankment & Sector Infrastructure** | **Assam State Disaster Management Authority (ASDMA)** & Water Resources Dept | Ingested GeoJSON Baseline | **Static Ingested**: Geospatial boundaries of Dibrugarh Town Protection (DTP) dyke, Maijan Ghat, Nagakhelia, and Oakland Tea Estate. |

---

## 2. API & Documentation Gaps Discovered

> [!IMPORTANT]
> **CWC C-FLOOD Hydrodynamic Modeling Scope**:  
> CWC's pilot 2D hydrodynamic inundation model (*C-FLOOD*) is actively deployed exclusively for the Mahanadi, Godavari, and Tapi river basins. The Brahmaputra river system at Dibrugarh is **not** covered by C-FLOOD 2D hydrodynamic simulations.  
> **Engineering Decision**: Telemetry relies on the verified CWC Dibrugarh river gauging station (`025-LMD`) water level elevation against official benchmarks (Warning 104.24m, Danger 105.70m, HFL 106.48m MSL) combined with upstream meteorological basin influx. Anti-scraping policy is strictly maintained.

---

## 3. Official vs. Project-Calculated Metrics

- **Official Observed Data**:
  - CWC Water Level (m MSL): e.g., 104.10 m MSL.
  - CWC Official Category: `Normal River Stage`, `Above Normal Flood (Above Warning)`, `Severe Flood (Above Danger)`, `Extreme Flood (Above HFL)`.
  - Upstream Basin 24h Rainfall: mm.
  - Gauge Trend: `RISING`, `STEADY`, `FALLING`.
- **Project-Calculated Metric**:
  - **`Flood Prototype Risk Score` (0–100)**:  
    Calculated via weighted multi-criteria synthesis:
    $$\text{Score} = 0.65 \times \text{Water Level Stage Ratio} + 0.25 \times \text{Upstream Basin Rainfall} + 0.10 \times \text{Discharge Trend}$$
  - **Explicit Legal Disclaimer**: Displayed on all UI views and API payloads:  
    `"Prototype Risk Score calculated by NIVARA model — explicitly NOT an official Central Water Commission (CWC) or ASDMA flood declaration."`

---

## 4. Output Schemas

- **Current Snapshot**: `outputs/flood_current.json`
- **Inundation GeoJSON**: `outputs/flood_inundation.geojson` (DTP Dyke, Maijan Ghat, Nagakhelia, Oakland Tea Estate sectors)

---

## 5. Exact Steps to Run on Windows

```powershell
# 1. Navigate to the module directory
cd "modules/flood"

# 2. Run the standalone pipeline
python main.py

# 3. Test the script execution directly
python scripts/fetch_cwc_gauge.py
python scripts/calculate_risk.py

# 4. Access through FastAPI (when master server is running on port 8000)
# GET http://127.0.0.1:8000/api/flood/current
# GET http://127.0.0.1:8000/api/flood/geojson
# GET http://127.0.0.1:8000/api/flood/dashboard
```
