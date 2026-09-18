"""
NIVARA 2.0 — Module 3: Dynamic Wetness & Slope Stability Engine
Computes the Antecedent Precipitation Index (API), multi-day cumulative precipitation (24h/48h/72h),
soil moisture saturation profiles, and Dynamic Hazard Risk Index (HRI_dynamic).
"""

from typing import Dict, Any, List, Optional
import numpy as np
from ..config.settings import settings

class DynamicWetnessEngine:
    """
    Computes Antecedent Precipitation Index (API) using the exponential decay formula:
    API_t = sum(P_i * k^(t-i)) with decay factor k = 0.85
    and calculates Dynamic HRI.
    """

    def __init__(self):
        self.decay_factor = settings.API_DECAY_FACTOR
        self.api_weight = settings.DYNAMIC_HRI_API_WEIGHT
        self.pore_pressure_weight = settings.DYNAMIC_HRI_PORE_PRESSURE_WEIGHT

    def compute_api(self, daily_precip_series: List[float], decay_factor: Optional[float] = None) -> float:
        """
        Computes Antecedent Precipitation Index (API).
        daily_precip_series: list of precipitation values ordered chronologically [day_t-N, ..., day_t-1, day_t]
        """
        k = decay_factor if decay_factor is not None else self.decay_factor
        n = len(daily_precip_series)
        if n == 0:
            return 0.0

        api = 0.0
        for idx, p in enumerate(daily_precip_series):
            lag = (n - 1) - idx  # 0 for today, 1 for yesterday, etc.
            api += float(p) * (k ** lag)

        return round(api, 2)

    def evaluate_location_wetness(
        self,
        rain_24h: float,
        rain_48h: float,
        rain_72h: float,
        recent_daily_history: Optional[List[float]] = None
    ) -> Dict[str, Any]:
        """
        Evaluates full wetness profile and cumulative indicators.
        """
        if recent_daily_history is None or len(recent_daily_history) == 0:
            # Reconstruct estimated 5-day antecedent history from 24h/48h/72h cumulative values
            day_t = rain_24h
            day_t_minus_1 = max(0.0, rain_48h - rain_24h)
            day_t_minus_2 = max(0.0, rain_72h - rain_48h)
            day_t_minus_3 = day_t_minus_2 * 0.7
            day_t_minus_4 = day_t_minus_3 * 0.6
            history = [day_t_minus_4, day_t_minus_3, day_t_minus_2, day_t_minus_1, day_t]
        else:
            history = recent_daily_history

        api_value = self.compute_api(history, self.decay_factor)

        # Normalize API relative to 300mm saturation benchmark (0 - 100 scale)
        normalized_api = min(100.0, round((api_value / 300.0) * 100.0, 1))

        # Wetness Level Classification
        if normalized_api >= 80.0 or rain_48h >= 350.0:
            wetness_level = "CRITICAL"
        elif normalized_api >= 55.0 or rain_48h >= 220.0:
            wetness_level = "HIGH"
        elif normalized_api >= 30.0 or rain_24h >= 80.0:
            wetness_level = "MODERATE"
        else:
            wetness_level = "LOW"

        return {
            "rainfall_24h_mm": round(rain_24h, 1),
            "rainfall_48h_mm": round(rain_48h, 1),
            "rainfall_72h_mm": round(rain_72h, 1),
            "antecedent_precipitation_index": api_value,
            "normalized_api": normalized_api,
            "wetness_level": wetness_level,
            "decay_factor_k": self.decay_factor,
            "soil_pore_pressure_status": "Pore-pressure satellite fusion not available; API contribution active"
        }

    def compute_dynamic_hri(
        self,
        static_hri: float,
        rain_24h: float,
        rain_48h: float,
        rain_72h: float,
        estimated_pore_pressure_ratio: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Computes Dynamic HRI:
        HRI_dynamic = min(100, HRI_static + 0.25 * Normalized_API + 0.15 * Pore_Pressure)
        """
        wetness_profile = self.evaluate_location_wetness(rain_24h, rain_48h, rain_72h)
        norm_api = wetness_profile["normalized_api"]

        api_contribution = self.api_weight * norm_api

        if estimated_pore_pressure_ratio is not None:
            pp_contribution = self.pore_pressure_weight * min(100.0, estimated_pore_pressure_ratio * 100.0)
            pp_note = f"Active ({round(estimated_pore_pressure_ratio, 2)})"
        else:
            pp_contribution = 0.0
            pp_note = "Pore-pressure satellite fusion not available"

        dynamic_hri_raw = static_hri + api_contribution + pp_contribution
        dynamic_hri = round(min(100.0, max(0.0, dynamic_hri_raw)), 1)

        return {
            "static_hri": round(static_hri, 1),
            "dynamic_hri": dynamic_hri,
            "delta_hri": round(dynamic_hri - static_hri, 1),
            "api_contribution": round(api_contribution, 1),
            "pore_pressure_contribution": round(pp_contribution, 1),
            "pore_pressure_note": pp_note,
            "wetness_profile": wetness_profile
        }

# Global Singleton Instance
wetness_engine = DynamicWetnessEngine()
