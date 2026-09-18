"""
Flood Module CLI Main Runner — Dibrugarh & Brahmaputra Basin, Assam
Usage: python modules/flood/main.py
"""
import sys
import json
import logging
from pathlib import Path

# Add module root to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from scripts.fetch_cwc_gauge import fetch_cwc_gauge_data
from scripts.calculate_risk import calculate_flood_risk

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("FloodMain")

def run_pipeline():
    logger.info("=" * 65)
    logger.info("STARTING FLOOD INUNDATION MONITORING PIPELINE: DIBRUGARH, ASSAM")
    logger.info("=" * 65)

    # 1. Fetch live gauge and basin inflow
    gauge_data = fetch_cwc_gauge_data()
    logger.info(f"CWC Gauge Data Status: {gauge_data.get('status')}")
    logger.info(
        f"Station: {gauge_data.get('station_name')} ({gauge_data.get('station_code')}) | "
        f"Water Level: {gauge_data.get('water_level_m_msl')} m MSL | "
        f"Warning: {gauge_data.get('warning_level_m_msl')} m | Danger: {gauge_data.get('danger_level_m_msl')} m"
    )
    logger.info(f"Official CWC Category: {gauge_data.get('cwc_official_category')} | Trend: {gauge_data.get('gauge_trend')}")

    # 2. Calculate Flood Prototype Risk Score & Generate GeoJSON
    snapshot, geojson = calculate_flood_risk(gauge_data)

    score_info = snapshot["prototype_risk_score"]
    logger.info("-" * 65)
    logger.info(f"FLOOD PROTOTYPE RISK SCORE: {score_info['score']} / 100 [{score_info['classification']}]")
    logger.info(f"Disclaimer: {score_info['disclaimer']}")
    logger.info(f"Generated GeoJSON Features: {len(geojson.get('features', []))} critical sectors")
    logger.info("=" * 65)

    return snapshot

if __name__ == "__main__":
    run_pipeline()
