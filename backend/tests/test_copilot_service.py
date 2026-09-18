import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import io
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.risk_context_service import risk_context_service
from backend.app.services.file_analyzer import file_analyzer
from backend.app.services.context_builder import context_builder
from backend.app.services.gemini_service import gemini_service
from backend.app.schemas.copilot_schemas import ChatRequest

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/copilot/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "version" in data
    assert "dataset_summary" in data

def test_risk_context_resolution():
    meppadi = risk_context_service.resolve_location("Meppadi")
    assert meppadi["name"].startswith("Meppadi")
    assert meppadi["risk_score"] == 84.5
    assert meppadi["slope_deg"] == 38.5

    kalpetta = risk_context_service.resolve_location("Kalpetta")
    assert kalpetta["risk_level"] == "LOW"

def test_bayesian_probability_calculation():
    res = risk_context_service.calculate_bayesian_probability("Meppadi")
    assert res["mean_probability"] >= 0.8
    assert res["lower_bound"] > 0
    assert res["upper_bound"] <= 1.0
    assert "%–" in res["credible_interval_str"]

def test_factor_of_safety():
    fos_crit = risk_context_service.calculate_factor_of_safety(slope_deg=38.5, soil_saturation_pct=98.0)
    assert fos_crit["factor_of_safety"] < 1.0
    assert fos_crit["status"] == "CRITICAL SLIP DEFICIT"

    fos_stable = risk_context_service.calculate_factor_of_safety(slope_deg=4.0, soil_saturation_pct=30.0)
    assert fos_stable["factor_of_safety"] > 1.5
    assert fos_stable["status"] == "STABLE"

def test_file_analyzer_csv():
    csv_content = b"Area,Rainfall_mm,Slope_deg,Soil_Moisture\nMeppadi,284.5,38.5,98\nKalpetta,128.0,7.2,42\n"
    item = file_analyzer.analyze_tabular_bytes("test_data.csv", csv_content, is_excel=False)
    assert item.is_tabular is True
    assert "Meppadi" in item.data_preview
    assert "Kalpetta" in item.data_preview

def test_chat_endpoint_normal_question():
    payload = {
        "message": "Is Meppadi safe right now?",
        "language": "en",
        "selected_village": "Meppadi"
    }
    response = client.post("/api/v1/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert len(data["metrics"]) > 0
    assert data["safety_status"] in ["CRITICAL", "HIGH", "MODERATE", "LOW"]

def test_chat_endpoint_multilingual():
    # Test Malayalam
    ml_payload = {
        "message": "മേപ്പാടി സുരക്ഷിതമായ പ്രദേശമാണോ?",
        "language": "ml",
        "selected_village": "Meppadi"
    }
    ml_resp = client.post("/api/v1/copilot/chat", json=ml_payload)
    assert ml_resp.status_code == 200
    assert len(ml_resp.json()["message"]) > 0

    # Test Tamil
    ta_payload = {
        "message": "மேப்பாடி பாதுகாப்பான பகுதிதானா?",
        "language": "ta",
        "selected_village": "Meppadi"
    }
    ta_resp = client.post("/api/v1/copilot/chat", json=ta_payload)
    assert ta_resp.status_code == 200
    assert len(ta_resp.json()["message"]) > 0

    # Test Hindi
    hi_payload = {
        "message": "क्या मेप्पाडी सुरक्षित क्षेत्र है?",
        "language": "hi",
        "selected_village": "Meppadi"
    }
    hi_resp = client.post("/api/v1/copilot/chat", json=hi_payload)
    assert hi_resp.status_code == 200
    assert len(hi_resp.json()["message"]) > 0

if __name__ == "__main__":
    test_health_endpoint()
    test_risk_context_resolution()
    test_bayesian_probability_calculation()
    test_factor_of_safety()
    test_file_analyzer_csv()
    test_chat_endpoint_normal_question()
    test_chat_endpoint_multilingual()
    print("[SUCCESS] ALL BACKEND COPILOT TESTS PASSED SUCCESSFULLY!")
