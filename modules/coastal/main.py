"""
Coastal Erosion Module CLI Main Runner — Podampeta, Ganjam, Odisha
Usage: python modules/coastal/main.py
"""
import sys
import json
import logging
from pathlib import Path

# Add module root to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from scripts.fetch_incois_erddap import fetch_coastal_wave_data
from scripts.calculate_risk import calculate_coastal_risk

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CoastalMain")

def run_pipeline():
    logger.info("=" * 65)
    logger.info("STARTING COASTAL EROSION & WAVE ACTION PIPELINE: PODAMPETA, ODISHA")
    logger.info("=" * 65)

    # 1. Fetch live metocean & wave data
    wave_data = fetch_coastal_wave_data()
    logger.info(f"Metocean Data Status: {wave_data.get('status')}")
    metocean = wave_data.get("metocean_data", {})
    logger.info(
        f"Significant Wave Height (Hs): {metocean.get('significant_wave_height_m')} m | "
        f"Peak Period (Tp): {metocean.get('peak_wave_period_s')} s | "
        f"Estimated Surge: {metocean.get('estimated_surge_m')} m"
    )
    logger.info(f"Sea State: {metocean.get('sea_state_description')}")
    logger.info(f"Rainfall Dependency: NONE (0.0% Weight - Pure Ocean Dynamics)")

    # 2. Calculate Coastal Prototype Risk Score & Generate GeoJSON
    snapshot, geojson = calculate_coastal_risk(wave_data)

    score_info = snapshot["prototype_risk_score"]
    logger.info("-" * 65)
    logger.info(f"COASTAL EROSION PROTOTYPE RISK SCORE: {score_info['score']} / 100 [{score_info['classification']}]")
    logger.info(f"Disclaimer: {score_info['disclaimer']}")
    logger.info(f"Generated GeoJSON Features: {len(geojson.get('features', []))} critical transects")
    logger.info("=" * 65)

    return snapshot

if __name__ == "__main__":
    run_pipeline()
