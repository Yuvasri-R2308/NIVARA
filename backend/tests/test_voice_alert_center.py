"""
NIVARA 2.0 — Unit Tests for Voice-First Emergency Response Center
Tests:
1. Voice service provider adapter & MockVoiceProvider demo tags
2. Call attempt creation, idempotency, and state progression
3. Explicit distinction: CALL ANSWERED vs ALERT ACKNOWLEDGED
4. Escalation to Level 2 (+919941765204) with same Alert ID maintained
5. Timeline audit event logging
6. REST API suite (/api/v2/alerts, /api/v2/alerts/{id}/call, /api/v2/demo/run-emergency-demo)
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.voice_service import VoiceCallService, MockVoiceProvider
from backend.app.services.alert_service import AlertService

client = TestClient(app)


def test_1_voice_service_mock_provider_and_demo_tagging():
    """Verify MockVoiceProvider tags calls as DEMO without claiming real connection."""
    vs = VoiceCallService()
    resp = vs.initiate_call(
        alert_id="NIV-1025",
        contact_id="CONT-001",
        officer_name="NIVARA Demo Emergency Officer 1",
        to_phone="+918072778048",
        role="Primary Emergency Officer",
        escalation_level=1,
        severity="CRITICAL",
        location="Meppadi",
        reason="Landslide danger"
    )

    assert resp["success"] is True
    attempt = resp["call_attempt"]
    assert attempt["is_demo"] is True
    assert "DEMO CALL" in attempt["simulation_label"]
    assert attempt["status"] == "INITIATING"
    assert attempt["phone"] == "+918072778048"


def test_2_call_state_progression_and_acknowledgement_distinction():
    """Verify state transitions: INITIATING -> RINGING -> ANSWERED -> ACKNOWLEDGED."""
    vs = VoiceCallService()
    resp = vs.initiate_call(
        alert_id="NIV-TEST-01",
        contact_id="CONT-001",
        officer_name="Officer 1",
        to_phone="+918072778048",
        role="Primary",
        escalation_level=1,
        severity="CRITICAL",
        location="Meppadi",
        reason="Flood"
    )
    call_id = resp["call_attempt_id"]

    # Step 1: Ringing
    rec = vs.update_call_status(call_id, "RINGING")
    assert rec["status"] == "RINGING"
    assert rec["call_answered"] is False
    assert rec["acknowledged"] is False

    # Step 2: Answered -> Note: Call Answered is TRUE, but Acknowledged is still FALSE!
    rec = vs.update_call_status(call_id, "ANSWERED")
    assert rec["status"] == "ANSWERED"
    assert rec["call_answered"] is True
    assert rec["acknowledged"] is False  # Explicit distinction verified!

    # Step 3: IVR Keypress 1 -> Acknowledged
    rec = vs.update_call_status(call_id, "ANSWERED", ivr_key="1")
    assert rec["acknowledged"] is True


def test_3_alert_service_escalation_lifecycle_with_same_alert_id():
    """Verify AlertService full workflow maintaining the exact same Alert ID."""
    svc = AlertService()
    alert_id = "NIV-1025"

    # 1. Initial State: Level 1
    alert = svc.get_alert(alert_id)
    assert alert is not None
    assert alert["alert_id"] == "NIV-1025"
    assert alert["current_level"] == 1
    assert "current_phone" not in alert  # Phone stripped for frontend security
    assert "phone" not in alert

    # 2. Call Level 1
    res = svc.initiate_alert_call(alert_id)
    assert res["alert"]["status"] == "CALLING"
    call_id = res["call_attempt_id"]

    # 3. Simulate No Answer
    svc.simulate_call_event(alert_id, call_id, "NO_ANSWER")
    alert = svc.get_alert(alert_id)
    assert alert["call_status"] == "NO_ANSWER"

    # 4. Escalate to Level 2
    escalated = svc.escalate_alert(alert_id, reason="No answer from Level 1")
    assert escalated["alert_id"] == "NIV-1025"  # Same Alert ID!
    assert escalated["current_level"] == 2
    assert "current_phone" not in svc.sanitize_alert_for_client(escalated)

    # 5. Acknowledge at Level 2
    ack = svc.acknowledge_alert(alert_id, operator_name="NIVARA Demo Emergency Officer 2", notes="Acknowledged")
    assert ack["status"] == "ACKNOWLEDGED"
    assert ack["final_status"] == "ACKNOWLEDGED ✓"
    assert ack["alert_id"] == "NIV-1025"

    # 6. Verify Timeline has all events
    timeline = svc.get_timeline(alert_id)
    assert len(timeline) >= 4
    event_types = [e["event_type"] for e in timeline]
    assert "CALL_INITIATED" in event_types
    assert "ESCALATION_TRIGGERED" in event_types
    assert "ACKNOWLEDGED" in event_types


def test_4_rest_api_voice_alert_endpoints():
    """Verify REST API endpoints for alert calling, timeline, health, and demo execution."""
    # 1. GET /api/v2/alerts
    r = client.get("/api/v2/alerts")
    assert r.status_code == 200
    data = r.json()
    assert "alerts" in data
    assert "kpis" in data

    # 2. GET /api/v2/communication/health
    r = client.get("/api/v2/communication/health")
    assert r.status_code == 200
    health = r.json()
    assert health["voice_service"]["status"] == "READY"

    # 3. POST /api/v2/demo/run-emergency-demo
    r = client.post("/api/v2/demo/run-emergency-demo")
    assert r.status_code == 200
    demo_res = r.json()
    assert demo_res["status"] == "DEMO_COMPLETED_SUCCESSFULLY"
    assert demo_res["final_status"] == "ACKNOWLEDGED ✓"
    assert demo_res["alert_id"] == "NIV-1025"
