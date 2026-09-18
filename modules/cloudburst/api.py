"""
FastAPI Router for Cloudburst Module (Kedarnath & Mandakini Valley, Uttarakhand)
Endpoints:
  GET /api/cloudburst/current    -> Current snapshot with observed atmospheric data & Prototype Risk Score
  GET /api/cloudburst/geojson    -> FeatureCollection with hotspot polygons & risk properties
  GET /api/cloudburst/dashboard  -> Complete dashboard payload with hotspots & thresholds
"""
import sys
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

try:
    from .scripts.fetch_nasa_power import fetch_cloudburst_meteo_data
    from .scripts.calculate_risk import calculate_cloudburst_risk
except ImportError:
    from scripts.fetch_nasa_power import fetch_cloudburst_meteo_data
    from scripts.calculate_risk import calculate_cloudburst_risk

router = APIRouter(prefix="", tags=["Cloudburst Monitoring — Kedarnath"])

OUTPUTS_DIR = CURRENT_DIR / "outputs"

@router.get("/current")
def get_cloudburst_current():
    """
    Returns the latest Cloudburst snapshot for Kedarnath with live atmospheric observation timestamp,
    real RH2M, precipitation, and Cloudburst Prototype Risk Score.
    """
    snapshot_path = OUTPUTS_DIR / "cloudburst_current.json"
    if snapshot_path.exists():
        with open(snapshot_path, "r", encoding="utf-8") as f:
            return json.load(f)

    try:
        m_data = fetch_cloudburst_meteo_data()
        snapshot, _ = calculate_cloudburst_risk(m_data)
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate cloudburst snapshot: {str(e)}")

@router.get("/geojson")
def get_cloudburst_geojson():
    """
    Returns GeoJSON FeatureCollection of critical cloudburst hotspots in Kedarnath Valley
    (Kedarnath Temple Plain, Mandakini Fluvial Channel, Gaurikund, Sonprayag).
    """
    geojson_path = OUTPUTS_DIR / "cloudburst_hotspots.geojson"
    if geojson_path.exists():
        with open(geojson_path, "r", encoding="utf-8") as f:
            return json.load(f)

    try:
        m_data = fetch_cloudburst_meteo_data()
        _, geojson = calculate_cloudburst_risk(m_data)
        return geojson
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate cloudburst GeoJSON: {str(e)}")

@router.get("/dashboard")
def get_cloudburst_dashboard():
    """
    Returns complete dashboard status including hotspot breakdown, thresholds, and NASA POWER metadata.
    """
    return get_cloudburst_current()
