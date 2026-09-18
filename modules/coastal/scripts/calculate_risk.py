"""
Coastal Erosion Module: Prototype Risk Calculation & Transects GeoJSON Generator
Location: Podampeta, Ganjam District, Odisha
Combines:
  (a) Near-Real-Time Significant Wave Height & Wave Period (Wave Energy Flux) [45%]
  (b) Live Storm Surge & Tidal Stage [20%]
  (c) Multi-decadal Satellite Shoreline Retreat Rate (NCCR / CoastSat DSAS) [35%]
  (d) Rainfall: 0.0% (STRICTLY ZERO — Coastal erosion is ocean-driven, never rainfall-driven)
Generates:
  outputs/coastal_current.json
  outputs/coastal_transects.geojson
"""
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CoastalRiskCalc")

MODULE_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = MODULE_DIR / "config" / "config.json"
RAW_DATA_DIR = MODULE_DIR / "data" / "raw"
OUTPUTS_DIR = MODULE_DIR / "outputs"

def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def load_satellite_baseline():
    baseline_path = RAW_DATA_DIR / "satellite_shoreline_podampeta.json"
    with open(baseline_path, "r", encoding="utf-8") as f:
        return json.load(f)

def calculate_coastal_risk(wave_data: dict, config: dict = None) -> tuple:
    """
    Computes Coastal Erosion Prototype Risk Score (0-100) and sector transects footprint.
    Synthesizes live metocean energy with multi-decadal satellite shoreline retreat.
    STRICT CONSTRAINT: Zero rainfall dependency.
    """
    if config is None:
        config = load_config()

    baseline = load_satellite_baseline()
    weights = config.get("risk_weights", {
        "wave_energy_height": 0.45,
        "surge_and_tidal_stage": 0.20,
        "satellite_shoreline_retreat_rate": 0.35,
        "rainfall": 0.0
    })

    download_time = datetime.now(timezone.utc).isoformat()
    status = wave_data.get("status", "UNAVAILABLE")
    metocean = wave_data.get("metocean_data", {})

    hs = metocean.get("significant_wave_height_m")
    tp = metocean.get("peak_wave_period_s")
    surge = metocean.get("estimated_surge_m")
    mean_retreat = abs(baseline["regional_erosion_statistics"]["mean_annual_retreat_m_yr"])

    if hs is not None and tp is not None:
        # Wave Energy Flux Score (Proportional to Hs^2 * Tp)
        # Hs <= 1.25m -> 15-35 pts (Normal swell)
        # Hs 1.25 - 2.5m -> 35-65 pts (Moderate/rough sea)
        # Hs 2.5 - 4.0m -> 65-85 pts (Rough storm sea)
        # Hs > 4.0m -> 85-100 pts (Severe cyclonic sea state)
        if hs <= 1.25:
            wave_score = max(10.0, 15.0 + (hs / 1.25) * 20.0)
        elif hs <= 2.5:
            wave_score = 35.0 + ((hs - 1.25) / 1.25) * 30.0
        elif hs <= 4.0:
            wave_score = 65.0 + ((hs - 2.5) / 1.5) * 20.0
        else:
            wave_score = min(100.0, 85.0 + ((hs - 4.0) / 2.0) * 15.0)

        # Long swell period multiplier: Tp > 10s increases run-up and scouring
        if tp > 10.0:
            wave_score = min(100.0, wave_score * 1.08)

        # Surge Score
        surge_val = surge or 0.1
        if surge_val <= 0.2:
            surge_score = 15.0 + (surge_val / 0.2) * 20.0
        elif surge_val <= 0.6:
            surge_score = 35.0 + ((surge_val - 0.2) / 0.4) * 35.0
        else:
            surge_score = min(100.0, 70.0 + ((surge_val - 0.6) / 0.6) * 30.0)

        # Shoreline Retreat Score (Baseline annual retreat rate: 2.25 m/yr)
        if mean_retreat <= 1.0:
            retreat_score = 30.0 + (mean_retreat / 1.0) * 20.0
        elif mean_retreat <= 2.0:
            retreat_score = 50.0 + ((mean_retreat - 1.0) / 1.0) * 25.0
        else:
            retreat_score = min(100.0, 75.0 + ((mean_retreat - 2.0) / 1.5) * 25.0)

        proto_score = round(
            (wave_score * weights["wave_energy_height"]) +
            (surge_score * weights["surge_and_tidal_stage"]) +
            (retreat_score * weights["satellite_shoreline_retreat_rate"]),
            1
        )
        level = "CRITICAL" if proto_score >= 80 else "HIGH" if proto_score >= 65 else "MODERATE" if proto_score >= 45 else "LOW"
    else:
        proto_score = None
        level = "DATA UNAVAILABLE"

    # Transects spatial features
    transects_data = baseline["transects"]
    transect_results = []
    features = []

    for t in transects_data:
        clat, clon = t["coordinates"]
        local_retreat = abs(t["baseline_retreat_rate_m_yr"])

        # Localized score adjustment based on transect-specific retreat rate & seawall armor
        if proto_score is not None:
            if "Armored" in t["geomorphic_type"] or "Inland" in t["geomorphic_type"]:
                t_score = round(max(15.0, proto_score - 18.0), 1)
            elif "Dune" in t["geomorphic_type"] or "Spit" in t["geomorphic_type"]:
                t_score = round(min(100.0, proto_score + (local_retreat - 2.0) * 8.0), 1)
            else:
                t_score = proto_score
            t_level = "CRITICAL" if t_score >= 80 else "HIGH" if t_score >= 65 else "MODERATE" if t_score >= 45 else "LOW"
        else:
            t_score = None
            t_level = "DATA UNAVAILABLE"

        transect_results.append({
            "transect_id": t["transect_id"],
            "name": t["name"],
            "geomorphic_type": t["geomorphic_type"],
            "baseline_retreat_rate_m_yr": t["baseline_retreat_rate_m_yr"],
            "cumulative_loss_m": t["cumulative_loss_m"],
            "settlement_status": t["settlement_status"],
            "prototype_risk_score": t_score,
            "status": t_level,
            "coordinates": [clat, clon]
        })

        # GeoJSON Polygon / Transect Footprint
        poly_coords = [[
            [round(clon - 0.008, 4), round(clat - 0.005, 4)],
            [round(clon + 0.008, 4), round(clat - 0.005, 4)],
            [round(clon + 0.008, 4), round(clat + 0.005, 4)],
            [round(clon - 0.008, 4), round(clat + 0.005, 4)],
            [round(clon - 0.008, 4), round(clat - 0.005, 4)]
        ]]

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": poly_coords
            },
            "properties": {
                "transect_id": t["transect_id"],
                "name": t["name"],
                "hazard": "coastal_erosion",
                "study_location": "Podampeta, Ganjam, Odisha",
                "geomorphic_type": t["geomorphic_type"],
                "baseline_retreat_m_yr": t["baseline_retreat_rate_m_yr"],
                "cumulative_retreat_m": t["cumulative_loss_m"],
                "settlement_status": t["settlement_status"],
                "prototype_risk_score": t_score,
                "risk_level": t_level,
                "significant_wave_height_m": hs,
                "peak_wave_period_s": tp,
                "surge_m": surge,
                "status": status,
                "observation_time": wave_data.get("observation_time"),
                "rainfall_used_mm": 0.0,
                "disclaimer": "Prototype Risk Score calculated by NIVARA model — Not an official INCOIS, NCCR, or OSDMA hazard declaration."
            }
        })

    dashboard_snapshot = {
        "hazard": "coastal_erosion",
        "module_name": "Podampeta Coastal Erosion & Wave Action Monitoring",
        "study_area": {
          "location_name": config["study_area"]["name"],
          "state": config["study_area"]["state"],
          "district": config["study_area"]["district"],
          "coastal_stretch": config["study_area"]["coastal_stretch"],
          "coordinates": [config["study_area"]["coordinates"]["latitude"], config["study_area"]["coordinates"]["longitude"]],
          "aoi_bounding_box": config["study_area"]["aoi_bounding_box"]
        },
        "status": status,
        "observation_time": wave_data.get("observation_time"),
        "download_time": download_time,
        "provenance": {
            "marine_source": wave_data.get("source"),
            "buoy_station": wave_data.get("station"),
            "satellite_baseline_source": baseline.get("source"),
            "baseline_period": baseline.get("baseline_period"),
            "rainfall_dependency": "STRICTLY NONE (0.0% Weight - Marine wave energy & shoreline geomorphology exclusively)"
        },
        "observed_data": {
            "significant_wave_height_m": hs,
            "peak_wave_period_s": tp,
            "wave_direction_deg": metocean.get("wave_direction_deg"),
            "swell_wave_height_m": metocean.get("swell_wave_height_m"),
            "swell_wave_period_s": metocean.get("swell_wave_period_s"),
            "estimated_surge_m": surge,
            "sea_state_description": metocean.get("sea_state_description"),
            "satellite_mean_retreat_rate_m_yr": baseline["regional_erosion_statistics"]["mean_annual_retreat_m_yr"]
        },
        "prototype_risk_score": {
            "score": proto_score,
            "classification": level,
            "label": "Coastal Erosion Prototype Risk Score",
            "weights_used": weights,
            "rainfall_weight": 0.0,
            "disclaimer": "Prototype Risk Score calculated by NIVARA model — explicitly NOT an official INCOIS, NCCR, or OSDMA hazard declaration.",
            "critical_transects": transect_results
        }
    }

    geojson_collection = {
        "type": "FeatureCollection",
        "features": features
    }

    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUTS_DIR / "coastal_current.json", "w", encoding="utf-8") as f:
        json.dump(dashboard_snapshot, f, indent=2)

    with open(OUTPUTS_DIR / "coastal_transects.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson_collection, f, indent=2)

    logger.info(f"Successfully generated Coastal snapshot and GeoJSON (Overall Score: {proto_score}, Status: {status})")
    return dashboard_snapshot, geojson_collection

if __name__ == "__main__":
    from fetch_incois_erddap import fetch_coastal_wave_data
    w_data = fetch_coastal_wave_data()
    snap, geo = calculate_coastal_risk(w_data)
    print(f"Overall Coastal Prototype Risk Score: {snap['prototype_risk_score']['score']}")
