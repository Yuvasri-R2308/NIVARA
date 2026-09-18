"""
Landslide Module CLI Main Runner — Meppadi, Wayanad
Usage: python modules/landslide/main.py
"""
import sys
import json
import logging
from pathlib import Path

# Add module root to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from scripts.fetch_rainfall import fetch_live_rainfall
from scripts.calculate_risk import calculate_landslide_risk

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("LandslideMain")

def run_pipeline():
    logger.info("=" * 65)
    logger.info("STARTING LANDSLIDE EARLY WARNING PIPELINE: MEPPADI, WAYANAD")
    logger.info("=" * 65)

    # 1. Fetch live trigger data
    rainfall_data = fetch_live_rainfall()
    logger.info(f"Trigger Data Status: {rainfall_data.get('status')}")
    logger.info(f"Observed 24h Rain: {rainfall_data.get('rainfall_24h_mm')} mm | Soil Saturation: {rainfall_data.get('soil_saturation_pct')}%")

    # 2. Calculate Prototype Risk Score & Generate Outputs
    snapshot, geojson = calculate_landslide_risk(rainfall_data)

    score_info = snapshot["prototype_risk_score"]
    logger.info("-" * 65)
    logger.info(f"LANDSLIDE PROTOTYPE RISK SCORE: {score_info['score']} / 100 [{score_info['classification']}]")
    logger.info(f"Disclaimer: {score_info['disclaimer']}")
    logger.info(f"Generated GeoJSON Features: {len(geojson.get('features', []))} critical sectors")
    logger.info("=" * 65)

    return snapshot

if __name__ == "__main__":
    run_pipeline()
