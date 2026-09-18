"""
Flood Module: Prototype Risk Calculation & Inundation GeoJSON Generator
Location: Dibrugarh & Brahmaputra Basin, Assam
Combines:
  (a) CWC Gauge Water Level relative to Warning (104.24m), Danger (105.70m), and HFL (106.48m) [65%]
  (b) Upstream Brahmaputra catchment rainfall [25%]
  (c) Gauge trend velocity [10%]
Generates:
  outputs/flood_current.json
  outputs/flood_inundation.geojson
"""
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("FloodRiskCalc")

MODULE_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = MODULE_DIR / "config" / "config.json"
OUTPUTS_DIR = MODULE_DIR / "outputs"

def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def calculate_flood_risk(gauge_data: dict, config: dict = None) -> dict:
    """
    Computes Flood Prototype Risk Score (0-100) and sector inundation footprint.
    Categorized strictly based on CWC thresholds.
    """
    if config is None:
        config = load_config()

    weights = config.get("risk_weights", {
        "gauge_water_level_ratio": 0.65,
        "upstream_basin_rainfall_24h": 0.25,
        "discharge_velocity_trend": 0.10
    })

    download_time = datetime.now(timezone.utc).isoformat()
    status = gauge_data.get("status", "UNAVAILABLE")

    wl = gauge_data.get("water_level_m_msl")
    warning_l = gauge_data.get("warning_level_m_msl", 104.24)
    danger_l = gauge_data.get("danger_level_m_msl", 105.70)
    hfl = gauge_data.get("highest_flood_level_hfl", 106.48)
    r24 = gauge_data.get("upstream_basin_rainfall_24h_mm")
    trend = gauge_data.get("gauge_trend", "STEADY")

    if wl is not None:
        # Gauge level score:
        # Baseline below warning (<104.24) -> 20-50 pts
        # Warning to Danger (104.24-105.70) -> 50-80 pts
        # Danger to HFL (105.70-106.48) -> 80-95 pts
        # Exceeding HFL (>=106.48) -> 95-100 pts
        if wl < warning_l:
            gauge_score = max(10.0, 20.0 + ((wl - 100.0) / (warning_l - 100.0)) * 30.0)
        elif wl < danger_l:
            gauge_score = 50.0 + ((wl - warning_l) / (danger_l - warning_l)) * 30.0
        elif wl < hfl:
            gauge_score = 80.0 + ((wl - danger_l) / (hfl - danger_l)) * 15.0
        else:
            gauge_score = min(100.0, 95.0 + ((wl - hfl) / 1.0) * 5.0)

        rain_score = min(100.0, max(0.0, ((r24 or 0.0) / 75.0) * 100.0))
        trend_score = 85.0 if trend == "RISING" else 50.0 if trend == "STEADY" else 30.0

        proto_score = round(
            (gauge_score * weights["gauge_water_level_ratio"]) +
            (rain_score * weights["upstream_basin_rainfall_24h"]) +
            (trend_score * weights["discharge_velocity_trend"]),
            1
        )
        level = "EXTREME" if proto_score >= 85 else "SEVERE" if proto_score >= 70 else "ABOVE NORMAL" if proto_score >= 50 else "NORMAL"
    else:
        proto_score = None
        level = "DATA UNAVAILABLE"

    # Critical sectors evaluation
    sectors = config["study_area"]["critical_sectors"]
    sector_results = []
    features = []

    for idx, s in enumerate(sectors):
        clat, clon = s["coordinates"]

        # Sector risk varies by localized topography / elevation relative to river bank
        elev_offset = [ -0.2, 0.4, 0.1, -0.5 ][idx % 4]
        sec_score = round(min(100.0, max(15.0, proto_score + elev_offset * 10)), 1) if proto_score else None
        sec_level = "EXTREME" if sec_score and sec_score >= 85 else "SEVERE" if sec_score and sec_score >= 70 else "ABOVE NORMAL" if sec_score and sec_score >= 50 else "NORMAL" if sec_score else "DATA UNAVAILABLE"

        sector_results.append({
            "sector_id": s["id"],
            "name": s["name"],
            "vulnerability_type": s["vulnerability_type"],
            "prototype_risk_score": sec_score,
            "status": sec_level,
            "coordinates": [clat, clon]
        })

        poly_coords = [[
            [round(clon - 0.010, 4), round(clat - 0.008, 4)],
            [round(clon + 0.010, 4), round(clat - 0.008, 4)],
            [round(clon + 0.010, 4), round(clat + 0.008, 4)],
            [round(clon - 0.010, 4), round(clat + 0.008, 4)],
            [round(clon - 0.010, 4), round(clat - 0.008, 4)]
        ]]

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": poly_coords
            },
            "properties": {
                "sector_id": s["id"],
                "name": s["name"],
                "hazard": "flood",
                "study_location": "Dibrugarh, Assam",
                "vulnerability_type": s["vulnerability_type"],
                "prototype_risk_score": sec_score,
                "risk_level": sec_level,
                "water_level_m_msl": wl,
                "warning_level_m_msl": warning_l,
                "danger_level_m_msl": danger_l,
                "cwc_category": gauge_data.get("cwc_official_category"),
                "status": status,
                "observation_time": gauge_data.get("observation_time"),
                "disclaimer": "Prototype Risk Score calculated by NIVARA model — Not an official Central Water Commission (CWC) flood declaration."
            }
        })

    dashboard_snapshot = {
        "hazard": "flood",
        "module_name": "Dibrugarh Flood Inundation & River Stage Monitoring",
        "study_area": {
            "location_name": "Dibrugarh & Brahmaputra Basin, Assam",
            "river": "Brahmaputra",
            "coordinates": [config["study_area"]["coordinates"]["latitude"], config["study_area"]["coordinates"]["longitude"]],
            "aoi_bounding_box": config["study_area"]["aoi_bounding_box"]
        },
        "status": status,
        "observation_time": gauge_data.get("observation_time"),
        "download_time": download_time,
        "provenance": {
            "primary_gauge_source": "Central Water Commission (CWC) Flood Forecasting Network",
            "station_code": gauge_data.get("station_code"),
            "station_name": gauge_data.get("station_name"),
            "rainfall_source": "IMD Regional Met Centre & Open-Meteo Catchment Inflow",
            "access_method": "NWIC / CWC Station Gauge API + Open-Meteo Hydrology REST"
        },
        "observed_data": {
            "current_water_level_m_msl": wl,
            "warning_level_m_msl": warning_l,
            "danger_level_m_msl": danger_l,
            "highest_flood_level_hfl_m_msl": hfl,
            "freeboard_to_danger_m": gauge_data.get("freeboard_to_danger_m"),
            "cwc_official_category": gauge_data.get("cwc_official_category"),
            "gauge_trend": trend,
            "upstream_basin_rainfall_24h_mm": r24
        },
        "prototype_risk_score": {
            "score": proto_score,
            "classification": level,
            "label": "Flood Prototype Risk Score",
            "weights_used": weights,
            "disclaimer": "Prototype Risk Score calculated by NIVARA model — explicitly NOT an official CWC or ASDMA warning.",
            "critical_sectors": sector_results
        }
    }

    geojson_collection = {
        "type": "FeatureCollection",
        "features": features
    }

    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUTS_DIR / "flood_current.json", "w", encoding="utf-8") as f:
        json.dump(dashboard_snapshot, f, indent=2)

    with open(OUTPUTS_DIR / "flood_inundation.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson_collection, f, indent=2)

    logger.info(f"Successfully generated Flood snapshot and GeoJSON (Overall Score: {proto_score}, Status: {status})")
    return dashboard_snapshot, geojson_collection

if __name__ == "__main__":
    from fetch_cwc_gauge import fetch_cwc_gauge_data
    g_data = fetch_cwc_gauge_data()
    snap, geo = calculate_flood_risk(g_data)
    print(f"Overall Flood Prototype Risk Score: {snap['prototype_risk_score']['score']}")
