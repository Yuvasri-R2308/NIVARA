"""
NIVARA — Model Maturity Index (MMI) & Trust-Gating Engine
Implements the Model Maturity Index (MMI) scoring system, maturity mode classification,
and rolling backtest evaluations for disaster risk models (XGBoost, Bayesian, HRI, RPI).
"""

from typing import Dict, Any, Optional, Literal
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from pathlib import Path

# Maturity Mode Type
MaturityMode = Literal["shadow", "assisted", "autonomous"]

# =====================================================================
# 1. CORE NIVARA MODEL MATURITY FUNCTIONS
# =====================================================================

def calculate_validation_score(accuracy: float) -> float:
    """
    accuracy should be between 0 and 1 (or 0 and 100).
    Example: 0.86 = 86%
    """
    scaled = accuracy * 100.0 if accuracy <= 1.0 else accuracy
    return max(0.0, min(100.0, float(scaled)))


def calculate_sample_maturity(sample_count: int) -> float:
    """
    More validation samples = higher maturity.
    1000 or more samples = 100.
    """
    score = (float(sample_count) / 1000.0) * 100.0
    return max(0.0, min(100.0, score))


def calculate_uncertainty_score(uncertainty: float) -> float:
    """
    Lower uncertainty = higher score.
    uncertainty should be between 0 and 1.
    """
    score = (1.0 - float(uncertainty)) * 100.0
    return max(0.0, min(100.0, score))


def calculate_mmi(accuracy: float, sample_count: int, uncertainty: float) -> float:
    """
    Calculates Model Maturity Index (MMI) based on validation accuracy,
    sample count, and uncertainty width.
    Weights: 40% Validation + 30% Sample Count + 30% Uncertainty Inverse.
    """
    validation_score = calculate_validation_score(accuracy)
    sample_score = calculate_sample_maturity(sample_count)
    uncertainty_score = calculate_uncertainty_score(uncertainty)

    mmi = (
        0.40 * validation_score +
        0.30 * sample_score +
        0.30 * uncertainty_score
    )

    return round(mmi, 2)


def get_mode(mmi: float) -> str:
    """
    Returns the operational mode: SHADOW (<40), ASSISTED (40-75), AUTONOMOUS (>=75).
    """
    if mmi < 40:
        return "SHADOW"
    elif mmi < 75:
        return "ASSISTED"
    else:
        return "AUTONOMOUS"


def get_confidence(mmi: float) -> str:
    """
    Returns confidence rating: LOW (<40), MODERATE (40-75), HIGH (>=75).
    """
    if mmi < 40:
        return "LOW"
    elif mmi < 75:
        return "MODERATE"
    else:
        return "HIGH"


def get_maturity_result(accuracy: float, sample_count: int, uncertainty: float) -> Dict[str, Any]:
    """
    Evaluates model maturity parameters and returns a complete decision-support result.
    """
    mmi = calculate_mmi(
        accuracy,
        sample_count,
        uncertainty
    )

    mode = get_mode(mmi)
    confidence = get_confidence(mmi)

    return {
        "mmi": mmi,
        "mode": mode,
        "confidence": confidence,
        "can_auto_alert": mmi >= 75
    }


# =====================================================================
# 2. PARAMETRIC & BACKWARD-COMPATIBLE MMI HELPERS
# =====================================================================

def compute_mmi(
    validation_sample_size: int,
    rolling_backtest_accuracy: float,
    posterior_uncertainty_width: float,
    max_sample_size: int = 500
) -> float:
    """
    Parametric MMI computation using configurable sample target:
    - 40% sample size (capped at max_sample_size, default 500)
    - 40% rolling backtest accuracy (0-1 scaled to 0-100)
    - 20% inverse of posterior uncertainty width (narrower interval = higher score)
    """
    sample_ratio = min(1.0, max(0.0, float(validation_sample_size)) / max(1.0, float(max_sample_size)))
    sample_component = sample_ratio * 100.0 * 0.40

    acc_scaled = (rolling_backtest_accuracy * 100.0) if rolling_backtest_accuracy <= 1.0 else rolling_backtest_accuracy
    acc_clamped = max(0.0, min(100.0, float(acc_scaled)))
    accuracy_component = acc_clamped * 0.40

    width_clamped = max(0.0, min(1.0, float(posterior_uncertainty_width)))
    uncertainty_inverse = max(0.0, min(100.0, (1.0 - width_clamped) * 100.0))
    uncertainty_component = uncertainty_inverse * 0.20

    mmi = sample_component + accuracy_component + uncertainty_component
    return round(max(0.0, min(100.0, mmi)), 2)


def get_maturity_mode(mmi: float) -> MaturityMode:
    """
    Returns lowercase literal mode: 'shadow' | 'assisted' | 'autonomous'.
    """
    if mmi < 40.0:
        return "shadow"
    elif mmi < 75.0:
        return "assisted"
    else:
        return "autonomous"


def rolling_backtest(df: pd.DataFrame, days: Optional[int] = None) -> float:
    """
    Replays predictions against actual outcomes over the last N days (or full DataFrame).
    """
    if df is None or df.empty:
        return 0.0

    required_cols = {'predicted_class', 'actual_class'}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"DataFrame must contain columns {required_cols}. Found: {df.columns.tolist()}")

    target_df = df.copy()

    if days is not None and 'date' in target_df.columns:
        target_df['date'] = pd.to_datetime(target_df['date'])
        max_date = target_df['date'].max()
        cutoff_date = max_date - timedelta(days=days)
        target_df = target_df[target_df['date'] >= cutoff_date]

    if target_df.empty:
        return 0.0

    correct = (target_df['predicted_class'] == target_df['actual_class']).sum()
    total = len(target_df)
    return float(correct / total) if total > 0 else 0.0


def attach_maturity(payload: Dict[str, Any], model_name: str) -> Dict[str, Any]:
    """
    Copies an existing model payload and appends maturity_index / maturity_mode.
    Does not alter any calculated hazard values.
    """
    meta = evaluate_model_component(model_name)
    wrapped = dict(payload)
    wrapped["maturity_index"] = meta["maturity_index"]
    wrapped["maturity_mode"] = meta["maturity_mode"]
    return wrapped


def evaluate_model_component(model_name: str) -> Dict[str, Any]:
    """
    Evaluates maturity metadata for a given model component:
    'xgboost', 'bayesian', 'hri', 'rpi'.
    """
    name_norm = model_name.lower().strip()

    profiles = {
        "xgboost": {
            "sample_size": 1000,
            "backtest_accuracy": 0.9299,
            "uncertainty_width": 0.14,
            "last_backtest_date": "2026-08-27T00:00:00Z"
        },
        "bayesian": {
            "sample_size": 500,
            "backtest_accuracy": 0.8950,
            "uncertainty_width": 0.16,
            "last_backtest_date": "2026-08-27T00:00:00Z"
        },
        "hri": {
            "sample_size": 500,
            "backtest_accuracy": 0.9100,
            "uncertainty_width": 0.15,
            "last_backtest_date": "2026-08-27T00:00:00Z"
        },
        "rpi": {
            "sample_size": 450,
            "backtest_accuracy": 0.8800,
            "uncertainty_width": 0.18,
            "last_backtest_date": "2026-08-27T00:00:00Z"
        }
    }

    if name_norm not in profiles:
        raise ValueError(f"Unknown model component '{model_name}'. Valid options: {list(profiles.keys())}")

    p = profiles[name_norm]
    mmi = compute_mmi(
        validation_sample_size=p["sample_size"],
        rolling_backtest_accuracy=p["backtest_accuracy"],
        posterior_uncertainty_width=p["uncertainty_width"],
        max_sample_size=500
    )
    mode = get_maturity_mode(mmi)

    return {
        "model_name": name_norm,
        "maturity_index": mmi,
        "maturity_mode": mode,
        "last_backtest_date": p["last_backtest_date"],
        "sample_size": p["sample_size"],
        "backtest_accuracy": p["backtest_accuracy"],
        "uncertainty_width": p["uncertainty_width"],
        "requires_manual_review": (mode == "shadow")
    }


def gate_alert_dispatch(
    location: str,
    raw_hazard_score: float,
    maturity_mode: MaturityMode,
    alert_payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Enforces business rule: If maturity_mode is 'shadow', automated alert dispatch
    is blocked, logged, and returns requires_manual_review: true.
    """
    is_shadow = (maturity_mode.lower() == "shadow")
    if is_shadow:
        print(f"[MMI SHADOW MODE] Automated alert dispatch BLOCKED for {location}. Raw hazard: {raw_hazard_score}. Logged for manual review.")
        return {
            "dispatched": False,
            "requires_manual_review": True,
            "maturity_mode": "shadow",
            "raw_hazard_score": raw_hazard_score,
            "reason": "Model is in shadow mode (MMI < 40). Automated dispatch prohibited without human confirmation."
        }

    return {
        "dispatched": True,
        "requires_manual_review": (maturity_mode.lower() == "assisted"),
        "maturity_mode": maturity_mode,
        "raw_hazard_score": raw_hazard_score,
        "alert_id": alert_payload.get("alert_id")
    }


if __name__ == "__main__":
    # Example model information
    acc = 0.86
    samples = 500
    uncert = 0.10

    res = get_maturity_result(
        acc,
        samples,
        uncert
    )

    print("\n===== NIVARA MODEL MATURITY =====")
    print("Validation Accuracy:", acc * 100, "%")
    print("Validation Samples:", samples)
    print("Uncertainty:", uncert * 100, "%")
    print("\nMMI:", res["mmi"])
    print("Mode:", res["mode"])
    print("Confidence:", res["confidence"])
    print("Can Auto Alert:", res["can_auto_alert"])
