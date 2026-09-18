# 🏔️ Landslide Monitoring & Early Warning Module — Meppadi, Wayanad, Kerala

> **NIVARA Multi-Hazard Platform | Pipeline Module 01-LS**  
> *Target Area: Meppadi Grama Panchayat, Wayanad District, Western Ghats, Kerala*  
> *Study Coordinates: 11.5510° N, 76.1260° E | AOI: [76.0500, 11.4500] to [76.2500, 11.6500]*

---

## 1. Data Source Verification & Provenance

| Component | Official Agency / Source | Access Method | Provenance & Update Frequency |
|---|---|---|---|
| **Static Susceptibility Layer** | **Geological Survey of India (GSI)** — National Landslide Susceptibility Mapping (NLSM) | Offline Bulk GSI OCBIS Export (Shapefile/JSON) | **Periodic (Non-Live)**: 1:50,000 macro-zonation updated periodically by GSI Southern Region. Stored in `data/raw/gsi_nlsm_meppadi.json`. |
| **Short-Duration Rainfall Trigger** | **MOSDAC INSAT-3D/3DR HEM** & **IMD AWS** | Open-Meteo REST API aligned with IMD station network | **Confirmed Live**: 1-hour, 3-hour, and 24-hour rainfall accumulation updated every 30 minutes. |
| **Soil Pore Saturation** | ECMWF / Open-Meteo Land Surface Hydrology | REST API (`soil_moisture_0_to_1cm`, `soil_moisture_1_to_3cm`) | **Confirmed Live**: Near-real-time volumetric soil water content ($m^3/m^3$) converted to field capacity saturation (%). |

---

## 2. API & Documentation Gaps Discovered

> [!IMPORTANT]
> **GSI Bhukosh API Limitation**:  
> The Geological Survey of India's [Bhukosh portal](https://bhukosh.gsi.gov.in/) and [NGDR portal](https://ngdr.gsi.gov.in/) do **not** expose a documented public, unauthenticated REST API. Access is restricted to registered institutional users downloading static shapefiles via GSI OCBIS.  
> **Engineering Decision**: Consistent with the project's strict anti-scraping policy, official GSI NLSM macro-susceptibility attributes are ingested from official GSI dataset records into `data/raw/gsi_nlsm_meppadi.json` with documented provenance, rather than attempting unauthorized scraping.

---

## 3. Official vs. Project-Calculated Metrics

- **Official Observed Data**:
  - GSI NLSM Susceptibility Class: `Very High` (Mundakkai, Punchirimattam), `High` (Chooralmala, Attamala).
  - Slope Gradient (°): 38.5° (Mundakkai scarp), 24.0° (Chooralmala), 41.2° (Punchirimattam).
  - Measured 24h Rainfall: mm accumulation from meteorological feed.
- **Project-Calculated Metric**:
  - **`Landslide Prototype Risk Score` (0–100)**:  
    Calculated via weighted multi-criteria synthesis:
    $$\text{Score} = 0.40 \times \text{GSI Susceptibility} + 0.40 \times \text{Rainfall Trigger} + 0.20 \times \text{Soil Saturation}$$
  - **Explicit Legal Disclaimer**: Displayed on all UI views and API payloads:  
    `"Prototype Risk Score calculated by NIVARA model — explicitly NOT an official GSI or IMD hazard determination."`

---

## 4. Output Schemas

- **Current Snapshot**: `outputs/landslide_current.json`
- **GeoJSON Sectors**: `outputs/landslide_zones.geojson` (Mundakkai, Chooralmala, Punchirimattam, Attamala polygons)

---

## 5. Exact Steps to Run on Windows

```powershell
# 1. Navigate to the module directory
cd "modules/landslide"

# 2. Run the standalone pipeline
python main.py

# 3. Test the script execution directly
python scripts/fetch_rainfall.py
python scripts/calculate_risk.py

# 4. Access through FastAPI (when master server is running on port 8000)
# GET http://127.0.0.1:8000/api/landslide/current
# GET http://127.0.0.1:8000/api/landslide/geojson
# GET http://127.0.0.1:8000/api/landslide/dashboard
```
