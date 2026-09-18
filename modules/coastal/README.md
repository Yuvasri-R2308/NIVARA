# 🌊 Coastal Erosion & Wave Action Monitoring Module — Podampeta, Ganjam, Odisha

> **NIVARA Multi-Hazard Platform | Pipeline Module 03-CE**  
> *Target Area: Podampeta Coastal Sector, Ganjam District, Odisha (Rushikulya Estuary to Gopalpur)*  
> *Study Coordinates: 19.3780° N, 85.0450° E | AOI: [84.9500, 19.2800] to [85.1500, 19.4800]*

---

## 1. Data Source Verification & Provenance

| Component | Official Agency / Source | Access Method | Provenance & Update Frequency |
|---|---|---|---|
| **Wave Climate & Sea State** | **Indian National Centre for Ocean Information Services (INCOIS)** & ECMWF WAM / NOAA WaveWatch III | INCOIS ERDDAP `tabledap` (`wrb_gopalpur`) & Marine MetOcean REST API | **Confirmed Live / Near-Real-Time**: Hourly significant wave height ($H_s$, m), peak wave period ($T_p$, s), swell direction, and storm surge. |
| **Multi-Decadal Shoreline Retreat Baseline** | **National Centre for Coastal Research (NCCR)** & Landsat/Sentinel CoastSat DSAS | Periodic Ingested Shoreline Change Atlas (1990–2024) | **Static Ingested**: Transects documenting long-term coastal erosion rates (mean -2.25 m/yr) and historical cyclone breaches (Phailin, Hudhud, Titli). Stored in `data/raw/satellite_shoreline_podampeta.json`. |
| **Atmospheric Precipitation** | **Strictly Excluded (0.0% Weight)** | N/A | **Zero Rainfall Dependency**: Coastal erosion is mathematically driven by hydrodynamic shear, wave energy flux, and storm surge — never by rainfall. |

---

## 2. API & Documentation Gaps Discovered

> [!IMPORTANT]
> **INCOIS ERDDAP Infrastructure & SSL Behavior**:  
> 1. **SSL Certificate Trust**: INCOIS ERDDAP (`erddap.incois.gov.in`) uses an internal Indian Government National Informatics Centre (NIC) root certificate that is not bundled into standard Mozilla/OpenSSL root stores on commercial client operating systems, producing `CERTIFICATE_VERIFY_FAILED` if strict verification is enforced.  
> 2. **Service Availability**: The public ERDDAP tabledap endpoint is periodically placed in maintenance (returning HTTP 503 Service Unavailable).  
> **Engineering Decision**: The module connects to INCOIS ERDDAP with graceful timeout handling; upon HTTP 503 or SSL interruption, it automatically falls back to the high-resolution Marine MetOcean API (ECMWF WAM / NOAA WaveWatch III) for the exact Podampeta coordinates (`19.378°N, 85.045°E`), tagging the payload with explicit provenance and zero fake data.

---

## 3. Official vs. Project-Calculated Metrics

- **Official Observed Data**:
  - Significant Wave Height ($H_s$): Live meters (e.g. 1.14 m).
  - Peak Wave Period ($T_p$): Live seconds (e.g. 8.5 s).
  - Sea State Category: `Slight`, `Moderate`, `Rough`, `Very Rough`, `High Cyclonic`.
  - Long-Term Shoreline Retreat: NCCR End Point Rate (-2.4 m/yr at Old Podampeta scarp).
- **Project-Calculated Metric**:
  - **`Coastal Erosion Prototype Risk Score` (0–100)**:  
    Calculated via hydrodynamic wave energy flux and geomorphic retreat synthesis:
    $$\text{Score} = 0.45 \times \text{Wave Energy Score}(H_s^2 \cdot T_p) + 0.20 \times \text{Surge Stage Score} + 0.35 \times \text{Satellite Retreat Score} + 0.00 \times \text{Rainfall}$$
  - **Explicit Legal Disclaimer**: Displayed on all UI views and API payloads:  
    `"Prototype Risk Score calculated by NIVARA model — explicitly NOT an official INCOIS, NCCR, or OSDMA hazard declaration."`

---

## 4. Output Schemas

- **Current Snapshot**: `outputs/coastal_current.json`
- **Transects GeoJSON**: `outputs/coastal_transects.geojson` (Old Podampeta Abandoned Scarp, Rushikulya Olive Ridley Beach, New Resettlement Colony, Gokharkuda Fishery Beach)

---

## 5. Exact Steps to Run on Windows

```powershell
# 1. Navigate to the module directory
cd "modules/coastal"

# 2. Run the standalone pipeline
python main.py

# 3. Test the script execution directly
python scripts/fetch_incois_erddap.py
python scripts/calculate_risk.py

# 4. Access through FastAPI (when master server is running on port 8000)
# GET http://127.0.0.1:8000/api/coastal/current
# GET http://127.0.0.1:8000/api/coastal/geojson
# GET http://127.0.0.1:8000/api/coastal/dashboard
```
