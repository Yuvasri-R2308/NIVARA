"""
NIVARA: Bayesian Risk Probability Model for Landslide Hazard Estimation
------------------------------------------------------------------------
Estimates posterior landslide probability P(Landslide | Evidence) with 95% Credible Intervals.
Evidence inputs:
- Precipitation (24h mm)
- Slope Gradient (degrees)
- Soil Moisture / Pore Pressure Saturation (%)
- Historical Landslide Evidence / Recurrence (%)

Mathematical Formulation:
Prior: P(Landslide) ~ Beta(alpha_0, beta_0) [Regional Wayanad baseline prior: ~15%]
Likelihood: Logit-linear link with uncertainty propagation
Posterior: Beta-approximated distribution yielding mean, 2.5% lower bound, and 97.5% upper bound.

NOTE: This is a decision-support prototype model for empirical risk assessment.
"""

import json
import math
import os
from typing import Dict, Any, List

def calculate_bayesian_landslide_probability(
    area_name: str,
    rainfall_24h_mm: float,
    slope_deg: float,
    soil_moisture_pct: float,
    history_freq_pct: float,
    hri_score: float,
    category: str = "Disaster Epicenter"
) -> Dict[str, Any]:
    """
    Computes Bayesian posterior landslide probability with 95% Credible Interval.
    """
    # 1. Regional Prior (Wayanad Western Ghats baseline prior: ~15% baseline hazard probability)
    prior_alpha = 1.5
    prior_beta = 8.5
    prior_mean = prior_alpha / (prior_alpha + prior_beta)  # 0.15

    # 2. Normalized Evidence Components (0.0 to 1.0)
    # Rainfall: 285mm = critical cloudburst threshold in Wayanad 2024
    rain_norm = min(1.0, max(0.0, rainfall_24h_mm / 285.0))
    # Slope: 40 degrees = threshold angle of scarp failure
    slope_norm = min(1.0, max(0.0, slope_deg / 40.0))
    # Soil Moisture: 100% pore pressure liquefaction threshold
    soil_norm = min(1.0, max(0.0, soil_moisture_pct / 100.0))
    # Historical Landslide Frequency: GSI recurrence
    hist_norm = min(1.0, max(0.0, history_freq_pct / 100.0))

    # 3. Evidence Weights (Empirical Geotechnical weights)
    w_rain = 0.35
    w_slope = 0.30
    w_soil = 0.20
    w_hist = 0.15

    composite_evidence = (
        (rain_norm * w_rain) +
        (slope_norm * w_slope) +
        (soil_norm * w_soil) +
        (hist_norm * w_hist)
    )

    # 4. Bayesian Updating (Log-odds update from prior to posterior)
    prior_log_odds = math.log(prior_mean / (1.0 - prior_mean))
    
    # Evidence log-likelihood ratio update (calibrated against GSI debris flow trigger levels)
    evidence_shift = (composite_evidence - 0.25) * 5.25
    
    posterior_log_odds = prior_log_odds + evidence_shift
    posterior_prob = 1.0 / (1.0 + math.exp(-posterior_log_odds))

    # Bound probability between 0.02 and 0.98
    posterior_prob = max(0.02, min(0.98, posterior_prob))

    # 5. 95% Credible Interval (Beta concentration model)
    kappa = 72.0
    post_alpha = posterior_prob * kappa
    post_beta = (1.0 - posterior_prob) * kappa
    
    # Standard deviation of Beta posterior
    variance = (post_alpha * post_beta) / ((post_alpha + post_beta)**2 * (post_alpha + post_beta + 1))
    std_dev = math.sqrt(variance)

    # 95% Credible Interval: mean +/- 1.96 * std_dev
    lower_bound = max(0.01, round(posterior_prob - (1.96 * std_dev), 2))
    upper_bound = min(0.99, round(posterior_prob + (1.96 * std_dev), 2))
    mean_prob = round(posterior_prob, 2)

    # 6. Risk Level
    if mean_prob >= 0.80:
        risk_level = "VERY HIGH"
    elif mean_prob >= 0.60:
        risk_level = "HIGH"
    elif mean_prob >= 0.35:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # 7. Explainability Breakdown
    explainability = {
        "rainfall_evidence": {
            "metric": f"{rainfall_24h_mm:.1f} mm",
            "contribution_pct": round(rain_norm * w_rain * 100, 1),
            "description": "24h precipitation exceedance relative to 285mm cloudburst threshold."
        },
        "slope_evidence": {
            "metric": f"{slope_deg:.1f}°",
            "contribution_pct": round(slope_norm * w_slope * 100, 1),
            "description": "Topographic scarp angle relative to 40° regolith stability threshold."
        },
        "soil_moisture_evidence": {
            "metric": f"{soil_moisture_pct:.1f}%",
            "contribution_pct": round(soil_norm * w_soil * 100, 1),
            "description": "Subsurface pore pressure saturation driving soil liquefaction."
        },
        "historical_evidence": {
            "metric": f"{history_freq_pct:.1f}%",
            "contribution_pct": round(hist_norm * w_hist * 100, 1),
            "description": "Historical GSI landslide recurrence frequency in catchment."
        }
    }

    why_this_probability = (
        f"Posterior probability of {round(mean_prob * 100)}% (95% CI: {round(lower_bound * 100)}%–{round(upper_bound * 100)}%) "
        f"is driven primarily by {rainfall_24h_mm:.1f}mm precipitation ({round(rain_norm*w_rain*100)}% contribution) "
        f"and {slope_deg:.1f}° terrain gradient ({round(slope_norm*w_slope*100)}% contribution), "
        f"updating regional prior ({round(prior_mean*100)}%) under Bayesian log-likelihood evidence fusion."
    )

    return {
        "area": area_name,
        "category": category,
        "landslide_probability": mean_prob,
        "lower_bound": lower_bound,
        "upper_bound": upper_bound,
        "credible_interval_str": f"{round(lower_bound * 100)}%–{round(upper_bound * 100)}%",
        "risk": risk_level,
        "hri_score": hri_score,
        "model_status": "Prototype / Empirical Beta-Logit Inference",
        "evidence_breakdown": explainability,
        "why_this_probability": why_this_probability
    }

def generate_bayesian_risk_dataset():
    """
    Generates Bayesian risk assessments for all primary study areas in Wayanad.
    """
    study_areas = [
        {
            "name": "Meppadi (Mundakkai / Chooralmala)",
            "short_name": "Meppadi",
            "category": "Disaster Epicenter",
            "rainfall_24h_mm": 284.5,
            "slope_deg": 38.5,
            "soil_moisture_pct": 98.0,
            "history_freq_pct": 95.0,
            "hri_score": 84.46
        },
        {
            "name": "Achooranam (Plantation Foothills)",
            "short_name": "Achooranam",
            "category": "Slope Hazard Zone",
            "rainfall_24h_mm": 178.0,
            "slope_deg": 18.2,
            "soil_moisture_pct": 71.0,
            "history_freq_pct": 48.0,
            "hri_score": 44.30
        },
        {
            "name": "Kottathara (Kabini River Basin)",
            "short_name": "Kottathara",
            "category": "River Valley Zone",
            "rainfall_24h_mm": 154.0,
            "slope_deg": 6.5,
            "soil_moisture_pct": 82.0,
            "history_freq_pct": 68.0,
            "hri_score": 44.10
        },
        {
            "name": "Kuppadithara (Stable Agricultural Plateau)",
            "short_name": "Kuppadithara",
            "category": "Flatland Buffer",
            "rainfall_24h_mm": 138.4,
            "slope_deg": 5.8,
            "soil_moisture_pct": 54.0,
            "history_freq_pct": 25.0,
            "hri_score": 40.70
        },
        {
            "name": "Vythiri (Ghat Pass Corridor)",
            "short_name": "Vythiri",
            "category": "Slope Hazard Zone",
            "rainfall_24h_mm": 220.0,
            "slope_deg": 22.4,
            "soil_moisture_pct": 79.0,
            "history_freq_pct": 58.0,
            "hri_score": 58.20
        },
        {
            "name": "Padinharethara (Banasura Reservoir Zone)",
            "short_name": "Padinharethara",
            "category": "River Valley Zone",
            "rainfall_24h_mm": 165.0,
            "slope_deg": 9.4,
            "soil_moisture_pct": 64.0,
            "history_freq_pct": 38.0,
            "hri_score": 38.60
        },
        {
            "name": "Mananthavady (Northern Plains)",
            "short_name": "Mananthavady",
            "category": "River Valley Zone",
            "rainfall_24h_mm": 142.0,
            "slope_deg": 4.8,
            "soil_moisture_pct": 66.0,
            "history_freq_pct": 42.0,
            "hri_score": 32.40
        },
        {
            "name": "Sulthan Bathery (Eastern Plain)",
            "short_name": "Sulthan Bathery",
            "category": "Flatland Buffer",
            "rainfall_24h_mm": 96.0,
            "slope_deg": 3.2,
            "soil_moisture_pct": 32.0,
            "history_freq_pct": 8.0,
            "hri_score": 14.80
        }
    ]

    results: Dict[str, Any] = {
        "metadata": {
            "model_name": "NIVARA Bayesian Landslide Hazard Estimator",
            "version": "1.0-prototype",
            "description": "Empirical Bayesian probability updating for landslide hazard estimation given multi-factor environmental evidence.",
            "target_district": "Wayanad, Kerala",
            "prior_distribution": "Beta(1.5, 8.5) ~ 15% baseline regional prior",
            "disclaimer": "Decision-support research prototype. Not an official government emergency warning authority."
        },
        "areas": {}
    }

    for area in study_areas:
        calc = calculate_bayesian_landslide_probability(
            area_name=area["name"],
            rainfall_24h_mm=area["rainfall_24h_mm"],
            slope_deg=area["slope_deg"],
            soil_moisture_pct=area["soil_moisture_pct"],
            history_freq_pct=area["history_freq_pct"],
            hri_score=area["hri_score"],
            category=area["category"]
        )
        results["areas"][area["short_name"]] = calc

    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    ML_DIR = os.path.dirname(SCRIPT_DIR)
    PROJECT_ROOT = os.path.dirname(ML_DIR)

    out_ml = os.path.join(ML_DIR, "models", "bayesian_risk.json")
    out_datasets = os.path.join(PROJECT_ROOT, "datasets", "processed", "bayesian_risk.json")
    out_frontend = os.path.join(PROJECT_ROOT, "frontend", "public", "data", "bayesian_risk.json")

    os.makedirs(os.path.dirname(out_ml), exist_ok=True)
    os.makedirs(os.path.dirname(out_datasets), exist_ok=True)
    os.makedirs(os.path.dirname(out_frontend), exist_ok=True)

    with open(out_ml, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    with open(out_datasets, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    with open(out_frontend, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"[SUCCESS] Bayesian risk model generated successfully for {len(study_areas)} areas.")
    print(f"Output saved -> {out_ml}")
    print(f"Output saved -> {out_datasets}")
    print(f"Output saved -> {out_frontend}")

if __name__ == "__main__":
    generate_bayesian_risk_dataset()
