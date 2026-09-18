"""
FastAPI Router for Landslide Module (Meppadi, Wayanad)
Endpoints:
  GET /api/landslide/current    -> Current snapshot with observed data & Prototype Risk Score
  GET /api/landslide/geojson    -> FeatureCollection with sector polygons & risk properties
  GET /api/landslide/dashboard  -> Complete dashboard payload with sectors & thresholds
"""
import sys
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

try:
    from .scripts.fetch_rainfall import fetch_live_rainfall
    from .scripts.calculate_risk import calculate_landslide_risk
except ImportError:
    from scripts.fetch_rainfall import fetch_live_rainfall
    from scripts.calculate_risk import calculate_landslide_risk

router = APIRouter(prefix="", tags=["Landslide Monitoring — Meppadi"])

OUTPUTS_DIR = CURRENT_DIR / "outputs"

@router.get("/current")
def get_landslide_current():
    """
    Returns the latest Landslide snapshot for Meppadi with live observation timestamp,
    real observed values, provenance, and Landslide Prototype Risk Score.
    """
    snapshot_path = OUTPUTS_DIR / "landslide_current.json"
    if snapshot_path.exists():
        with open(snapshot_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # If output doesn't exist yet, run live compute
    try:
        r_data = fetch_live_rainfall()
        snapshot, _ = calculate_landslide_risk(r_data)
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate landslide snapshot: {str(e)}")

@router.get("/geojson")
def get_landslide_geojson():
    """
    Returns GeoJSON FeatureCollection of critical landslide sectors in Meppadi
    (Mundakkai, Chooralmala, Punchirimattam, Attamala).
    """
    geojson_path = OUTPUTS_DIR / "landslide_zones.geojson"
    if geojson_path.exists():
        with open(geojson_path, "r", encoding="utf-8") as f:
            return json.load(f)

    try:
        r_data = fetch_live_rainfall()
        _, geojson = calculate_landslide_risk(r_data)
        return geojson
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate landslide GeoJSON: {str(e)}")

@router.get("/dashboard")
def get_landslide_dashboard():
    """
    Returns complete dashboard status including sector breakdown, thresholds, and GSI metadata.
    """
    return get_landslide_current()
