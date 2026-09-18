"""
NIVARA 2.0 — Module 5: Automated Alert Dispatcher, Acknowledgement & Escalation Engine
Manages emergency alert creation, lifecycle state transitions (SENT -> DELIVERED -> NOT ACKNOWLEDGED -> ESCALATED -> ACKNOWLEDGED),
data-driven emergency contact selection, and hierarchical multi-tier escalation timeouts.
Maintains the exact same Alert ID (e.g. NIV-1025) throughout all escalation tiers.
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta
from ..config.settings import settings
from ..notifications.mock_provider import MockSMSProvider
from backend.models.maturity_engine import get_maturity_mode, gate_alert_dispatch
from backend.models.emergency_contacts import (
    load_emergency_contacts,
    get_contact_for_escalation,
    get_next_escalation_contact
)

logger = logging.getLogger("nivara.alerts")


class AlertDispatcher:
    """
    Handles emergency alert triggers, lifecycle tracking, and escalation.
    Operates in ALERT_MODE = 'DEMO' to prevent unauthorized real messaging during testing.
    Selects contacts dynamically from emergency_contacts store based on zone, priority, escalation_level, and active status.
    """

    def __init__(self):
        self.sms_provider = MockSMSProvider()
        self.alerts_store: Dict[str, Dict[str, Any]] = {}
        self._seed_demo_alerts()

    def _seed_demo_alerts(self):
        """Pre-seeds initial demo alerts with Level 1 / Level 2 escalation records."""
        now = datetime.utcnow()

        # Alert NIV-1025: Active Level 1 -> Ready for Level 2 Escalation Demo
        contact_l1 = get_contact_for_escalation(zone="All", escalation_level=1, priority=1)
        l1_name = contact_l1.get("name", "NIVARA Demo Emergency Officer 1") if contact_l1 else "NIVARA Demo Emergency Officer 1"
        l1_phone = contact_l1.get("phone", "+918072778048") if contact_l1 else "+918072778048"
        l1_role = contact_l1.get("role", "Primary Emergency Officer") if contact_l1 else "Primary Emergency Officer"

        demo_1 = {
            "alert_id": "NIV-1025",
            "created_at": (now - timedelta(minutes=7)).isoformat() + "Z",
            "location": "Meppadi (Mundakkai / Chooralmala)",
            "catchment_id": "MC_MEPPADI_01",
            "zone": "Meppadi",
            "hri": 84.5,
            "rpi": 91.0,
            "mmi": 78.0,
            "mode": "AUTONOMOUS",
            "severity": "CRITICAL",
            "reason": "Extreme 48h rainfall (372mm) and steep terrain gradient (38.5°) triggering debris runout corridor.",
            "current_level": 1,
            "current_priority": 1,
            "current_officer": l1_name,
            "current_phone": l1_phone,
            "current_role": l1_role,
            "recipient": f"{l1_name} ({l1_phone})",
            "status": "DELIVERED",
            "final_status": "PENDING_ACKNOWLEDGEMENT",
            "delivered_at": (now - timedelta(minutes=6)).isoformat() + "Z",
            "acknowledged_at": None,
            "acknowledged_by": None,
            "escalation_level": f"Level 1 — {l1_role}",
            "timeout_minutes": settings.ALERT_ACK_TIMEOUT_MINUTES,
            "escalation_trail": [
                {
                    "level": 1,
                    "priority": 1,
                    "officer_name": l1_name,
                    "role": l1_role,
                    "phone": l1_phone,
                    "status": "DELIVERED",
                    "sent_at": (now - timedelta(minutes=7)).isoformat() + "Z",
                    "delivered_at": (now - timedelta(minutes=6)).isoformat() + "Z",
                    "acknowledged_at": None,
                    "delivery_receipt": "MOCK-DELIV-1025-L1"
                }
            ],
            "dispatch_metadata": {
                "provider": "MOCK_SMS_GATEWAY",
                "alert_id": "NIV-1025",
                "recipient": f"{l1_name} ({l1_phone})",
                "status": "DELIVERED",
                "dispatched_at": (now - timedelta(minutes=7)).isoformat() + "Z",
                "delivery_receipt": "MOCK-DELIV-1025-L1",
                "severity": "CRITICAL",
                "simulated": True
            }
        }

        # Alert NIV-1024: Previously Escalated & Acknowledged by Level 2 Officer
        contact_l2 = get_contact_for_escalation(zone="All", escalation_level=2, priority=2)
        l2_name = contact_l2.get("name", "NIVARA Demo Emergency Officer 2") if contact_l2 else "NIVARA Demo Emergency Officer 2"
        l2_phone = contact_l2.get("phone", "+919941765204") if contact_l2 else "+919941765204"
        l2_role = contact_l2.get("role", "Secondary Emergency Officer") if contact_l2 else "Secondary Emergency Officer"

        demo_2 = {
            "alert_id": "NIV-1024",
            "created_at": (now - timedelta(minutes=35)).isoformat() + "Z",
            "location": "Achooranam Foothills",
            "catchment_id": "MC_ACHOOR_01",
            "zone": "Achooranam",
            "hri": 58.0,
            "rpi": 72.0,
            "mmi": 66.0,
            "mode": "ASSISTED",
            "severity": "HIGH",
            "reason": "Elevated antecedent moisture (API 182mm) and valley runout inundation risk.",
            "current_level": 2,
            "current_priority": 2,
            "current_officer": l2_name,
            "current_phone": l2_phone,
            "current_role": l2_role,
            "recipient": f"{l2_name} ({l2_phone})",
            "status": "ACKNOWLEDGED",
            "final_status": "ACKNOWLEDGED ✓",
            "delivered_at": (now - timedelta(minutes=18)).isoformat() + "Z",
            "acknowledged_at": (now - timedelta(minutes=12)).isoformat() + "Z",
            "acknowledged_by": f"{l2_name} (Level 2)",
            "operator_notes": "Ground verification complete. Evacuation sirens armed in Sector B.",
            "escalation_level": f"Level 2 — {l2_role}",
            "timeout_minutes": settings.ALERT_ACK_TIMEOUT_MINUTES,
            "escalation_trail": [
                {
                    "level": 1,
                    "priority": 1,
                    "officer_name": l1_name,
                    "role": l1_role,
                    "phone": l1_phone,
                    "status": "NOT ACKNOWLEDGED",
                    "sent_at": (now - timedelta(minutes=35)).isoformat() + "Z",
                    "delivered_at": (now - timedelta(minutes=34)).isoformat() + "Z",
                    "acknowledged_at": None,
                    "delivery_receipt": "MOCK-DELIV-1024-L1",
                    "notes": "15-minute acknowledgement window expired without operator confirmation."
                },
                {
                    "level": 2,
                    "priority": 2,
                    "officer_name": l2_name,
                    "role": l2_role,
                    "phone": l2_phone,
                    "status": "ACKNOWLEDGED",
                    "sent_at": (now - timedelta(minutes=19)).isoformat() + "Z",
                    "delivered_at": (now - timedelta(minutes=18)).isoformat() + "Z",
                    "acknowledged_at": (now - timedelta(minutes=12)).isoformat() + "Z",
                    "delivery_receipt": "MOCK-DELIV-1024-L2"
                }
            ],
            "dispatch_metadata": {
                "provider": "MOCK_SMS_GATEWAY",
                "alert_id": "NIV-1024",
                "recipient": f"{l2_name} ({l2_phone})",
                "status": "DELIVERED",
                "dispatched_at": (now - timedelta(minutes=19)).isoformat() + "Z",
                "delivery_receipt": "MOCK-DELIV-1024-L2",
                "severity": "HIGH",
                "simulated": True
            }
        }

        self.alerts_store[demo_1["alert_id"]] = demo_1
        self.alerts_store[demo_2["alert_id"]] = demo_2

    def get_all_alerts(self) -> List[Dict[str, Any]]:
        """Returns all alerts sorted chronologically with live escalation status check."""
        self._check_escalations()
        return list(self.alerts_store.values())

    def get_alert_by_id(self, alert_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves an alert by its unique Alert ID."""
        self._check_escalations()
        return self.alerts_store.get(alert_id)

    def _check_escalations(self):
        """
        Checks if unacknowledged alerts have exceeded the timeout window and escalates to Level 2 / Level 3.
        Maintains the same Alert ID throughout escalation.
        """
        now = datetime.utcnow()
        for alert_id, alert in list(self.alerts_store.items()):
            if alert["status"] in ["SENT", "DELIVERED"] and not alert.get("acknowledged_at"):
                try:
                    # Check timestamp of current escalation step
                    current_trail = alert.get("escalation_trail", [])
                    if current_trail:
                        last_step = current_trail[-1]
                        step_time_str = last_step.get("sent_at") or alert.get("created_at")
                    else:
                        step_time_str = alert.get("created_at")

                    step_time = datetime.fromisoformat(step_time_str.replace("Z", ""))
                    elapsed_min = (now - step_time).total_seconds() / 60.0

                    if elapsed_min >= settings.ALERT_ACK_TIMEOUT_MINUTES:
                        # Auto-escalate to next level
                        self.escalate_alert(
                            alert_id=alert_id,
                            reason=f"Acknowledgement window ({settings.ALERT_ACK_TIMEOUT_MINUTES} min) exceeded by Level {alert.get('current_level', 1)} officer."
                        )
                except Exception as e:
                    logger.warning("Error checking escalation for %s: %s", alert_id, e)

    def dispatch_alert(
        self,
        location: str,
        catchment_id: str,
        hri: float,
        rpi: float,
        mmi: float,
        reason: str,
        zone: str = "All",
        custom_alert_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Dispatches an initial emergency alert starting at LEVEL 1.
        Selects Level 1 Primary Officer dynamically from emergency_contacts store.
        """
        now = datetime.utcnow()
        if custom_alert_id:
            alert_id = custom_alert_id
        else:
            alert_count = len(self.alerts_store) + 1025
            alert_id = f"NIV-{alert_count}"

        mode = get_maturity_mode(mmi)
        gate = gate_alert_dispatch(
            location=location,
            raw_hazard_score=hri,
            maturity_mode=mode,
            alert_payload={"alert_id": alert_id, "rpi": rpi, "reason": reason}
        )
        requires_manual_review = bool(gate["requires_manual_review"])
        can_send = bool(gate["dispatched"])
        if mode == "shadow":
            status = "BLOCKED_SHADOW_MODE"
        else:
            status = "SENT"

        severity = "CRITICAL" if rpi >= 75 or hri >= 75 else "HIGH" if rpi >= 50 else "MODERATE"

        # Select Level 1 Contact from store (no hard-coded numbers)
        contact_l1 = get_contact_for_escalation(zone=zone, escalation_level=1, priority=1)
        if not contact_l1:
            contact_l1 = get_contact_for_escalation(zone="All", escalation_level=1)

        l1_name = contact_l1.get("name", "Primary Emergency Officer") if contact_l1 else "Primary Emergency Officer"
        l1_phone = contact_l1.get("phone", "+918072778048") if contact_l1 else "+918072778048"
        l1_role = contact_l1.get("role", "Primary Emergency Officer") if contact_l1 else "Primary Emergency Officer"
        recipient_str = f"{l1_name} ({l1_phone})"

        if can_send:
            provider_resp = self.sms_provider.send_alert(
                recipient=recipient_str,
                message=f"[NIVARA 2.0 CRITICAL ALERT {alert_id}] {severity} in {location}. HRI: {hri}, RPI: {rpi}. {reason}. Acknowledge via SDMA Command.",
                alert_id=alert_id,
                severity=severity
            )
            delivered_time = (now + timedelta(seconds=2)).isoformat() + "Z"
            active_status = "DELIVERED"
        else:
            provider_resp = {
                "success": False,
                "status": "BLOCKED_SHADOW_MODE",
                "message": "Automated dispatch blocked in shadow mode."
            }
            delivered_time = None
            active_status = status

        trail_entry = {
            "level": 1,
            "priority": contact_l1.get("priority", 1) if contact_l1 else 1,
            "officer_name": l1_name,
            "role": l1_role,
            "phone": l1_phone,
            "status": active_status,
            "sent_at": now.isoformat() + "Z",
            "delivered_at": delivered_time,
            "acknowledged_at": None,
            "delivery_receipt": provider_resp.get("delivery_receipt", f"MOCK-DELIV-{alert_id}-L1")
        }

        alert_record = {
            "alert_id": alert_id,
            "created_at": now.isoformat() + "Z",
            "location": location,
            "catchment_id": catchment_id,
            "zone": zone,
            "hri": round(hri, 1),
            "rpi": round(rpi, 1),
            "mmi": round(mmi, 1),
            "maturity_index": round(mmi, 1),
            "maturity_mode": mode,
            "requires_manual_review": requires_manual_review,
            "mode": mode.upper(),
            "severity": severity,
            "reason": reason,
            "current_level": 1,
            "current_priority": 1,
            "current_officer": l1_name,
            "current_phone": l1_phone,
            "current_role": l1_role,
            "recipient": recipient_str,
            "status": active_status,
            "final_status": "PENDING_ACKNOWLEDGEMENT",
            "delivered_at": delivered_time,
            "acknowledged_at": None,
            "acknowledged_by": None,
            "escalation_level": f"Level 1 — {l1_role}",
            "timeout_minutes": settings.ALERT_ACK_TIMEOUT_MINUTES,
            "escalation_trail": [trail_entry],
            "dispatch_metadata": provider_resp
        }

        self.alerts_store[alert_id] = alert_record
        logger.info("[ALERT DISPATCHED] Alert %s sent to Level 1: %s (%s)", alert_id, l1_name, l1_phone)
        return alert_record

    def escalate_alert(
        self,
        alert_id: str,
        reason: str = "Level 1 acknowledgement timeout exceeded"
    ) -> Dict[str, Any]:
        """
        Escalates an unacknowledged alert to LEVEL 2 (or next available level).
        Maintains the EXACT same Alert ID (e.g. NIV-1025).
        Selects Level 2 Secondary Officer from emergency_contacts store.
        """
        if alert_id not in self.alerts_store:
            raise KeyError(f"Alert ID {alert_id} not found.")

        alert = self.alerts_store[alert_id]

        if alert.get("status") == "ACKNOWLEDGED":
            logger.info("[ESCALATION SKIPPED] Alert %s already acknowledged.", alert_id)
            return alert

        now = datetime.utcnow()
        current_level = alert.get("current_level", 1)
        current_priority = alert.get("current_priority", 1)
        zone = alert.get("zone", "All")

        # Mark current active step in escalation trail as NOT ACKNOWLEDGED
        trail = alert.get("escalation_trail", [])
        if trail:
            trail[-1]["status"] = "NOT ACKNOWLEDGED"
            trail[-1]["escalated_at"] = now.isoformat() + "Z"
            trail[-1]["notes"] = reason

        # Find next escalation contact from database
        next_contact = get_next_escalation_contact(
            current_level=current_level,
            current_priority=current_priority,
            zone=zone
        )

        if not next_contact:
            # Fallback to general Level 2 if level was 1
            if current_level == 1:
                next_contact = get_contact_for_escalation(zone="All", escalation_level=2)

        if not next_contact:
            logger.warning("[ESCALATION LIMIT] No further emergency contacts available for %s.", alert_id)
            alert["status"] = "ESCALATED"
            alert["escalation_level"] = f"Level {current_level} (Max Escalation Reached)"
            return alert

        next_level = next_contact.get("escalation_level", current_level + 1)
        next_priority = next_contact.get("priority", 2)
        next_name = next_contact.get("name", "Secondary Emergency Officer")
        next_phone = next_contact.get("phone", "+919941765204")
        next_role = next_contact.get("role", "Secondary Emergency Officer")
        recipient_str = f"{next_name} ({next_phone})"

        # Dispatch escalation alert via mock SMS provider
        provider_resp = self.sms_provider.send_alert(
            recipient=recipient_str,
            message=f"[NIVARA 2.0 ESCALATED ALERT {alert_id}] {alert['severity']} in {alert['location']}. Prior tier timed out. HRI: {alert['hri']}, RPI: {alert['rpi']}. Immediate action required.",
            alert_id=alert_id,
            severity=alert["severity"]
        )

        delivered_time = (now + timedelta(seconds=2)).isoformat() + "Z"

        new_trail_entry = {
            "level": next_level,
            "priority": next_priority,
            "officer_name": next_name,
            "role": next_role,
            "phone": next_phone,
            "status": "DELIVERED",
            "sent_at": now.isoformat() + "Z",
            "delivered_at": delivered_time,
            "acknowledged_at": None,
            "delivery_receipt": provider_resp.get("delivery_receipt", f"MOCK-DELIV-{alert_id}-L{next_level}")
        }

        trail.append(new_trail_entry)

        # Update alert state (SAME Alert ID maintained)
        alert["current_level"] = next_level
        alert["current_priority"] = next_priority
        alert["current_officer"] = next_name
        alert["current_phone"] = next_phone
        alert["current_role"] = next_role
        alert["recipient"] = recipient_str
        alert["status"] = "ESCALATED"
        alert["escalation_level"] = f"Level {next_level} — {next_role}"
        alert["delivered_at"] = delivered_time
        alert["escalation_trail"] = trail
        alert["dispatch_metadata"] = provider_resp

        logger.info(
            "[ALERT ESCALATED] Alert %s escalated to Level %d: %s (%s)",
            alert_id, next_level, next_name, next_phone
        )
        return alert

    def acknowledge_alert(
        self,
        alert_id: str,
        operator_name: str = "Duty Officer",
        notes: str = "Verified via telemetry and ground sensor confirmation"
    ) -> Dict[str, Any]:
        """
        Marks an alert as acknowledged by an authorized operator.
        Stops further escalation and records final status: ACKNOWLEDGED ✓.
        """
        if alert_id not in self.alerts_store:
            raise KeyError(f"Alert ID {alert_id} not found.")

        now = datetime.utcnow()
        alert = self.alerts_store[alert_id]
        
        # Mark current level in trail as ACKNOWLEDGED
        trail = alert.get("escalation_trail", [])
        if trail:
            trail[-1]["status"] = "ACKNOWLEDGED"
            trail[-1]["acknowledged_at"] = now.isoformat() + "Z"
            trail[-1]["acknowledged_by"] = operator_name

        alert["status"] = "ACKNOWLEDGED"
        alert["final_status"] = "ACKNOWLEDGED ✓"
        alert["acknowledged_at"] = now.isoformat() + "Z"
        alert["acknowledged_by"] = operator_name
        alert["operator_notes"] = notes

        logger.info("[ALERT ACKNOWLEDGED] Alert %s acknowledged by %s", alert_id, operator_name)

        return {
            "success": True,
            "alert_id": alert_id,
            "status": "ACKNOWLEDGED",
            "final_status": "ACKNOWLEDGED ✓",
            "acknowledged_at": alert["acknowledged_at"],
            "acknowledged_by": operator_name,
            "escalated_level": alert.get("escalation_level"),
            "current_officer": alert.get("current_officer"),
            "current_phone": alert.get("current_phone"),
            "escalation_trail": alert.get("escalation_trail", [])
        }


# Singleton alert dispatcher engine instance
alert_dispatcher = AlertDispatcher()
