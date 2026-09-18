"""
NIVARA 2.0 — Module 4: Downstream Runout & Cascading Debris Risk Engine
Traces landslide debris flow paths from high-elevation scarps, generates runout corridors,
intersects cadastral parcels, and integrates cascading risk into the Relocation Priority Index (RPI).
"""

from typing import Dict, Any, List, Optional
import json
from pathlib import Path
from ..config.settings import settings

# Defined Empirical Runout Trajectories from Chembra & Vellarimala Mountain Scarps
DEBRIS_RUNOUT_REGISTRY = [
    {
        "runout_id": "RUNOUT-MEPPADI-01",
        "name": "Chembra Scarp to Chooralmala Bridge Corridor",
        "source_village": "Meppadi",
        "source_coordinates": [11.535, 76.135],
        "scarp_elevation_m": 1627.0,
        "scarp_slope_deg": 38.5,
        "source_hri": 84.5,
        "max_debris_velocity_kmh": 48.5,
        "estimated_runout_length_km": 6.8,
        "warning_lead_time_min": 18,
        "downstream_risk_level": "CRITICAL",
        "flow_path_coords": [
            [76.135, 11.535],
            [76.130, 11.545],
            [76.128, 11.554],
            [76.115, 11.565],
            [76.102, 11.575]
        ],
        "corridor_polygon_coords": [
            [76.138, 11.532], [76.133, 11.544], [76.131, 11.556], [76.118, 11.568],
            [76.099, 11.578], [76.096, 11.572], [76.112, 11.562], [76.125, 11.551],
            [76.127, 11.543], [76.132, 11.530], [76.138, 11.532]
        ],
        "affected_parcels_count": 48,
        "affected_population_estimate": 4800
    },
    {
        "runout_id": "RUNOUT-MEPPADI-02",
        "name": "Mundakkai Tributary Debris Channel",
        "source_village": "Meppadi",
        "source_coordinates": [11.542, 76.140],
        "scarp_elevation_m": 1420.0,
        "scarp_slope_deg": 34.0,
        "source_hri": 81.0,
        "max_debris_velocity_kmh": 41.2,
        "estimated_runout_length_km": 4.5,
        "warning_lead_time_min": 24,
        "downstream_risk_level": "HIGH",
        "flow_path_coords": [
            [76.140, 11.542],
            [76.132, 11.550],
            [76.128, 11.554]
        ],
        "corridor_polygon_coords": [
            [76.142, 11.540], [76.135, 11.548], [76.131, 11.556],
            [76.125, 11.552], [76.129, 11.546], [76.138, 11.538], [76.142, 11.540]
        ],
        "affected_parcels_count": 32,
        "affected_population_estimate": 2130
    },
    {
        "runout_id": "RUNOUT-ACHOOR-01",
        "name": "Achoor Foothill Siltation Runout",
        "source_village": "Achooranam",
        "source_coordinates": [11.585, 76.015],
        "scarp_elevation_m": 980.0,
        "scarp_slope_deg": 26.5,
        "source_hri": 48.5,
        "max_debris_velocity_kmh": 22.0,
        "estimated_runout_length_km": 2.8,
        "warning_lead_time_min": 45,
        "downstream_risk_level": "MEDIUM",
        "flow_path_coords": [
            [76.015, 11.585],
            [76.025, 11.595],
            [76.035, 11.605]
        ],
        "corridor_polygon_coords": [
            [76.017, 11.583], [76.028, 11.593], [76.038, 11.603],
            [76.032, 11.607], [76.022, 11.597], [76.012, 11.587], [76.017, 11.583]
        ],
        "affected_parcels_count": 18,
        "affected_population_estimate": 850
    }
]

class RunoutCascadingRiskEngine:
    """
    Evaluates downstream cascading risk from high-gradient landslide source zones,
    intersects cadastral parcels, and integrates into RPI.
    """

    def __init__(self):
        self.runouts = DEBRIS_RUNOUT_REGISTRY

    def get_runout_corridors(self, rainfall_multiplier: float = 1.0) -> List[Dict[str, Any]]:
        """Returns all debris runout corridors with dynamic rain-adjusted lengths and velocities."""
        results = []
        for r in self.runouts:
            adj_velocity = round(r["max_debris_velocity_kmh"] * (1.0 + (rainfall_multiplier - 1.0) * 0.20), 1)
            adj_length = round(r["estimated_runout_length_km"] * (1.0 + (rainfall_multiplier - 1.0) * 0.15), 1)
            adj_lead_time = max(8, round(r["warning_lead_time_min"] / max(0.5, (1.0 + (rainfall_multiplier - 1.0) * 0.25))))

            results.append({
                "runout_id": r["runout_id"],
                "name": r["name"],
                "source_village": r["source_village"],
                "source_coordinates": r["source_coordinates"],
                "scarp_elevation_m": r["scarp_elevation_m"],
                "scarp_slope_deg": r["scarp_slope_deg"],
                "source_hri": r["source_hri"],
                "debris_velocity_kmh": adj_velocity,
                "runout_length_km": adj_length,
                "warning_lead_time_min": adj_lead_time,
                "downstream_risk_level": r["downstream_risk_level"],
                "affected_parcels_count": r["affected_parcels_count"],
                "affected_population_estimate": r["affected_population_estimate"],
                "flow_path_coords": r["flow_path_coords"],
                "corridor_polygon_coords": r["corridor_polygon_coords"]
            })
        return results

    def get_runout_geojson(self, rainfall_multiplier: float = 1.0) -> Dict[str, Any]:
        """Exports runout vectors and polygons as GeoJSON."""
        features = []
        for r in self.get_runout_corridors(rainfall_multiplier):
            # Line vector feature
            features.append({
                "type": "Feature",
                "properties": {
                    "id": r["runout_id"],
                    "name": r["name"],
                    "type": "RUNOUT_FLOW_VECTOR",
                    "velocity_kmh": r["debris_velocity_kmh"],
                    "lead_time_min": r["warning_lead_time_min"],
                    "risk_level": r["downstream_risk_level"]
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[pt[0], pt[1]] for pt in r["flow_path_coords"]]
                }
            })
            # Corridor polygon buffer feature
            features.append({
                "type": "Feature",
                "properties": {
                    "id": f"{r['runout_id']}-CORRIDOR",
                    "name": f"{r['name']} Impact Inundation Zone",
                    "type": "RUNOUT_CORRIDOR_POLYGON",
                    "affected_population": r["affected_population_estimate"],
                    "risk_level": r["downstream_risk_level"]
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[pt[0], pt[1]] for pt in r["corridor_polygon_coords"]]]
                }
            })
        return {"type": "FeatureCollection", "features": features}

    def compute_downstream_rpi_adjustment(
        self,
        base_rpi: float,
        is_downstream_corridor: bool,
        downstream_severity: str = "CRITICAL"
    ) -> Dict[str, Any]:
        """
        Integrates downstream runout risk into the Relocation Priority Index (RPI).
        """
        if not is_downstream_corridor:
            return {
                "base_rpi": base_rpi,
                "adjusted_rpi": base_rpi,
                "downstream_runout_factor": 0.0,
                "is_downstream_at_risk": False
            }

        bonus = 18.0 if downstream_severity == "CRITICAL" else 10.0 if downstream_severity == "HIGH" else 5.0
        adjusted_rpi = min(100.0, round(base_rpi + bonus, 1))

        return {
            "base_rpi": base_rpi,
            "adjusted_rpi": adjusted_rpi,
            "downstream_runout_factor": bonus,
            "is_downstream_at_risk": True,
            "downstream_severity": downstream_severity
        }

# Global Singleton Instance
runout_engine = RunoutCascadingRiskEngine()
