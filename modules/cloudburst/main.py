"""
Cloudburst Module CLI Main Runner — Kedarnath & Mandakini Valley, Uttarakhand
Usage: python modules/cloudburst/main.py
"""
import sys
import json
import logging
from pathlib import Path

# Add module root to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from scripts.fetch_nasa_power import fetch_cloudburst_meteo_data
from scripts.calculate_risk import calculate_cloudburst_risk

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CloudburstMain")

def run_pipeline():
    logger.info("=" * 65)
    logger.info("STARTING CLOUDBURST CONVECTIVE UPDRAFT PIPELINE: KEDARNATH, UTTARAKHAND")
    logger.info("=" * 65)

    # 1. Fetch live alpine telemetry
    meteo_data = fetch_cloudburst_meteo_data()
    logger.info(f"Alpine Data Status: {meteo_data.get('status')}")
    obs = meteo_data.get("atmospheric_observations", {})
    logger.info(
        f"Precipitation 24h: {obs.get('rainfall_24h_mm')} mm | "
        f"Relative Humidity: {obs.get('relative_humidity_2m_pct')}% | "
        f"Temperature: {obs.get('temperature_2m_celsius')} °C"
    )

    # 2. Calculate Cloudburst Prototype Risk Score & Generate GeoJSON
    snapshot, geojson = calculate_cloudburst_risk(meteo_data)

    score_info = snapshot["prototype_risk_score"]
    logger.info("-" * 65)
    logger.info(f"CLOUDBURST PROTOTYPE RISK SCORE: {score_info['score']} / 100 [{score_info['classification']}]")
    logger.info(f"Disclaimer: {score_info['disclaimer']}")
    logger.info(f"Generated GeoJSON Features: {len(geojson.get('features', []))} critical hotspots")
    logger.info("=" * 65)

    return snapshot

if __name__ == "__main__":
    run_pipeline()
