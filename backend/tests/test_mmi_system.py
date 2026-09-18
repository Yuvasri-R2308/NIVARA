import pytest
import sys
from pathlib import Path
import pandas as pd
from datetime import datetime, timedelta

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.models.maturity_engine import (
    compute_mmi,
    get_maturity_mode,
    rolling_backtest,
    evaluate_model_component,
    gate_alert_dispatch
)
from backend.schemas.maturity_schemas import (
    MaturityMode,
    XGBoostRiskResponse,
    BayesianPosteriorResponse,
    HRIResponse,
    RPIResponse,
    UnifiedRiskMaturityResponse,
    ModelMaturityDetailResponse
)
from backend.app.main import app
from backend.app.engines.alert_dispatcher import alert_dispatcher

client = TestClient(app)

# =====================================================================
# 1. COMPUTE MMI FORMULATION & WEIGHT TESTS
# =====================================================================

def test_compute_mmi_weights_explicit():
    """
    Tests exact 40% / 40% / 20% weighted components:
    - Sample size 250 / 500 = 50% => 0.40 * 50 = 20.0 pts
    - Backtest accuracy 0.90 => 90% => 0.40 * 90 = 36.0 pts
    - Uncertainty width 0.10 => inverse 0.90 => 0.20 * 90 = 18.0 pts
    - Total = 20.0 + 36.0 + 18.0 = 74.0 pts
    """
    score = compute_mmi(
        validation_sample_size=250,
        rolling_backtest_accuracy=0.90,
        posterior_uncertainty_width=0.10,
        max_sample_size=500
    )
    assert score == pytest.approx(74.0, 0.01)

def test_compute_mmi_boundary_extremes():
    """Tests 0% lower bound and 100% upper bound clamping."""
    # Min score
    min_score = compute_mmi(
        validation_sample_size=0,
        rolling_backtest_accuracy=0.0,
        posterior_uncertainty_width=1.0,
        max_sample_size=500
    )
    assert min_score == 0.0

    # Max score
    max_score = compute_mmi(
        validation_sample_size=500,
        rolling_backtest_accuracy=1.0,
        posterior_uncertainty_width=0.0,
        max_sample_size=500
    )
    assert max_score == 100.0

    # Sample cap beyond max_sample_size
    capped_score = compute_mmi(
        validation_sample_size=1000,
        rolling_backtest_accuracy=1.0,
        posterior_uncertainty_width=0.0,
        max_sample_size=500
    )
    assert capped_score == 100.0

# =====================================================================
# 2. GET MATURITY MODE BOUNDARY TESTS (39.9, 40, 74.9, 75)
# =====================================================================

def test_get_maturity_mode_boundaries():
    """
    Validates exact boundaries:
    - mmi < 40: "shadow"
    - 40 <= mmi < 75: "assisted"
    - mmi >= 75: "autonomous"
    """
    # Boundary: 39.9 -> shadow
    assert get_maturity_mode(39.9) == "shadow"
    assert get_maturity_mode(0.0) == "shadow"
    assert get_maturity_mode(39.999) == "shadow"

    # Boundary: 40.0 -> assisted
    assert get_maturity_mode(40.0) == "assisted"
    assert get_maturity_mode(40.001) == "assisted"
    assert get_maturity_mode(55.0) == "assisted"

    # Boundary: 74.9 -> assisted
    assert get_maturity_mode(74.9) == "assisted"
    assert get_maturity_mode(74.999) == "assisted"

    # Boundary: 75.0 -> autonomous
    assert get_maturity_mode(75.0) == "autonomous"
    assert get_maturity_mode(75.001) == "autonomous"
    assert get_maturity_mode(95.5) == "autonomous"
    assert get_maturity_mode(100.0) == "autonomous"

# =====================================================================
# 3. ROLLING BACKTEST ACCURACY REPLAY TESTS
# =====================================================================

def test_rolling_backtest_accuracy():
    """Tests rolling backtest replay over historical DataFrame."""
    now = datetime.utcnow()
    dates = [(now - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(10)]
    
    # 8 correct out of 10
    df = pd.DataFrame({
        "date": dates,
        "predicted_class": ["HIGH", "HIGH", "HIGH", "LOW", "LOW", "HIGH", "HIGH", "LOW", "HIGH", "LOW"],
        "actual_class":    ["HIGH", "HIGH", "HIGH", "LOW", "LOW", "HIGH", "HIGH", "LOW", "LOW",  "HIGH"]
    })

    # Overall 10 days accuracy: 8 / 10 = 0.80
    acc_all = rolling_backtest(df)
    assert acc_all == pytest.approx(0.80, 0.01)

    # Filter last 5 days (indexes 0 to 4: all correct -> 5 / 5 = 1.0)
    acc_5d = rolling_backtest(df, days=5)
    assert acc_5d == pytest.approx(1.0, 0.01)

def test_rolling_backtest_empty():
    """Tests empty DataFrame handling."""
    empty_df = pd.DataFrame(columns=["date", "predicted_class", "actual_class"])
    assert rolling_backtest(empty_df) == 0.0
    assert rolling_backtest(None) == 0.0

# =====================================================================
# 4. BUSINESS RULE: SHADOW MODE ALERT GATING
# =====================================================================

def test_shadow_mode_alert_gating():
    """
    Business Rule: If maturity_mode is 'shadow', automated alert dispatch
    is blocked and returns requires_manual_review: True.
    Raw hazard values are NEVER blocked from display.
    """
    result = gate_alert_dispatch(
        location="Mundakkai Scarp",
        raw_hazard_score=88.5,
        maturity_mode="shadow",
        alert_payload={"alert_id": "TEST-001"}
    )
    assert result["dispatched"] is False
    assert result["requires_manual_review"] is True
    assert result["raw_hazard_score"] == 88.5

    # Autonomous mode dispatches normally
    auto_result = gate_alert_dispatch(
        location="Mundakkai Scarp",
        raw_hazard_score=88.5,
        maturity_mode="autonomous",
        alert_payload={"alert_id": "TEST-002"}
    )
    assert auto_result["dispatched"] is True
    assert auto_result["requires_manual_review"] is False
    assert auto_result["raw_hazard_score"] == 88.5

def test_alert_dispatcher_shadow_mode():
    """Tests alert_dispatcher handles shadow mode without throwing errors."""
    alert = alert_dispatcher.dispatch_alert(
        location="Test Low Validation Zone",
        catchment_id="MC_TEST_01",
        hri=82.0,
        rpi=85.0,
        mmi=35.0,  # Shadow mode (< 40)
        reason="Test alert trigger in shadow mode"
    )
    assert alert["requires_manual_review"] is True
    assert alert["maturity_mode"] == "shadow"
    assert alert["status"] == "BLOCKED_SHADOW_MODE"
    assert alert["hri"] == 82.0  # Raw score preserved

# =====================================================================
# 5. PYDANTIC RESPONSE SCHEMAS
# =====================================================================

def test_pydantic_schemas_have_maturity_fields():
    """Verifies all required response models include maturity_index and maturity_mode."""
    # XGBoost
    xgb = XGBoostRiskResponse(
        predicted_class="CRITICAL",
        confidence_score=0.94,
        maturity_index=85.0,
        maturity_mode="autonomous"
    )
    assert xgb.maturity_index == 85.0
    assert xgb.maturity_mode == "autonomous"

    # Bayesian
    bayes = BayesianPosteriorResponse(
        location="Meppadi",
        prior_probability=0.50,
        posterior_probability=0.89,
        credible_interval_lower=0.82,
        credible_interval_upper=0.96,
        uncertainty_width=0.14,
        maturity_index=78.0,
        maturity_mode="autonomous"
    )
    assert bayes.maturity_index == 78.0
    assert bayes.maturity_mode == "autonomous"

    # HRI
    hri = HRIResponse(
        location="Meppadi",
        static_hri=84.5,
        dynamic_hri=92.0,
        rainfall_24h_mm=284.5,
        risk_level="HIGH",
        maturity_index=78.0,
        maturity_mode="autonomous"
    )
    assert hri.maturity_index == 78.0
    assert hri.maturity_mode == "autonomous"

    # RPI
    rpi = RPIResponse(
        village="Meppadi",
        base_rpi=84.0,
        adjusted_rpi=96.0,
        relocation_urgency="CRITICAL",
        is_downstream_corridor=True,
        maturity_index=78.0,
        maturity_mode="autonomous"
    )
    assert rpi.maturity_index == 78.0
    assert rpi.maturity_mode == "autonomous"

# =====================================================================
# 6. FASTAPI ENDPOINT GET /api/maturity/{model_name}
# =====================================================================

@pytest.mark.parametrize("model_name", ["xgboost", "bayesian", "hri", "rpi"])
def test_api_maturity_endpoints_success(model_name):
    """Tests GET /api/maturity/{model_name} returns valid MMI metadata."""
    response = client.get(f"/api/maturity/{model_name}")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == model_name
    assert "maturity_index" in data
    assert 0.0 <= data["maturity_index"] <= 100.0
    assert data["maturity_mode"] in ["shadow", "assisted", "autonomous"]
    assert "last_backtest_date" in data
    assert "sample_size" in data
    assert "backtest_accuracy" in data
    assert "uncertainty_width" in data

def test_api_maturity_endpoint_not_found():
    """Tests GET /api/maturity/unknown returns 404."""
    response = client.get("/api/maturity/nonexistent_model")
    assert response.status_code == 404


@pytest.mark.parametrize("path,score_key", [
    ("/api/v2/xgboost", "predicted_class"),
    ("/api/v2/bayesian", "posterior_probability"),
    ("/api/v2/hri", "dynamic_hri"),
    ("/api/v2/rpi", "adjusted_rpi"),
])
def test_wrapped_model_endpoints_include_maturity_without_hiding_scores(path, score_key):
    """MMI metadata is additive; raw model outputs remain present."""
    response = client.get(path)
    assert response.status_code == 200
    data = response.json()
    assert score_key in data
    assert data[score_key] is not None
    assert "maturity_index" in data
    assert data["maturity_mode"] in ["shadow", "assisted", "autonomous"]


def test_dynamic_risk_contract_preserves_existing_keys():
    """Existing /api/v2/dynamic-risk keys remain; MMI fields are additive."""
    response = client.get("/api/v2/dynamic-risk?location=Meppadi")
    assert response.status_code == 200
    data = response.json()
    for key in ("location", "rainfall", "wetness", "model", "downstream", "alert", "risk"):
        assert key in data
    assert "static_hri" in data["risk"]
    assert "adjusted_rpi" in data["risk"]
    assert "bayesian_probability" in data["risk"]
    assert "xgboost_risk_class" in data["risk"]
    assert "maturity_index" in data
    assert "maturity_mode" in data

if __name__ == "__main__":
    pytest.main(["-v", __file__])
