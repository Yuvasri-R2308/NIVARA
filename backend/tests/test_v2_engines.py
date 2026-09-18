"""
NIVARA 2.0 — Comprehensive Verification Suite
Tests all 5 core modules:
1. API calculation & decay
2. 24h/48h/72h rainfall thresholds
3. MMI calculation & operating modes
4. Dynamic HRI
5. Micro-catchments & extreme event flags
6. Downstream runout corridors & RPI integration
7. Alert dispatcher, acknowledgement & escalation
8. FastAPI /api/v2 REST endpoints
"""

import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config.settings import settings
from backend.app.engines.maturity_engine import maturity_engine
from backend.app.engines.catchment_engine import catchment_engine
from backend.app.engines.wetness_engine import wetness_engine
from backend.app.engines.runout_engine import runout_engine
from backend.app.engines.alert_dispatcher import alert_dispatcher

client = TestClient(app)

def test_1_api_calculation():
    """Test Antecedent Precipitation Index (API) formula: API_t = sum(P_i * k^(t-i))"""
    precip_series = [10.0, 20.0, 30.0, 50.0]  # day 0, 1, 2, 3 (today)
    k = 0.85
    api = wetness_engine.compute_api(precip_series, decay_factor=k)
    assert 95.0 <= api <= 97.0
    print(f"[PASS] Test 1: API calculation passed ({api})")

def test_2_rainfall_indicators_and_wetness():
    """Test 24h/48h/72h rainfall indicators and wetness classification."""
    profile = wetness_engine.evaluate_location_wetness(
        rain_24h=142.0,
        rain_48h=280.0,
        rain_72h=440.0
    )
    assert profile["rainfall_24h_mm"] == 142.0
    assert profile["rainfall_48h_mm"] == 280.0
    assert profile["rainfall_72h_mm"] == 440.0
    assert profile["normalized_api"] > 0
    assert profile["wetness_level"] in ["MODERATE", "HIGH", "CRITICAL"]
    print(f"[PASS] Test 2: Wetness profile passed (Normalized API: {profile['normalized_api']}, Level: {profile['wetness_level']})")

def test_3_dynamic_hri_calculation():
    """Test Dynamic HRI formula: HRI_dynamic = min(100, HRI_static + 0.25*Norm_API + 0.15*PP)"""
    res = wetness_engine.compute_dynamic_hri(
        static_hri=84.5,
        rain_24h=284.5,
        rain_48h=372.0,
        rain_72h=544.0,
        estimated_pore_pressure_ratio=0.98
    )
    assert res["dynamic_hri"] >= res["static_hri"]
    assert res["dynamic_hri"] <= 100.0
    assert res["api_contribution"] > 0
    assert res["pore_pressure_contribution"] > 0
    print(f"[PASS] Test 3: Dynamic HRI passed (Static: {res['static_hri']} -> Dynamic: {res['dynamic_hri']})")

def test_4_mmi_calculation_and_modes():
    """Test Model Maturity Index (MMI) and operating mode thresholds."""
    res_high = maturity_engine.calculate_mmi(sample_size=1000, target_sample_size=1000, ci_lower=0.82, ci_upper=0.96)
    assert res_high["mmi"] >= 75.0
    assert res_high["operating_mode"] == "AUTONOMOUS"
    assert res_high["can_dispatch_alert"] is True

    res_low = maturity_engine.calculate_mmi(sample_size=20, target_sample_size=1000, ci_lower=0.20, ci_upper=0.90)
    assert res_low["mmi"] < 40.0
    assert res_low["operating_mode"] == "SHADOW"
    assert res_low["can_dispatch_alert"] is False
    print(f"[PASS] Test 4: MMI modes passed (High: {res_high['mmi']} {res_high['operating_mode']}, Low: {res_low['mmi']} {res_low['operating_mode']})")

def test_5_catchments_and_extreme_event_flag():
    """Test micro-catchment delineation and 2.0x localized extreme rainfall anomaly flag."""
    catchments = catchment_engine.get_all_catchments(rainfall_multiplier=1.0)
    assert len(catchments) == 12

    chembra = next(c for c in catchments if c["catchment_id"] == "MC_MEPPADI_01")
    assert chembra["area_km2"] > 0
    assert chembra["mean_elevation_m"] > 1000.0
    assert "localized_extreme_event" in chembra

    geojson = catchment_engine.get_catchments_geojson()
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 12
    print(f"[PASS] Test 5: Catchments passed (Count: {len(catchments)}, Chembra extreme flag: {chembra['localized_extreme_event']})")

def test_6_downstream_runout_and_rpi():
    """Test downstream runout corridors and RPI cascading risk adjustment."""
    corridors = runout_engine.get_runout_corridors()
    assert len(corridors) >= 2
    meppadi_runout = corridors[0]
    assert meppadi_runout["debris_velocity_kmh"] > 40.0
    assert meppadi_runout["warning_lead_time_min"] > 0

    rpi_adj = runout_engine.compute_downstream_rpi_adjustment(
        base_rpi=72.0,
        is_downstream_corridor=True,
        downstream_severity="CRITICAL"
    )
    assert rpi_adj["adjusted_rpi"] > rpi_adj["base_rpi"]
    assert rpi_adj["is_downstream_at_risk"] is True
    print(f"[PASS] Test 6: Runout & RPI adjustment passed (Base RPI: {rpi_adj['base_rpi']} -> Adjusted: {rpi_adj['adjusted_rpi']})")

def test_7_alert_lifecycle_and_acknowledgement():
    """Test alert dispatch, mock SMS delivery, and operator acknowledgement."""
    new_alert = alert_dispatcher.dispatch_alert(
        location="Test Scarp Zone",
        catchment_id="MC_MEPPADI_01",
        hri=88.0,
        rpi=92.0,
        mmi=79.0,
        reason="Rapid soil pore pressure surge test"
    )
    assert new_alert["alert_id"].startswith("NIV-")
    assert new_alert["status"] == "DELIVERED"
    assert new_alert["mode"] == "AUTONOMOUS"

    ack_resp = alert_dispatcher.acknowledge_alert(
        alert_id=new_alert["alert_id"],
        operator_name="Officer V. Sharma",
        notes="Verified via live radar"
    )
    assert ack_resp["status"] == "ACKNOWLEDGED"
    assert ack_resp["acknowledged_by"] == "Officer V. Sharma"
    print(f"[PASS] Test 7: Alert lifecycle & acknowledgement passed ({new_alert['alert_id']} ACKNOWLEDGED)")

def test_8_api_v2_endpoints():
    """Test all FastAPI /api/v2 REST endpoints."""
    # 1. Maturity
    r = client.get("/api/v2/maturity")
    assert r.status_code == 200
    assert "mmi" in r.json()

    # 2. Catchments
    r = client.get("/api/v2/catchments")
    assert r.status_code == 200
    assert r.json()["count"] == 12

    # 3. Wetness
    r = client.get("/api/v2/wetness?rain_24h=150&rain_48h=280&rain_72h=400")
    assert r.status_code == 200
    assert "antecedent_precipitation_index" in r.json()

    # 4. Runout
    r = client.get("/api/v2/runout")
    assert r.status_code == 200
    assert "runout_corridors" in r.json()

    # 5. Dynamic Risk
    r = client.get("/api/v2/dynamic-risk?location=Meppadi")
    assert r.status_code == 200
    data = r.json()
    assert data["location"] == "Meppadi"
    assert "rainfall" in data
    assert "wetness" in data
    assert "model" in data
    assert "downstream" in data

    # 6. Alerts
    r = client.get("/api/v2/alerts")
    assert r.status_code == 200
    assert "alerts" in r.json()

    # 7. System Status
    r = client.get("/api/v2/system-status")
    assert r.status_code == 200
    assert r.json()["engines"]["maturity_engine"]["status"] == "ACTIVE"
    print("[PASS] Test 8: All 7 /api/v2 REST endpoints passed 100%")

if __name__ == "__main__":
    test_1_api_calculation()
    test_2_rainfall_indicators_and_wetness()
    test_3_dynamic_hri_calculation()
    test_4_mmi_calculation_and_modes()
    test_5_catchments_and_extreme_event_flag()
    test_6_downstream_runout_and_rpi()
    test_7_alert_lifecycle_and_acknowledgement()
    test_8_api_v2_endpoints()
    print("\n=======================================================")
    print("ALL 8 NIVARA 2.0 VALIDATION SUITES PASSED WITH 0 ERRORS!")
    print("=======================================================")
