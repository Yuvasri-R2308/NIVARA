"""
FastAPI Router for Coastal Erosion Module (Podampeta, Ganjam, Odisha)
Endpoints:
  GET /api/coastal/current    -> Current snapshot with observed metocean data & Prototype Risk Score
  GET /api/coastal/geojson    -> FeatureCollection with transect polygons & erosion properties
  GET /api/coastal/dashboard  -> Complete dashboard payload with transects & thresholds
"""
import sys
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

try:
    from .scripts.fetch_incois_erddap import fetch_coastal_wave_data
    from .scripts.calculate_risk import calculate_coastal_risk
except ImportError:
    from scripts.fetch_incois_erddap import fetch_coastal_wave_data
    from scripts.calculate_risk import calculate_coastal_risk

router = APIRouter(prefix="", tags=["Coastal Erosion Monitoring — Podampeta"])

OUTPUTS_DIR = CURRENT_DIR / "outputs"

@router.get("/current")
def get_coastal_current():
    """
    Returns the latest Coastal Erosion snapshot for Podampeta with live wave observation timestamp,
    real significant wave height, peak period, surge, and Coastal Erosion Prototype Risk Score.
    Strictly zero rainfall dependency.
    """
    snapshot_path = OUTPUTS_DIR / "coastal_current.json"
    if snapshot_path.exists():
        with open(snapshot_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # If output doesn't exist yet, run live compute
    try:
        w_data = fetch_coastal_wave_data()
        snapshot, _ = calculate_coastal_risk(w_data)
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate coastal snapshot: {str(e)}")

@router.get("/geojson")
def get_coastal_geojson():
    """
    Returns GeoJSON FeatureCollection of critical coastal transects in Podampeta
    (Old Podampeta Abandoned Village Scarp, Rushikulya Nesting Beach, New Resettlement Colony, Gokharkuda).
    """
    geojson_path = OUTPUTS_DIR / "coastal_transects.geojson"
    if geojson_path.exists():
        with open(geojson_path, "r", encoding="utf-8") as f:
            return json.load(f)

    try:
        w_data = fetch_coastal_wave_data()
        _, geojson = calculate_coastal_risk(w_data)
        return geojson
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate coastal GeoJSON: {str(e)}")

@router.get("/dashboard")
def get_coastal_dashboard():
    """
    Returns complete dashboard status including transect breakdown, thresholds, and INCOIS/NCCR metadata.
    """
    return get_coastal_current()
