"""
FastAPI Router for Flood Inundation Module (Dibrugarh, Assam)
Endpoints:
  GET /api/flood/current    -> Current snapshot with observed gauge data & Prototype Risk Score
  GET /api/flood/geojson    -> FeatureCollection with sector inundation polygons & risk properties
  GET /api/flood/dashboard  -> Complete dashboard payload with sectors & thresholds
"""
import sys
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

try:
    from .scripts.fetch_cwc_gauge import fetch_cwc_gauge_data
    from .scripts.calculate_risk import calculate_flood_risk
except ImportError:
    from scripts.fetch_cwc_gauge import fetch_cwc_gauge_data
    from scripts.calculate_risk import calculate_flood_risk

router = APIRouter(prefix="", tags=["Flood Monitoring — Dibrugarh"])

OUTPUTS_DIR = CURRENT_DIR / "outputs"

@router.get("/current")
def get_flood_current():
    """
    Returns the latest Flood snapshot for Dibrugarh with live gauge observation timestamp,
    real water levels, CWC category, and Flood Prototype Risk Score.
    """
    snapshot_path = OUTPUTS_DIR / "flood_current.json"
    if snapshot_path.exists():
        with open(snapshot_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # If output doesn't exist yet, run live compute
    try:
        g_data = fetch_cwc_gauge_data()
        snapshot, _ = calculate_flood_risk(g_data)
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate flood snapshot: {str(e)}")

@router.get("/geojson")
def get_flood_geojson():
    """
    Returns GeoJSON FeatureCollection of critical flood sectors in Dibrugarh
    (Dibrugarh Town Protection Dyke, Maijan Ghat, Nagakhelia, Oakland Tea Estate).
    """
    geojson_path = OUTPUTS_DIR / "flood_inundation.geojson"
    if geojson_path.exists():
        with open(geojson_path, "r", encoding="utf-8") as f:
            return json.load(f)

    try:
        g_data = fetch_cwc_gauge_data()
        _, geojson = calculate_flood_risk(g_data)
        return geojson
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate flood GeoJSON: {str(e)}")

@router.get("/dashboard")
def get_flood_dashboard():
    """
    Returns complete dashboard status including sector breakdown, thresholds, and CWC metadata.
    """
    return get_flood_current()
