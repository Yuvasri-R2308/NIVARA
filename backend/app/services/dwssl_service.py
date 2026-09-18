"""
NIVARA 2.0 — Dynamic Wetness & Slope-Stability Layer (DWSSL) Service
Computes multi-day Antecedent Precipitation Index (API), soil wetness state,
estimated pore-pressure proxy ratio, and Dynamic Hazard Risk Index (Dynamic HRI).
"""

import os
import csv
import math
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger("NIVARA.DWSSL")

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DATASETS_DIR = BASE_DIR / "datasets"

class DWSSLService:
    """
    Core computational service for Dynamic Wetness & Slope-Stability Layer.
    """

    def __init__(self):
        self.default_k = 0.85
        self.smap_data: Dict[str, Dict[str, Any]] = {}
        self.soil_depth_data: Dict[str, Dict[str, Any]] = {}
        self.baseline_locations: List[Dict[str, Any]] = []
        self._load_prototype_datasets()
        self._initialize_baseline_locations()

    def _load_prototype_datasets(self):
        """Loads SMAP and Soil Depth prototype datasets with safe fallbacks."""
        # 1. SMAP Soil Moisture
        smap_paths = [
            BACKEND_DATA_DIR / "SMAP_Soil_Moisture.csv",
            DATASETS_DIR / "raw" / "SMAP_Soil_Moisture.csv",
            DATASETS_DIR / "SMAP_Soil_Moisture.csv"
        ]
        for p in smap_paths:
            if p.exists():
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        reader = csv.DictReader(f)
                        for row in reader:
                            loc_key = row.get("location", "").strip().lower()
                            if loc_key:
                                self.smap_data[loc_key] = {
                                    "record_id": row.get("record_id", ""),
                                    "location": row.get("location", ""),
                                    "latitude": float(row.get("latitude", 0.0) or 0.0),
                                    "longitude": float(row.get("longitude", 0.0) or 0.0),
                                    "soil_moisture_m3_m3": float(row.get("soil_moisture_m3_m3", 0.35) or 0.35),
                                    "observation_date": row.get("observation_date", "PROTOTYPE"),
                                    "spatial_resolution_km": float(row.get("spatial_resolution_km", 9) or 9),
                                    "data_status": row.get("data_status", "SYNTHETIC_PROTOTYPE"),
                                    "source": row.get("source", "NASA SMAP (Prototype Validation Dataset)")
                                }
                    logger.info("[DWSSL] Loaded %d SMAP prototype records from %s", len(self.smap_data), p)
                    break
                except Exception as e:
                    logger.warning("[DWSSL] Error parsing SMAP CSV %s: %s", p, e)

        # 2. Soil Depth / Regolith Thickness
        soil_paths = [
            BACKEND_DATA_DIR / "Soil_Depth_Regolith_Thickness.csv",
            DATASETS_DIR / "raw" / "Soil_Depth_Regolith_Thickness.csv",
            DATASETS_DIR / "Soil_Depth_Regolith_Thickness.csv"
        ]
        for p in soil_paths:
            if p.exists():
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        reader = csv.DictReader(f)
                        for row in reader:
                            loc_key = row.get("location", "").strip().lower()
                            if loc_key:
                                self.soil_depth_data[loc_key] = {
                                    "record_id": row.get("record_id", ""),
                                    "location": row.get("location", ""),
                                    "latitude": float(row.get("latitude", 0.0) or 0.0),
                                    "longitude": float(row.get("longitude", 0.0) or 0.0),
                                    "soil_depth_m": float(row.get("soil_depth_m", 1.0) or 1.0),
                                    "soil_depth_type": row.get("soil_depth_type", "REGIONAL_PROTOTYPE"),
                                    "data_status": row.get("data_status", "SYNTHETIC_PROTOTYPE"),
                                    "source": row.get("source", "GSI / Soil Survey (Prototype Dataset)")
                                }
                    logger.info("[DWSSL] Loaded %d Soil Depth prototype records from %s", len(self.soil_depth_data), p)
                    break
                except Exception as e:
                    logger.warning("[DWSSL] Error parsing Soil Depth CSV %s: %s", p, e)

    def _initialize_baseline_locations(self):
        """Initializes representative Wayanad micro-catchment / village monitoring locations."""
        self.baseline_locations = [
            {
                "id": "DWSSL-LOC-001",
                "location": "Meppadi",
                "sub_division": "Vythiri Taluk / Vellarimala Catchment",
                "latitude": 11.5540,
                "longitude": 76.1320,
                "elevation_m": 890.0,
                "slope_deg": 38.5,
                "static_hri": 52.0,
                "base_24h_rain": 38.0,
                "base_48h_rain": 76.0,
                "base_72h_rain": 112.0
            },
            {
                "id": "DWSSL-LOC-002",
                "location": "Chooralmala",
                "sub_division": "Meppadi North / Debris Runout Zone",
                "latitude": 11.5420,
                "longitude": 76.1480,
                "elevation_m": 820.0,
                "slope_deg": 41.2,
                "static_hri": 76.5,
                "base_24h_rain": 156.0,
                "base_48h_rain": 338.0,
                "base_72h_rain": 458.0
            },
            {
                "id": "DWSSL-LOC-003",
                "location": "Mundakkai",
                "sub_division": "Upper Iruvaipuzha Headwaters",
                "latitude": 11.5360,
                "longitude": 76.1590,
                "elevation_m": 1050.0,
                "slope_deg": 44.0,
                "static_hri": 81.0,
                "base_24h_rain": 168.0,
                "base_48h_rain": 365.0,
                "base_72h_rain": 482.0
            },
            {
                "id": "DWSSL-LOC-004",
                "location": "Vythiri",
                "sub_division": "Lakkidi Western Ghats Ridge",
                "latitude": 11.5510,
                "longitude": 76.0200,
                "elevation_m": 940.0,
                "slope_deg": 34.0,
                "static_hri": 64.0,
                "base_24h_rain": 128.0,
                "base_48h_rain": 274.0,
                "base_72h_rain": 380.0
            },
            {
                "id": "DWSSL-LOC-005",
                "location": "Pozhuthana",
                "sub_division": "Banasura Sagar Basin",
                "latitude": 11.5480,
                "longitude": 76.0490,
                "elevation_m": 780.0,
                "slope_deg": 36.8,
                "static_hri": 66.5,
                "base_24h_rain": 134.0,
                "base_48h_rain": 288.0,
                "base_72h_rain": 395.0
            },
            {
                "id": "DWSSL-LOC-006",
                "location": "Kalpetta",
                "sub_division": "District Headquarters Central Zone",
                "latitude": 11.6085,
                "longitude": 76.0837,
                "elevation_m": 750.0,
                "slope_deg": 22.4,
                "static_hri": 48.0,
                "base_24h_rain": 84.0,
                "base_48h_rain": 172.0,
                "base_72h_rain": 235.0
            },
            {
                "id": "DWSSL-LOC-007",
                "location": "Padinjarathara",
                "sub_division": "Kabaniriver Upper Reach",
                "latitude": 11.6720,
                "longitude": 75.9850,
                "elevation_m": 760.0,
                "slope_deg": 28.0,
                "static_hri": 52.0,
                "base_24h_rain": 98.0,
                "base_48h_rain": 195.0,
                "base_72h_rain": 268.0
            },
            {
                "id": "DWSSL-LOC-008",
                "location": "Sulthan Bathery",
                "sub_division": "Eastern Plateau Border Sector",
                "latitude": 11.6643,
                "longitude": 76.2570,
                "elevation_m": 930.0,
                "slope_deg": 16.5,
                "static_hri": 38.0,
                "base_24h_rain": 52.0,
                "base_48h_rain": 110.0,
                "base_72h_rain": 154.0
            },
            {
                "id": "DWSSL-LOC-009",
                "location": "Mananthavady",
                "sub_division": "North Wayanad Agro-Catchment",
                "latitude": 11.8000,
                "longitude": 76.0000,
                "elevation_m": 760.0,
                "slope_deg": 19.8,
                "static_hri": 42.0,
                "base_24h_rain": 68.0,
                "base_48h_rain": 138.0,
                "base_72h_rain": 188.0
            },
            {
                "id": "DWSSL-LOC-010",
                "location": "Thirunelly",
                "sub_division": "Brahmagiri Wildlife Slope Flank",
                "latitude": 11.9020,
                "longitude": 75.9890,
                "elevation_m": 880.0,
                "slope_deg": 31.5,
                "static_hri": 58.0,
                "base_24h_rain": 92.0,
                "base_48h_rain": 186.0,
                "base_72h_rain": 252.0
            },
            {
                "id": "DWSSL-LOC-011",
                "location": "Ambalavayal",
                "sub_division": "Edakkal Caves Hill Sector",
                "latitude": 11.6030,
                "longitude": 76.2080,
                "elevation_m": 840.0,
                "slope_deg": 24.0,
                "static_hri": 46.0,
                "base_24h_rain": 62.0,
                "base_48h_rain": 128.0,
                "base_72h_rain": 175.0
            },
            {
                "id": "DWSSL-LOC-012",
                "location": "Kottathara",
                "sub_division": "Kavumannam Lowland Fluvial Plain",
                "latitude": 11.6660,
                "longitude": 75.9510,
                "elevation_m": 720.0,
                "slope_deg": 21.0,
                "static_hri": 44.0,
                "base_24h_rain": 76.0,
                "base_48h_rain": 154.0,
                "base_72h_rain": 212.0
            }
        ]

    def compute_api(
        self,
        daily_rainfall_series: List[float],
        k: float = 0.85
    ) -> float:
        """
        Computes Antecedent Precipitation Index:
        API_t = P_t + k * API_(t-1)
        ordered chronologically: [P_(t-N), ..., P_(t-1), P_t]
        """
        if not daily_rainfall_series:
            return 0.0

        api = 0.0
        n = len(daily_rainfall_series)
        for idx, p in enumerate(daily_rainfall_series):
            lag = (n - 1) - idx  # 0 for today (t), 1 for t-1, etc.
            api += float(p) * (k ** lag)

        return round(api, 2)

    def estimate_pore_pressure_ratio(
        self,
        slope_deg: float,
        soil_depth_m: float,
        wetness_index: float,
        soil_moisture: float
    ) -> float:
        """
        Computes an estimated pore-pressure proxy ratio (r_u in range 0.0 - 1.0).
        Inputs: slope angle (deg), regolith depth (m), wetness index (0-1), soil moisture (m3/m3).
        Interpretation: 0 = minimal wetness pressure effect, 1 = maximum saturated pore pressure surge.
        """
        safe_depth = max(0.2, min(5.0, soil_depth_m or 1.0))
        safe_slope = max(5.0, min(65.0, slope_deg or 20.0))
        slope_rad = math.radians(safe_slope)

        # Regolith saturation proxy: thinner soil on steep slopes saturates rapidly
        depth_factor = min(1.0, 1.2 / safe_depth)
        slope_factor = math.sin(slope_rad)
        sm_normalized = min(1.0, max(0.0, (soil_moisture or 0.35) / 0.50))

        # Weighted combination
        ru_raw = (
            0.45 * wetness_index +
            0.30 * sm_normalized +
            0.25 * (depth_factor * slope_factor)
        )

        return round(min(1.0, max(0.0, ru_raw)), 3)

    def calculate_location_dwssl(
        self,
        location_raw: Dict[str, Any],
        simulated_rain_multiplier: float = 1.0,
        decay_k: float = 0.85
    ) -> Dict[str, Any]:
        """
        Calculates all DWSSL dynamic parameters for a single location.
        """
        loc_name = location_raw.get("location", "Unknown")
        loc_key = loc_name.strip().lower()

        # 1. Base Rainfall scaled by multiplier
        mult = max(0.0, simulated_rain_multiplier)
        rain_24h = round(location_raw.get("base_24h_rain", 100.0) * mult, 1)
        rain_48h = round(location_raw.get("base_48h_rain", 220.0) * mult, 1)
        rain_72h = round(location_raw.get("base_72h_rain", 320.0) * mult, 1)

        # Reconstruct 5-day daily series from accumulation
        p_day_t = rain_24h
        p_day_t_minus_1 = max(0.0, rain_48h - rain_24h)
        p_day_t_minus_2 = max(0.0, rain_72h - rain_48h)
        p_day_t_minus_3 = round(p_day_t_minus_2 * 0.75, 1)
        p_day_t_minus_4 = round(p_day_t_minus_3 * 0.60, 1)
        daily_series = [p_day_t_minus_4, p_day_t_minus_3, p_day_t_minus_2, p_day_t_minus_1, p_day_t]

        # 2. Antecedent Precipitation Index
        k_val = max(0.70, min(0.95, decay_k or self.default_k))
        api_val = self.compute_api(daily_series, k=k_val)

        # 3. Normalized API & Wetness Index
        # Benchmark: 350mm cumulative index = 100% saturation capacity
        normalized_api = round(min(100.0, (api_val / 350.0) * 100.0), 1)
        wetness_index = round(normalized_api / 100.0, 3)

        # Wetness State
        if wetness_index >= 0.78 or rain_48h >= 300.0:
            wetness_state = "VERY HIGH"
        elif wetness_index >= 0.55 or rain_48h >= 200.0:
            wetness_state = "HIGH"
        elif wetness_index >= 0.30 or rain_24h >= 60.0:
            wetness_state = "MODERATE"
        else:
            wetness_state = "LOW"

        # 4. Attach Prototype Datasets
        smap_rec = self.smap_data.get(loc_key, {})
        soil_rec = self.soil_depth_data.get(loc_key, {})

        soil_moisture = smap_rec.get("soil_moisture_m3_m3", 0.35)
        # Apply rainfall influence to moisture if wet
        if mult > 1.0:
            soil_moisture = round(min(0.52, soil_moisture * (1.0 + (mult - 1.0) * 0.2)), 3)

        soil_depth_m = soil_rec.get("soil_depth_m", 1.0)
        slope_deg = location_raw.get("slope_deg", 25.0)

        # 5. Estimated Pore-Pressure Ratio Proxy
        pore_pressure_ratio = self.estimate_pore_pressure_ratio(
            slope_deg=slope_deg,
            soil_depth_m=soil_depth_m,
            wetness_index=wetness_index,
            soil_moisture=soil_moisture
        )

        # 6. Dynamic HRI Formula
        # HRI_dynamic = HRI_static + 0.25 * Normalized_API + 0.15 * (Pore_Pressure_Ratio * 100)
        static_hri = float(location_raw.get("static_hri", 50.0))
        api_contribution = round(0.25 * normalized_api, 1)
        pore_pressure_contribution = round(0.15 * (pore_pressure_ratio * 100.0), 1)

        raw_dynamic_hri = static_hri + api_contribution + pore_pressure_contribution
        dynamic_hri = round(min(100.0, max(0.0, raw_dynamic_hri)), 1)
        dynamic_change = round(dynamic_hri - static_hri, 1)

        # 7. Rolling Rainfall Trigger
        if rain_72h >= 400.0 or rain_48h >= 300.0 or rain_24h >= 180.0 or dynamic_hri >= 80.0:
            rainfall_trigger = "CRITICAL"
        elif rain_72h >= 250.0 or rain_48h >= 180.0 or rain_24h >= 100.0 or dynamic_hri >= 65.0:
            rainfall_trigger = "WARNING"
        elif rain_72h >= 150.0 or rain_48h >= 100.0 or rain_24h >= 50.0 or dynamic_hri >= 50.0:
            rainfall_trigger = "WATCH"
        else:
            rainfall_trigger = "NORMAL"

        # 8. Final DWSSL System Status
        # Combines Dynamic HRI tier with Rainfall Trigger
        if dynamic_hri >= 78.0 or rainfall_trigger == "CRITICAL":
            dwssl_status = "CRITICAL"
        elif dynamic_hri >= 64.0 or rainfall_trigger == "WARNING":
            dwssl_status = "WARNING"
        elif dynamic_hri >= 50.0 or rainfall_trigger == "WATCH":
            dwssl_status = "WATCH"
        else:
            dwssl_status = "NORMAL"

        # 9. Decision Support Recommendation
        recommendations = {
            "NORMAL": "Continue routine hydrological and slope monitoring. No immediate slope destabilization detected.",
            "WATCH": "Increase monitoring frequency. Alert local field teams in high-slope sectors to inspect drainage culverts and tension cracks.",
            "WARNING": "Prioritize field verification in saturated regolith zones. Pre-position emergency quick-response equipment in vulnerable catchments.",
            "CRITICAL": "Extreme saturated slope instability detected. Initiate urgent field verification and coordinate with district emergency operations center (DEOC) protocols."
        }
        rec_text = recommendations.get(dwssl_status, recommendations["NORMAL"])

        # Construct complete structured record
        return {
            "id": location_raw.get("id", f"DWSSL-{loc_name}"),
            "location": loc_name,
            "sub_division": location_raw.get("sub_division", "Wayanad Sector"),
            "latitude": location_raw.get("latitude", 11.60),
            "longitude": location_raw.get("longitude", 76.10),
            "elevation_m": location_raw.get("elevation_m", 750.0),
            "slope_deg": slope_deg,

            # Risk Scores
            "static_hri": static_hri,
            "dynamic_hri": dynamic_hri,
            "dynamic_change": dynamic_change,
            "api_contribution": api_contribution,
            "pore_pressure_contribution": pore_pressure_contribution,

            # Rainfall Accumulation
            "rainfall_24h": rain_24h,
            "rainfall_48h": rain_48h,
            "rainfall_72h": rain_72h,

            # Wetness Index & API
            "api": api_val,
            "normalized_api": normalized_api,
            "wetness_index": wetness_index,
            "wetness_state": wetness_state,
            "decay_factor_k": k_val,

            # Prototype Datasets
            "soil_moisture": soil_moisture,
            "soil_depth_m": soil_depth_m,
            "pore_pressure_ratio": pore_pressure_ratio,

            # Classifications
            "rainfall_trigger": rainfall_trigger,
            "dwssl_status": dwssl_status,
            "decision_support": rec_text,

            # Data Provenance & Safety
            "data_status": "OPERATIONAL_COMBINED",
            "is_simulation": simulated_rain_multiplier != 1.0,
            "simulation_multiplier": simulated_rain_multiplier,
            "datasets_attached": {
                "smap": {
                    "record_id": smap_rec.get("record_id", "PROTOTYPE-SMAP"),
                    "status": "PROTOTYPE_VALIDATION_DATA",
                    "note": "Prototype validation data — replace with official SMAP satellite observations."
                },
                "soil_depth": {
                    "record_id": soil_rec.get("record_id", "PROTOTYPE-DEPTH"),
                    "status": "PROTOTYPE_VALIDATION_DATA",
                    "note": "Prototype regolith thickness data — replace with official GSI/survey data."
                },
                "rainfall": {
                    "source": "IMD Wayanad & Regional Station Observations",
                    "status": "CALCULATED_DATA"
                }
            },
            "calculated_at": datetime.now(timezone.utc).isoformat()
        }

    def get_dwssl_summary(
        self,
        simulated_rain_multiplier: float = 1.0,
        decay_k: float = 0.85
    ) -> Dict[str, Any]:
        """
        Returns district-wide DWSSL summary metrics and key indicators.
        """
        locations_data = [
            self.calculate_location_dwssl(loc, simulated_rain_multiplier, decay_k)
            for loc in self.baseline_locations
        ]

        if not locations_data:
            return {"status": "NO_DATA", "message": "No locations available"}

        # District Aggregates
        avg_static_hri = round(sum(d["static_hri"] for d in locations_data) / len(locations_data), 1)
        avg_dynamic_hri = round(sum(d["dynamic_hri"] for d in locations_data) / len(locations_data), 1)
        avg_dynamic_change = round(avg_dynamic_hri - avg_static_hri, 1)

        max_loc = max(locations_data, key=lambda d: d["dynamic_hri"])
        max_48h_rain = max(d["rainfall_48h"] for d in locations_data)
        max_72h_rain = max(d["rainfall_72h"] for d in locations_data)

        # Status counts
        status_counts = {"CRITICAL": 0, "WARNING": 0, "WATCH": 0, "NORMAL": 0}
        for d in locations_data:
            st = d["dwssl_status"]
            status_counts[st] = status_counts.get(st, 0) + 1

        # Determine overall system status
        if status_counts["CRITICAL"] > 0:
            overall_status = "CRITICAL"
        elif status_counts["WARNING"] > 0:
            overall_status = "WARNING"
        elif status_counts["WATCH"] > 0:
            overall_status = "WATCH"
        else:
            overall_status = "NORMAL"

        return {
            "system_status": overall_status,
            "calculation_status": "SYNCHRONIZED",
            "last_updated": datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p UTC"),
            "data_availability": {
                "rainfall": True,
                "dem_slope": True,
                "soil_depth_prototype": True,
                "soil_moisture_prototype": True
            },
            "kpis": {
                "avg_static_hri": avg_static_hri,
                "avg_dynamic_hri": avg_dynamic_hri,
                "avg_risk_change": avg_dynamic_change,
                "max_dynamic_hri": max_loc["dynamic_hri"],
                "max_risk_location": max_loc["location"],
                "max_48h_rainfall_mm": max_48h_rain,
                "max_72h_rainfall_mm": max_72h_rain,
                "wetness_state": max_loc["wetness_state"],
                "monitored_sectors_count": len(locations_data)
            },
            "status_distribution": status_counts,
            "decay_factor_k": decay_k or self.default_k,
            "simulation_multiplier": simulated_rain_multiplier,
            "is_simulation": simulated_rain_multiplier != 1.0,
            "locations": locations_data
        }

    def get_location_by_id_or_name(
        self,
        loc_id_or_name: str,
        simulated_rain_multiplier: float = 1.0,
        decay_k: float = 0.85
    ) -> Optional[Dict[str, Any]]:
        """Finds and evaluates a specific location."""
        search = loc_id_or_name.strip().lower()
        target = next(
            (l for l in self.baseline_locations if l["id"].lower() == search or l["location"].lower() == search),
            None
        )
        if not target:
            # Generate on the fly for any custom coordinate
            target = {
                "id": f"DWSSL-CUSTOM-{loc_id_or_name}",
                "location": loc_id_or_name,
                "sub_division": "Custom Wayanad Sector",
                "latitude": 11.60,
                "longitude": 76.10,
                "elevation_m": 800.0,
                "slope_deg": 30.0,
                "static_hri": 55.0,
                "base_24h_rain": 100.0,
                "base_48h_rain": 220.0,
                "base_72h_rain": 310.0
            }
        return self.calculate_location_dwssl(target, simulated_rain_multiplier, decay_k)

    def get_timeline(
        self,
        location_name: str = "Meppadi",
        decay_k: float = 0.85,
        simulated_rain_multiplier: float = 1.0
    ) -> Dict[str, Any]:
        """
        Generates hourly timeline showing rainfall accumulation, API rise and gradual decay.
        """
        loc = self.get_location_by_id_or_name(location_name, simulated_rain_multiplier, decay_k)
        if not loc:
            loc = self.get_location_by_id_or_name("Meppadi", simulated_rain_multiplier, decay_k)

        k = decay_k or self.default_k
        static_hri = loc["static_hri"]
        rain_24h = loc["rainfall_24h"]
        rain_48h = loc["rainfall_48h"]
        rain_72h = loc["rainfall_72h"]

        # Synthetic 72-hour progression (hour -72 to hour 0, then projection hour +1 to +24)
        timeline_points = []
        current_api = 0.0

        for h in range(-72, 25, 4):
            if h <= -48:
                step_rain = (rain_72h - rain_48h) / 6.0
            elif h <= -24:
                step_rain = (rain_48h - rain_24h) / 6.0
            elif h <= 0:
                step_rain = rain_24h / 6.0
            else:
                # Rainfall stopped -> gradual exponential API decay!
                step_rain = 0.0

            # Hourly step API update
            hourly_decay = k ** (4.0 / 24.0)
            current_api = step_rain + (current_api * hourly_decay)

            norm_api = min(100.0, round((current_api / 350.0) * 100.0, 1))
            pp_ratio = min(1.0, round(norm_api / 100.0 * 0.85, 3))
            step_dynamic_hri = min(100.0, round(static_hri + (0.25 * norm_api) + (0.15 * pp_ratio * 100.0), 1))

            time_label = f"T{h:+d}h" if h != 0 else "Now (T0)"
            timeline_points.append({
                "hour_offset": h,
                "time_label": time_label,
                "rainfall_step_mm": round(step_rain, 1),
                "api": round(current_api, 1),
                "normalized_api": norm_api,
                "dynamic_hri": step_dynamic_hri,
                "static_hri": static_hri,
                "pore_pressure_ratio": pp_ratio,
                "is_projection": h > 0
            })

        return {
            "location": loc["location"],
            "static_hri": static_hri,
            "current_dynamic_hri": loc["dynamic_hri"],
            "decay_factor_k": k,
            "timeline": timeline_points
        }

# Global Singleton Instance
dwssl_service = DWSSLService()
