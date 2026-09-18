"""
NIVARA 2.0 — Unit Tests for Emergency Escalation Contacts & Multi-Tier Flow
Tests:
1. Contact configuration & data-driven lookup (zone, priority, escalation_level, is_active).
2. Level 1 officer alert dispatch (Phone: +918072778048).
3. Escalation to Level 2 officer (Phone: +919941765204) with same Alert ID maintained.
4. Final acknowledgement and trail verification (ACKNOWLEDGED ✓).
5. FastAPI REST endpoints (/api/v2/emergency-contacts, /api/v2/alerts/{alert_id}/escalate).
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.engines.alert_dispatcher import AlertDispatcher
from backend.models.emergency_contacts import (
    load_emergency_contacts,
    get_contact_for_escalation,
    get_next_escalation_contact
)

client = TestClient(app)


def test_1_emergency_contacts_loading():
    """Verify configured DEMO contacts are loaded from JSON store."""
    contacts = load_emergency_contacts()
    assert len(contacts) >= 2

    # Check Level 1 Contact
    l1 = get_contact_for_escalation(zone="All", escalation_level=1, priority=1)
    assert l1 is not None
    assert l1["name"] == "NIVARA Demo Emergency Officer 1"
    assert l1["phone"] == "+918072778048"
    assert l1["escalation_level"] == 1
    assert l1["priority"] == 1
    assert l1["is_active"] is True

    # Check Level 2 Contact
    l2 = get_contact_for_escalation(zone="All", escalation_level=2, priority=2)
    assert l2 is not None
    assert l2["name"] == "NIVARA Demo Emergency Officer 2"
    assert l2["phone"] == "+919941765204"
    assert l2["escalation_level"] == 2
    assert l2["priority"] == 2
    assert l2["is_active"] is True


def test_2_escalation_lookup_progression():
    """Verify get_next_escalation_contact properly returns Level 2 given Level 1."""
    next_c = get_next_escalation_contact(current_level=1, current_priority=1, zone="All")
    assert next_c is not None
    assert next_c["escalation_level"] == 2
    assert next_c["name"] == "NIVARA Demo Emergency Officer 2"
    assert next_c["phone"] == "+919941765204"


def test_3_full_escalation_lifecycle_with_same_alert_id():
    """
    Test the entire escalation flow:
    CRITICAL ALERT (NIV-1025)
          ↓
    Send to Level 1 (+918072778048) -> DELIVERED
          ↓
    Not acknowledged -> ESCALATE TO LEVEL 2 (+919941765204)
          ↓
    Same Alert ID (NIV-1025) maintained throughout
          ↓
    Acknowledge -> Final status: ACKNOWLEDGED ✓
    """
    dispatcher = AlertDispatcher()

    # Step 1: Trigger Critical Alert with custom Alert ID NIV-1025
    alert = dispatcher.dispatch_alert(
        location="Meppadi (Mundakkai / Chooralmala)",
        catchment_id="MC_MEPPADI_01",
        hri=88.5,
        rpi=94.0,
        mmi=78.0,
        reason="Extreme rainfall triggering debris runout",
        zone="Meppadi",
        custom_alert_id="NIV-1025"
    )

    assert alert["alert_id"] == "NIV-1025"
    assert alert["current_level"] == 1
    assert alert["current_phone"] == "+918072778048"
    assert alert["current_officer"] == "NIVARA Demo Emergency Officer 1"
    assert alert["status"] == "DELIVERED"
    assert len(alert["escalation_trail"]) == 1
    assert alert["escalation_trail"][0]["level"] == 1
    assert alert["escalation_trail"][0]["phone"] == "+918072778048"

    # Step 2: Escalate Alert to Level 2 (e.g. timeout simulation)
    escalated = dispatcher.escalate_alert(
        alert_id="NIV-1025",
        reason="Level 1 officer did not acknowledge within 15 min window"
    )

    # Verify same Alert ID is maintained
    assert escalated["alert_id"] == "NIV-1025"
    assert escalated["current_level"] == 2
    assert escalated["current_phone"] == "+919941765204"
    assert escalated["current_officer"] == "NIVARA Demo Emergency Officer 2"
    assert escalated["status"] == "ESCALATED"

    # Verify escalation trail history
    assert len(escalated["escalation_trail"]) == 2
    assert escalated["escalation_trail"][0]["status"] == "NOT ACKNOWLEDGED"
    assert escalated["escalation_trail"][0]["phone"] == "+918072778048"
    assert escalated["escalation_trail"][1]["level"] == 2
    assert escalated["escalation_trail"][1]["phone"] == "+919941765204"
    assert escalated["escalation_trail"][1]["status"] == "DELIVERED"

    # Step 3: Acknowledge at Level 2
    ack = dispatcher.acknowledge_alert(
        alert_id="NIV-1025",
        operator_name="NIVARA Demo Emergency Officer 2",
        notes="Incident command established. Sirens activated."
    )

    assert ack["status"] == "ACKNOWLEDGED"
    assert ack["final_status"] == "ACKNOWLEDGED ✓"
    assert ack["alert_id"] == "NIV-1025"
    assert ack["acknowledged_by"] == "NIVARA Demo Emergency Officer 2"


def test_4_rest_api_emergency_contacts_and_escalation():
    """Verify REST API endpoints for contacts and alert escalation (with phone privacy enforced)."""
    # 1. GET Emergency Contacts (Verify contacts exist and phone is stripped for security)
    r = client.get("/api/v2/emergency-contacts")
    assert r.status_code == 200
    data = r.json()
    assert data["count"] >= 2
    for c in data["contacts"]:
        assert "phone" not in c  # Security check: phone must not be exposed to client
        assert "name" in c
        assert "role" in c
        assert "escalation_level" in c

    # 2. Dispatch Test Alert via API
    r = client.post("/api/v2/alerts/test", json={
        "location": "Chooralmala Valley",
        "catchment_id": "MC_MEPPADI_02",
        "hri": 85.0,
        "rpi": 90.0,
        "mmi": 78.0,
        "reason": "Test debris runout surge",
        "zone": "All",
        "custom_alert_id": "NIV-TEST-API"
    })
    assert r.status_code == 200
    alert_res = r.json()
    assert alert_res["alert_id"] == "NIV-TEST-API"
    assert alert_res["current_phone"] == "+918072778048"

    # 3. Escalate Test Alert via API
    r = client.post("/api/v2/alerts/NIV-TEST-API/escalate", json={
        "reason": "API simulation escalation to Level 2"
    })
    assert r.status_code == 200
    esc_res = r.json()
    assert esc_res["alert_id"] == "NIV-TEST-API"
    assert esc_res["current_level"] == 2
    assert esc_res["current_phone"] == "+919941765204"

    # 4. Acknowledge Test Alert via API
    r = client.post("/api/v2/alerts/NIV-TEST-API/acknowledge", json={
        "operator_name": "NIVARA Demo Emergency Officer 2",
        "notes": "Acknowledged via API test"
    })
    assert r.status_code == 200
    ack_res = r.json()
    assert ack_res["status"] == "ACKNOWLEDGED"
    assert ack_res["final_status"] == "ACKNOWLEDGED ✓"
