"""
Landslide Module: Prototype Risk Calculation & GeoJSON Generator
Combines:
  (a) GSI-derived static susceptibility class (fixed/slow-changing layer from data/raw/gsi_nlsm_meppadi.json)
  (b) Live short-duration rainfall trigger & soil moisture (from fetch_rainfall.py)
Generates:
  outputs/landslide_current.json
  outputs/landslide_zones.geojson
"""
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("LandslideRiskCalc")

MODULE_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = MODULE_DIR / "config" / "config.json"
RAW_DATA_DIR = MODULE_DIR / "data" / "raw"
OUTPUTS_DIR = MODULE_DIR / "outputs"

def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def load_gsi_baseline():
    gsi_path = RAW_DATA_DIR / "gsi_nlsm_meppadi.json"
    if not gsi_path.exists():
        raise FileNotFoundError(f"Missing GSI NLSM baseline data at {gsi_path}")
    with open(gsi_path, "r", encoding="utf-8") as f:
        return json.load(f)

def calculate_landslide_risk(rainfall_data: dict, config: dict = None) -> dict:
    """
    Computes Landslide Prototype Risk Score (0-100) per sector and overall for Meppadi.
    Labels clearly as Prototype Risk Score (not official agency probability).
    """
    if config is None:
        config = load_config()

    gsi_data = load_gsi_baseline()
    weights = config.get("risk_weights", {
        "gsi_static_susceptibility": 0.40,
        "short_duration_rainfall": 0.40,
        "soil_pore_saturation": 0.20
    })

    download_time = datetime.now(timezone.utc).isoformat()
    status = rainfall_data.get("status", "UNAVAILABLE")

    # If rainfall trigger is completely unavailable, state that gracefully
    r24 = rainfall_data.get("rainfall_24h_mm")
    soil_sat = rainfall_data.get("soil_saturation_pct")

    # Normalized rain score (0-100) relative to catastrophic threshold 280mm
    if r24 is not None:
        rain_score = min(100.0, max(0.0, (r24 / 280.0) * 100))
    else:
        rain_score = None

    if soil_sat is not None:
        soil_score = min(100.0, max(0.0, soil_sat))
    else:
        soil_score = None

    sectors = gsi_data.get("nlsm_macro_susceptibility_zones", [])
    sector_results = []
    features = []

    total_weighted_scores = []

    for s in sectors:
        gsi_score = s.get("susceptibility_index", 75.0)

        if rain_score is not None and soil_score is not None:
            proto_score = (
                (gsi_score * weights["gsi_static_susceptibility"]) +
                (rain_score * weights["short_duration_rainfall"]) +
                (soil_score * weights["soil_pore_saturation"])
            )
            proto_score = round(proto_score, 1)
            level = "CRITICAL" if proto_score >= 80 else "HIGH" if proto_score >= 60 else "MEDIUM" if proto_score >= 40 else "LOW"
        else:
            proto_score = None
            level = "DATA UNAVAILABLE"

        if proto_score is not None:
            total_weighted_scores.append(proto_score)

        sec_entry = {
            "sector_id": s["sector_id"],
            "sector_name": s["sector_name"],
            "gsi_nlsm_class": s["susceptibility_class"],
            "gsi_susceptibility_score": gsi_score,
            "mean_slope_degrees": s["mean_slope_degrees"],
            "prototype_risk_score": proto_score,
            "risk_level": level,
            "rainfall_trigger_score": round(rain_score, 1) if rain_score is not None else None,
            "soil_saturation_pct": soil_sat
        }
        sector_results.append(sec_entry)

        # Build GeoJSON Polygon Feature around critical sector coordinate
        # Coordinates match config critical sectors
        matching_cfg = next((c for c in config["study_area"]["critical_sectors"] if c["id"] == s["sector_id"]), None)
        if matching_cfg:
            clat, clon = matching_cfg["coordinates"]
            # Small bounding polygon ~0.01 degree for sector polygon representation
            poly_coords = [[
                [round(clon - 0.008, 4), round(clat - 0.006, 4)],
                [round(clon + 0.008, 4), round(clat - 0.006, 4)],
                [round(clon + 0.008, 4), round(clat + 0.006, 4)],
                [round(clon - 0.008, 4), round(clat + 0.006, 4)],
                [round(clon - 0.008, 4), round(clat - 0.006, 4)]
            ]]
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": poly_coords
                },
                "properties": {
                    "sector_id": s["sector_id"],
                    "name": s["sector_name"],
                    "hazard": "landslide",
                    "study_location": "Meppadi, Wayanad",
                    "prototype_risk_score": proto_score,
                    "risk_level": level,
                    "gsi_nlsm_class": s["susceptibility_class"],
                    "slope_deg": s["mean_slope_degrees"],
                    "rainfall_24h_mm": r24,
                    "soil_saturation_pct": soil_sat,
                    "observation_time": rainfall_data.get("observation_time"),
                    "status": status,
                    "disclaimer": "Prototype Risk Score calculated by NIVARA model — Not an official GSI or IMD hazard determination."
                }
            })

    overall_score = round(sum(total_weighted_scores) / len(total_weighted_scores), 1) if total_weighted_scores else None
    overall_level = "CRITICAL" if overall_score and overall_score >= 80 else "HIGH" if overall_score and overall_score >= 60 else "MEDIUM" if overall_score and overall_score >= 40 else "LOW" if overall_score else "DATA UNAVAILABLE"

    dashboard_snapshot = {
        "hazard": "landslide",
        "module_name": "Meppadi Landslide Vulnerability & Early Warning",
        "study_area": {
            "location_name": "Meppadi, Wayanad, Kerala",
            "coordinates": [config["study_area"]["coordinates"]["latitude"], config["study_area"]["coordinates"]["longitude"]],
            "aoi_bounding_box": config["study_area"]["aoi_bounding_box"]
        },
        "status": status,
        "observation_time": rainfall_data.get("observation_time"),
        "download_time": download_time,
        "provenance": {
            "static_susceptibility_source": gsi_data.get("source"),
            "static_data_scale": gsi_data.get("survey_scale"),
            "trigger_source": rainfall_data.get("source"),
            "access_method": "GSI Bhukosh OCBIS Ingestion (Static) + Open-Meteo REST (Live Validation)"
        },
        "observed_data": {
            "rainfall_1h_mm": rainfall_data.get("rainfall_1h_mm"),
            "rainfall_3h_mm": rainfall_data.get("rainfall_3h_mm"),
            "rainfall_24h_mm": r24,
            "soil_saturation_pct": soil_sat,
            "critical_cloudburst_threshold_mm": config["thresholds"]["rainfall_24h_mm"]["catastrophic"]
        },
        "prototype_risk_score": {
            "score": overall_score,
            "classification": overall_level,
            "label": "Landslide Prototype Risk Score",
            "weights_used": weights,
            "disclaimer": "Prototype Risk Score calculated by NIVARA model — explicitly NOT an official GSI or IMD warning.",
            "sectors": sector_results
        }
    }

    geojson_collection = {
        "type": "FeatureCollection",
        "features": features
    }

    # Write outputs
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUTS_DIR / "landslide_current.json", "w", encoding="utf-8") as f:
        json.dump(dashboard_snapshot, f, indent=2)

    with open(OUTPUTS_DIR / "landslide_zones.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson_collection, f, indent=2)

    logger.info(f"Successfully generated Landslide snapshot and GeoJSON (Overall Score: {overall_score}, Status: {status})")
    return dashboard_snapshot, geojson_collection

if __name__ == "__main__":
    from fetch_rainfall import fetch_live_rainfall
    r_data = fetch_live_rainfall()
    snap, geo = calculate_landslide_risk(r_data)
    print(f"Overall Landslide Prototype Risk Score: {snap['prototype_risk_score']['score']}")
