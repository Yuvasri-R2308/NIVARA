"""
NIVARA — Model Maturity Index (MMI) & Trust-Gating Engine
"""

from backend.models.maturity_engine import (
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
    gate_alert_dispatch,
    MaturityMode
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
    "gate_alert_dispatch",
    "MaturityMode"
]

if __name__ == "__main__":
    # Example model information
    accuracy = 0.86
    sample_count = 500
    uncertainty = 0.10

    result = get_maturity_result(
        accuracy,
        sample_count,
        uncertainty
    )

    print("\n===== NIVARA MODEL MATURITY =====")
    print("Validation Accuracy:", accuracy * 100, "%")
    print("Validation Samples:", sample_count)
    print("Uncertainty:", uncertainty * 100, "%")
    print("\nMMI:", result["mmi"])
    print("Mode:", result["mode"])
    print("Confidence:", result["confidence"])
    print("Can Auto Alert:", result["can_auto_alert"])
