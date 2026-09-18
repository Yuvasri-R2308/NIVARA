"""
NIVARA Models Package
"""
from .maturity_engine import (
    calculate_validation_score,
    calculate_sample_maturity,
    calculate_uncertainty_score,
    calculate_mmi,
    get_mode,
    get_confidence,
    get_maturity_result,
    compute_mmi,
    get_maturity_mode,
    rolling_backtest,
    evaluate_model_component,
    attach_maturity,
    gate_alert_dispatch,
    MaturityMode
)
from .catchment_engine import (
    delineate_catchments,
    assign_rainfall_to_catchments,
    flag_localized_extreme,
    regenerate_catchments,
    get_cached_catchments_geojson
)

__all__ = [
    "calculate_validation_score",
    "calculate_sample_maturity",
    "calculate_uncertainty_score",
    "calculate_mmi",
    "get_mode",
    "get_confidence",
    "get_maturity_result",
    "compute_mmi",
    "get_maturity_mode",
    "rolling_backtest",
    "evaluate_model_component",
    "attach_maturity",
    "gate_alert_dispatch",
    "MaturityMode",
    "delineate_catchments",
    "assign_rainfall_to_catchments",
    "flag_localized_extreme",
    "regenerate_catchments",
    "get_cached_catchments_geojson"
]
