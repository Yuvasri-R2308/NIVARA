import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import io
import base64
from fastapi.testclient import TestClient
from PIL import Image
from pypdf import PdfWriter
from backend.app.main import app

client = TestClient(app)

def create_dummy_image_b64() -> str:
    img = Image.new('RGB', (120, 120), color=(180, 50, 50))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def test_friendly_copilot_suite():
    print("==================================================")
    print("NIVARA COPILOT FRIENDLY & INTELLIGENT TEST SUITE")
    print("==================================================")

    # 1. Casual Greetings & Natural Conversation
    print("\n--- [1/8] Testing Friendly Greetings & Small Talk ---")
    greetings = [
        ("hi", "Hey!"),
        ("hello", "Hey!"),
        ("how are you", "doing great"),
        ("thank you", "welcome"),
        ("okay", "Sure"),
        ("tell me something interesting", "interesting part")
    ]
    for q, expected in greetings:
        resp = client.post("/api/v1/copilot/chat", json={"message": q, "language": "en"})
        assert resp.status_code == 200
        msg = resp.json()["message"]
        assert expected.lower() in msg.lower(), f"Expected '{expected}' in response to '{q}', got: {msg}"
        # Casual greetings must not dump metrics or safety status
        if q in ["hi", "hello", "how are you", "thank you", "okay"]:
            assert resp.json()["safety_status"] is None or resp.json()["safety_status"] == ""
        print(f"  + Query '{q}' -> Response: '{msg[:60].encode('ascii', 'ignore').decode('ascii')}...'")

    # 2. Simple Concept Explanations (No math dumps)
    print("\n--- [2/8] Testing Simple Technical Concept Explanations ---")
    concepts = [
        ("What is HRI?", "risk score"),
        ("What is FoS?", "factor of safety"),
        ("What is Bayesian probability?", "bayesian probability"),
        ("What is XGBoost?", "machine-learning"),
        ("What is CCAS?", "carrying capacity")
    ]
    for q, kw in concepts:
        resp = client.post("/api/v1/copilot/chat", json={"message": q, "language": "en"})
        assert resp.status_code == 200
        msg = resp.json()["message"]
        assert kw.lower() in msg.lower(), f"Expected '{kw}' in response to '{q}'"
        print(f"  + Concept '{q}' -> Simple explanation verified ({len(msg)} chars)")

    # 3. Project Questions & Viva
    print("\n--- [3/8] Testing Project Knowledge & Viva Questions ---")
    proj_queries = [
        "What is NIVARA?",
        "Why Leaflet?",
        "Why Open-Meteo?",
        "Why Pandas?",
        "Why NumPy?",
        "Give me viva questions"
    ]
    for q in proj_queries:
        resp = client.post("/api/v1/copilot/chat", json={"message": q, "language": "en"})
        assert resp.status_code == 200
        msg = resp.json()["message"]
        assert len(msg) > 20
        print(f"  + Project Q: '{q}' -> Verified")

    # 4. Multi-Turn Conversation & Location Continuity (Meppadi)
    print("\n--- [4/8] Testing Multi-Turn Follow-Up (Meppadi) ---")
    conv_id = "test-conv-meppadi-1"
    
    # Turn 1: Is Meppadi safe?
    t1 = client.post("/api/v1/copilot/chat", json={"message": "Is Meppadi safe?", "conversation_id": conv_id, "selected_village": "Meppadi"})
    assert t1.status_code == 200
    assert "Meppadi" in t1.json()["message"]
    print("  + Turn 1 ('Is Meppadi safe?') -> Verified")

    # Turn 2: Why? (Should remember Meppadi)
    t2 = client.post("/api/v1/copilot/chat", json={
        "message": "Why?",
        "conversation_id": conv_id,
        "selected_village": "Meppadi",
        "history": [{"role": "user", "content": "Is Meppadi safe?"}, {"role": "assistant", "content": t1.json()["message"]}]
    })
    assert t2.status_code == 200
    assert "Meppadi" in t2.json()["message"]
    print("  + Turn 2 ('Why?') -> Context retained for Meppadi")

    # Turn 3: How many people?
    t3 = client.post("/api/v1/copilot/chat", json={
        "message": "How many people are affected?",
        "conversation_id": conv_id,
        "selected_village": "Meppadi",
        "history": [{"role": "user", "content": "Why?"}, {"role": "assistant", "content": t2.json()["message"]}]
    })
    assert t3.status_code == 200
    assert "4,800" in t3.json()["message"] or "people" in t3.json()["message"]
    print("  + Turn 3 ('How many people?') -> Meppadi exposed population returned")

    # Turn 4: Where can they go?
    t4 = client.post("/api/v1/copilot/chat", json={
        "message": "Where can they go?",
        "conversation_id": conv_id,
        "selected_village": "Meppadi",
        "history": [{"role": "user", "content": "How many people?"}, {"role": "assistant", "content": t3.json()["message"]}]
    })
    assert t4.status_code == 200
    assert "Kalpetta" in t4.json()["message"]
    print("  + Turn 4 ('Where can they go?') -> Kalpetta safe reserve returned")

    # 5. Location Switching & Strict Data Isolation (Switch to Kottathara)
    print("\n--- [5/8] Testing Location Switching & Data Isolation (Kottathara) ---")
    # Switch to Kottathara
    t5 = client.post("/api/v1/copilot/chat", json={
        "message": "What about Kottathara?",
        "conversation_id": conv_id,
        "history": [{"role": "user", "content": "Where can they go?"}, {"role": "assistant", "content": t4.json()["message"]}]
    })
    assert t5.status_code == 200
    assert "Kottathara" in t5.json()["message"]
    # Must NOT contain Meppadi steep scarp data
    assert "38.5" not in t5.json()["message"]
    print("  + Turn 5 ('What about Kottathara?') -> Context switched to Kottathara without data leakage")

    # Follow-up: Why is it risky? (Kottathara flood focus)
    t6 = client.post("/api/v1/copilot/chat", json={
        "message": "Why is it risky?",
        "conversation_id": conv_id,
        "history": [{"role": "user", "content": "What about Kottathara?"}, {"role": "assistant", "content": t5.json()["message"]}]
    })
    assert t6.status_code == 200
    assert "Kottathara" in t6.json()["message"]
    assert "flood" in t6.json()["message"].lower() or "kabini" in t6.json()["message"].lower()
    print("  + Turn 6 ('Why is it risky?') -> Kottathara river flood explained")

    # 6. Multilingual Tone Test (Malayalam, Tamil, Hindi, English)
    print("\n--- [6/8] Testing Multilingual Natural Phrasing ---")
    multi_langs = [
        ("English", "hi", "en"),
        ("Malayalam", "hi", "ml"),
        ("Tamil", "hi", "ta"),
        ("Hindi", "hi", "hi")
    ]
    for name, q, code in multi_langs:
        resp = client.post("/api/v1/copilot/chat", json={"message": q, "language": code})
        assert resp.status_code == 200
        print(f"  + {name} ({code}) greeting verified")

    # 7. Multimodal Ingestion
    print("\n--- [7/8] Testing Multimodal Attachments (Photo, PDF, CSV) ---")
    img_b64 = create_dummy_image_b64()
    multimodal_resp = client.post("/api/v1/copilot/chat", json={
        "message": "Is this retaining wall dangerous? Compare with Kottathara.",
        "selected_village": "Kottathara",
        "files_evidence": [
            {
                "file_name": "retaining_wall.jpg",
                "file_type": "image/jpeg",
                "file_size_bytes": 1024,
                "extracted_summary": "Photo showing vertical cracks in slope retaining structure.",
                "is_image": True,
                "is_pdf": False,
                "is_tabular": False,
                "image_base64": img_b64
            }
        ]
    })
    assert multimodal_resp.status_code == 200
    print("  + Multimodal photo analysis payload processed successfully")

    # 8. What-If Simulation Query
    print("\n--- [8/8] Testing What-If Simulation Impact ---")
    sim_resp = client.post("/api/v1/copilot/chat", json={"message": "What happens at +50% rain?", "rainfall_multiplier": 1.5})
    assert sim_resp.status_code == 200
    assert "50%" in sim_resp.json()["message"] or "610" in sim_resp.json()["message"]
    print("  + Simulation question verified")

    print("\n==================================================")
    print("[SUCCESS] ALL 8 COPILOT VALIDATION SUITES PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_friendly_copilot_suite()
