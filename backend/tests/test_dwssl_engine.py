"""
NIVARA 2.0 — DWSSL Unit and Integration Test Suite
Verifies all 17 computational conditions for Dynamic Wetness & Slope-Stability Layer.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.dwssl_service import DWSSLService

client = TestClient(app)

@pytest.fixture
def dwssl():
    return DWSSLService()

def test_1_no_rainfall(dwssl):
    """Test 1: When rainfall is zero, API and dynamic contributions should be zero."""
    loc = {
        "location": "ZeroRainZone",
        "slope_deg": 25.0,
        "static_hri": 50.0,
        "base_24h_rain": 0.0,
        "base_48h_rain": 0.0,
        "base_72h_rain": 0.0
    }
    res = dwssl.calculate_location_dwssl(loc, simulated_rain_multiplier=0.0)
    assert res["rainfall_24h"] == 0.0
    assert res["rainfall_48h"] == 0.0
    assert res["rainfall_72h"] == 0.0
    assert res["api"] == 0.0
    assert res["normalized_api"] == 0.0
    assert res["wetness_state"] == "LOW"

def test_2_normal_rainfall(dwssl):
    """Test 2: Normal baseline rainfall produces moderate values."""
    loc = {
        "location": "NormalZone",
        "slope_deg": 20.0,
        "static_hri": 45.0,
        "base_24h_rain": 25.0,
        "base_48h_rain": 45.0,
        "base_72h_rain": 60.0
    }
    res = dwssl.calculate_location_dwssl(loc, simulated_rain_multiplier=1.0)
    assert res["rainfall_24h"] == 25.0
    assert res["dynamic_hri"] >= res["static_hri"]
    assert res["dwssl_status"] in ["NORMAL", "WATCH"]

def test_3_heavy_24h_rainfall(dwssl):
    """Test 3: Extreme 24h rainfall surges API and triggers warning."""
    loc = {
        "location": "Surge24h",
        "slope_deg": 35.0,
        "static_hri": 60.0,
        "base_24h_rain": 200.0,
        "base_48h_rain": 220.0,
        "base_72h_rain": 240.0
    }
    res = dwssl.calculate_location_dwssl(loc)
    assert res["rainfall_24h"] == 200.0
    assert res["rainfall_trigger"] in ["WARNING", "CRITICAL"]
    assert res["dynamic_hri"] > res["static_hri"]

def test_4_heavy_48h_rainfall(dwssl):
    """Test 4: Heavy 48h rainfall (>300mm) sets wetness state to VERY HIGH."""
    loc = {
        "location": "Heavy48h",
        "slope_deg": 30.0,
        "static_hri": 65.0,
        "base_24h_rain": 140.0,
        "base_48h_rain": 320.0,
        "base_72h_rain": 380.0
    }
    res = dwssl.calculate_location_dwssl(loc)
    assert res["wetness_state"] in ["HIGH", "VERY HIGH"]
    assert res["dynamic_change"] > 0

def test_5_heavy_72h_rainfall(dwssl):
    """Test 5: Heavy 72h rainfall (>400mm) reaches CRITICAL threshold."""
    loc = {
        "location": "Extreme72h",
        "slope_deg": 40.0,
        "static_hri": 70.0,
        "base_24h_rain": 160.0,
        "base_48h_rain": 340.0,
        "base_72h_rain": 460.0
    }
    res = dwssl.calculate_location_dwssl(loc)
    assert res["rainfall_trigger"] == "CRITICAL"
    assert res["dwssl_status"] == "CRITICAL"

def test_6_continuous_rainfall_accumulates_api(dwssl):
    """Test 6: Multi-day continuous rainfall leads to high cumulative API."""
    series = [50.0, 60.0, 70.0, 80.0, 100.0]
    api = dwssl.compute_api(series, k=0.85)
    # API_t = 100 + 0.85*80 + 0.85^2*70 + ...
    assert api > 100.0

def test_7_8_rainfall_stopping_and_api_decay(dwssl):
    """Test 7 & 8: When rainfall stops, API gradually decays according to k."""
    series_rain = [50.0, 50.0, 50.0, 50.0, 50.0]
    api_raining = dwssl.compute_api(series_rain, k=0.85)

    # Next day zero rain -> API decay: API_next = 0 + 0.85 * api_raining
    series_dry = [50.0, 50.0, 50.0, 50.0, 0.0]
    api_decayed = dwssl.compute_api(series_dry, k=0.85)
    assert api_decayed < api_raining

def test_9_10_high_vs_low_slope_pore_pressure(dwssl):
    """Test 9 & 10: Steeper slopes yield higher pore-pressure proxy values."""
    ru_steep = dwssl.estimate_pore_pressure_ratio(slope_deg=45.0, soil_depth_m=1.0, wetness_index=0.7, soil_moisture=0.4)
    ru_gentle = dwssl.estimate_pore_pressure_ratio(slope_deg=10.0, soil_depth_m=1.0, wetness_index=0.7, soil_moisture=0.4)
    assert ru_steep > ru_gentle

def test_11_soil_depth_impact(dwssl):
    """Test 11: Shallow regolith (e.g. 0.5m) saturates faster than deep soil (3.0m)."""
    ru_shallow = dwssl.estimate_pore_pressure_ratio(slope_deg=35.0, soil_depth_m=0.5, wetness_index=0.7, soil_moisture=0.4)
    ru_deep = dwssl.estimate_pore_pressure_ratio(slope_deg=35.0, soil_depth_m=3.0, wetness_index=0.7, soil_moisture=0.4)
    assert ru_shallow > ru_deep

def test_12_13_missing_soil_data_fallback(dwssl):
    """Test 12 & 13: Missing or None soil moisture/depth safely fallbacks without crashing."""
    ru = dwssl.estimate_pore_pressure_ratio(slope_deg=30.0, soil_depth_m=None, wetness_index=0.5, soil_moisture=None)
    assert 0.0 <= ru <= 1.0

def test_14_dynamic_hri_formula_and_range(dwssl):
    """Test 14: Dynamic HRI is bounded in 0-100 and static HRI is preserved."""
    loc = {
        "location": "FormulaCheck",
        "slope_deg": 35.0,
        "static_hri": 75.0,
        "base_24h_rain": 250.0,
        "base_48h_rain": 450.0,
        "base_72h_rain": 600.0
    }
    res = dwssl.calculate_location_dwssl(loc)
    assert res["static_hri"] == 75.0
    assert 75.0 <= res["dynamic_hri"] <= 100.0
    assert res["dynamic_change"] == round(res["dynamic_hri"] - res["static_hri"], 1)

def test_15_what_if_simulation_multiplier(dwssl):
    """Test 15: Simulating 1.5x rainfall increases Dynamic HRI and API."""
    loc = dwssl.baseline_locations[0]
    base_res = dwssl.calculate_location_dwssl(loc, simulated_rain_multiplier=1.0)
    sim_res = dwssl.calculate_location_dwssl(loc, simulated_rain_multiplier=1.5)
    assert sim_res["rainfall_24h"] > base_res["rainfall_24h"]
    assert sim_res["api"] > base_res["api"]
    assert sim_res["dynamic_hri"] >= base_res["dynamic_hri"]
    assert sim_res["is_simulation"] is True

def test_16_timeline_generation(dwssl):
    """Test 16: Timeline returns hourly progression with positive projection decay."""
    tl = dwssl.get_timeline(location_name="Meppadi", decay_k=0.85)
    assert "timeline" in tl
    assert len(tl["timeline"]) > 10
    # Check projection points exist
    proj_points = [p for p in tl["timeline"] if p["is_projection"]]
    assert len(proj_points) > 0

def test_17_rest_api_dwssl_endpoints():
    """Test 17: REST API endpoints return 200 with complete structured JSON."""
    # 1. GET /api/v2/dwssl/summary
    r = client.get("/api/v2/dwssl/summary")
    assert r.status_code == 200
    data = r.json()
    assert "system_status" in data
    assert "kpis" in data
    assert "locations" in data

    # 2. GET /api/v2/dwssl/locations
    r = client.get("/api/v2/dwssl/locations")
    assert r.status_code == 200
    assert r.json()["count"] >= 10

    # 3. GET /api/v2/dwssl/location/Meppadi
    r = client.get("/api/v2/dwssl/location/Meppadi")
    assert r.status_code == 200
    loc = r.json()
    assert loc["location"] == "Meppadi"
    assert "datasets_attached" in loc
    assert "smap" in loc["datasets_attached"]

    # 4. GET /api/v2/dwssl/timeline
    r = client.get("/api/v2/dwssl/timeline?location=Meppadi")
    assert r.status_code == 200
    assert "timeline" in r.json()
