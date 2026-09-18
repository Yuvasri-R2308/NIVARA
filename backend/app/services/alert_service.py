"""
NIVARA 2.0 — Emergency Alert & Response Management Service
Handles:
- Alert lifecycle: CREATED -> CALL_INITIATED -> CALL_CONNECTED -> ACKNOWLEDGED / ESCALATED -> RESOLVED
- Voice call dispatch orchestration via VoiceCallService
- Append-only event history (AlertEvent)
- Idempotency & duplicate alert prevention
- Consistent Alert ID continuity (e.g. NIV-1025)
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timezone, timedelta
import uuid

from backend.models.emergency_contacts import (
    load_emergency_contacts,
    get_contact_for_escalation,
    get_next_escalation_contact
)
from .voice_service import voice_service

logger = logging.getLogger("nivara.alert_service")


class AlertService:
    """
    Core Emergency Alert & Response Center Service.
    """

    def __init__(self):
        self.alerts_store: Dict[str, Dict[str, Any]] = {}
        self.events_store: Dict[str, List[Dict[str, Any]]] = {}  # alert_id -> list of events
        self._seed_initial_alerts()

    def _add_event(
        self,
        alert_id: str,
        event_type: str,
        title: str,
        description: str,
        actor: str = "SYSTEM",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Appends an immutable event to the alert's audit trail."""
        now_iso = datetime.now(timezone.utc).isoformat()
        event = {
            "event_id": f"EVT-{uuid.uuid4().hex[:8].upper()}",
            "alert_id": alert_id,
            "event_type": event_type,
            "title": title,
            "description": description,
            "actor": actor,
            "metadata": metadata or {},
            "timestamp": now_iso
        }
        if alert_id not in self.events_store:
            self.events_store[alert_id] = []
        self.events_store[alert_id].append(event)
        return event

    def _seed_initial_alerts(self):
        """Pre-seeds initial demo alerts for demonstration."""
        now = datetime.now(timezone.utc)

        # 1. NIV-1025: Active Critical Alert in Wayanad (Call required / In-Progress)
        contact_l1 = get_contact_for_escalation(zone="All", escalation_level=1, priority=1)
        l1_name = contact_l1.get("name", "NIVARA Demo Emergency Officer 1") if contact_l1 else "NIVARA Demo Emergency Officer 1"
        l1_phone = contact_l1.get("phone", "+919941765204") if contact_l1 else "+919941765204"
        l1_role = contact_l1.get("role", "Primary Emergency Officer (First Responder)") if contact_l1 else "Primary Emergency Officer (First Responder)"

        alert_1025 = {
            "alert_id": "NIV-1025",
            "created_at": (now - timedelta(minutes=8)).isoformat(),
            "location": "Meppadi (Mundakkai / Chooralmala)",
            "zone": "Meppadi",
            "catchment_id": "MC_MEPPADI_01",
            "coordinates": [11.5512, 76.1264],
            "hri": 88.0,
            "rpi": 91.0,
            "mmi": 78.0,
            "mode": "AUTONOMOUS",
            "severity": "CRITICAL",
            "hazard": "LANDSLIDE",
            "rainfall_24h_mm": 182.0,
            "reason": "Extreme 48h rainfall (372mm) and steep terrain gradient (38.5°) triggering debris runout corridor.",
            "current_level": 1,
            "current_priority": 1,
            "current_officer": l1_name,
            "current_phone": l1_phone,
            "current_role": l1_role,
            "recipient": f"{l1_name} ({l1_phone})",
            "status": "CALL_REQUIRED",
            "call_status": "READY_TO_CALL",
            "final_status": "CALL REQUIRED",
            "is_call_active": False,
            "call_answered": False,
            "acknowledged": False,
            "acknowledged_at": None,
            "acknowledged_by": None,
            "escalation_level": f"Level 1 — {l1_role}",
            "escalated_count": 0,
            "timeout_minutes": 15,
            "resolved": False,
            "resolved_at": None,
            "resolved_by": None
        }

        self.alerts_store["NIV-1025"] = alert_1025
        self._add_event(
            "NIV-1025",
            "ALERT_CREATED",
            "🔴 CRITICAL ALERT CREATED",
            "Autonomous disaster intelligence triggered critical threshold (RPI: 91, HRI: 88).",
            "NIVARA Risk Engine",
            {"hri": 88.0, "rpi": 91.0, "location": "Meppadi"}
        )

        # 2. NIV-1024: Acknowledged by Level 2 Secondary Officer
        contact_l2 = get_contact_for_escalation(zone="All", escalation_level=2, priority=2)
        l2_name = contact_l2.get("name", "NIVARA Demo Emergency Officer 2") if contact_l2 else "NIVARA Demo Emergency Officer 2"
        l2_phone = contact_l2.get("phone", "+918072778048") if contact_l2 else "+918072778048"
        l2_role = contact_l2.get("role", "Secondary Emergency Officer (Escalation on Call)") if contact_l2 else "Secondary Emergency Officer (Escalation on Call)"

        alert_1024 = {
            "alert_id": "NIV-1024",
            "created_at": (now - timedelta(minutes=42)).isoformat(),
            "location": "Achooranam Foothills",
            "zone": "Achooranam",
            "catchment_id": "MC_ACHOOR_01",
            "coordinates": [11.5950, 76.0230],
            "hri": 58.0,
            "rpi": 76.0,
            "mmi": 66.0,
            "mode": "ASSISTED",
            "severity": "HIGH",
            "hazard": "VALLEY_FLOOD",
            "rainfall_24h_mm": 114.0,
            "reason": "Elevated antecedent moisture (API 182mm) and valley runout inundation risk.",
            "current_level": 2,
            "current_priority": 2,
            "current_officer": l2_name,
            "current_phone": l2_phone,
            "current_role": l2_role,
            "recipient": f"{l2_name} ({l2_phone})",
            "status": "ACKNOWLEDGED",
            "call_status": "ANSWERED",
            "final_status": "ACKNOWLEDGED ✓",
            "is_call_active": False,
            "call_answered": True,
            "acknowledged": True,
            "acknowledged_at": (now - timedelta(minutes=14)).isoformat(),
            "acknowledged_by": f"{l2_name} (Level 2)",
            "operator_notes": "Ground verification complete. Evacuation siren armed in Sector B.",
            "escalation_level": f"Level 2 — {l2_role}",
            "escalated_count": 1,
            "timeout_minutes": 15,
            "resolved": False,
            "resolved_at": None,
            "resolved_by": None
        }

        self.alerts_store["NIV-1024"] = alert_1024
        self._add_event(
            "NIV-1024", "ALERT_CREATED", "🟠 HIGH SEVERITY ALERT CREATED",
            "Assisted mode risk prediction triggered for Achooranam valley inundation.",
            "NIVARA Risk Engine"
        )
        self._add_event(
            "NIV-1024", "CALL_INITIATED", "📞 CALL INITIATED — LEVEL 1",
            f"Voice call dispatched to {l1_name} ({l1_phone}).",
            "Voice Call Service"
        )
        self._add_event(
            "NIV-1024", "CALL_NO_ANSWER", "📞 LEVEL 1 NO ANSWER",
            "Primary officer did not answer voice call after 45s ringing.",
            "Voice Provider"
        )
        self._add_event(
            "NIV-1024", "ESCALATION_TRIGGERED", "⚠️ ESCALATION TRIGGERED — LEVEL 2",
            f"Automatic escalation transferred incident to Secondary Officer {l2_name} ({l2_phone}).",
            "Escalation Engine"
        )
        self._add_event(
            "NIV-1024", "CALL_ANSWERED", "✓ LEVEL 2 CALL ANSWERED",
            f"Call connected with {l2_name}.",
            "Voice Provider"
        )
        self._add_event(
            "NIV-1024", "ACKNOWLEDGED", "✓ ALERT ACKNOWLEDGED",
            "Officer verified situational status and entered IVR Key 1 confirmation.",
            l2_name
        )

        # 3. NIV-1023: Resolved Moderate Incident
        alert_1023 = {
            "alert_id": "NIV-1023",
            "created_at": (now - timedelta(hours=3)).isoformat(),
            "location": "Kottathara Valley Sector 4",
            "zone": "Kottathara",
            "catchment_id": "MC_KOTTA_02",
            "coordinates": [11.6912, 76.1045],
            "hri": 42.0,
            "rpi": 48.0,
            "mmi": 74.0,
            "mode": "AUTONOMOUS",
            "severity": "MODERATE",
            "hazard": "RUNOFF_SURGE",
            "rainfall_24h_mm": 65.0,
            "reason": "Moderate water level increase in tributary drainage basin.",
            "current_level": 1,
            "current_officer": l1_name,
            "current_phone": l1_phone,
            "current_role": l1_role,
            "status": "RESOLVED",
            "call_status": "ENDED",
            "final_status": "RESOLVED ✓",
            "is_call_active": False,
            "call_answered": True,
            "acknowledged": True,
            "acknowledged_at": (now - timedelta(hours=2, minutes=40)).isoformat(),
            "acknowledged_by": l1_name,
            "escalation_level": f"Level 1 — {l1_role}",
            "escalated_count": 0,
            "timeout_minutes": 15,
            "resolved": True,
            "resolved_at": (now - timedelta(hours=1)).isoformat(),
            "resolved_by": "Senior SDMA Duty Supervisor",
            "resolution_reason": "Water levels normalized. Stream flow telemetry returned to baseline."
        }
        self.alerts_store["NIV-1023"] = alert_1023
        self._add_event(
            "NIV-1023", "ALERT_RESOLVED", "✓ INCIDENT RESOLVED",
            "Water levels normalized. Threat cleared by field inspection.",
            "Senior SDMA Duty Supervisor"
        )

    @staticmethod
    def sanitize_alert_for_client(alert: Dict[str, Any]) -> Dict[str, Any]:
        """Strips phone numbers from client-facing alert payload."""
        safe = dict(alert)
        safe.pop("current_phone", None)
        safe.pop("phone", None)
        # Ensure recipient is a safe designation
        role = safe.get("current_role") or "Emergency Officer"
        level = safe.get("current_level") or 1
        safe["recipient"] = f"{safe.get('current_officer', 'Duty Officer')} (Level {level})"
        return safe

    def get_all_alerts(self) -> List[Dict[str, Any]]:
        """Returns all alerts sorted by severity (CRITICAL first, then HIGH, then MODERATE) sanitized for client."""
        alerts = list(self.alerts_store.values())
        severity_order = {"CRITICAL": 0, "HIGH": 1, "MODERATE": 2, "LOW": 3}
        alerts.sort(key=lambda x: (severity_order.get(x.get("severity", "LOW"), 99), x.get("created_at", "")))
        return [self.sanitize_alert_for_client(a) for a in alerts]

    def get_alert(self, alert_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single alert by Alert ID (sanitized for client)."""
        alert = self.alerts_store.get(alert_id)
        if not alert:
            return None
        return self.sanitize_alert_for_client(alert)

    def get_timeline(self, alert_id: str) -> List[Dict[str, Any]]:
        """Returns chronological event history for an alert."""
        events = self.events_store.get(alert_id, [])
        events.sort(key=lambda x: x.get("timestamp", ""))
        return events

    def get_kpis(self) -> Dict[str, Any]:
        """Calculates dynamic KPI metrics from active alert and call data."""
        alerts = list(self.alerts_store.values())
        active_alerts = [a for a in alerts if not a.get("resolved")]
        critical_alerts = [a for a in active_alerts if a.get("severity") == "CRITICAL"]
        calls_in_progress = [a for a in active_alerts if a.get("is_call_active")]
        acknowledged_alerts = [a for a in alerts if a.get("acknowledged")]
        escalated_alerts = [a for a in alerts if a.get("escalated_count", 0) > 0]
        unresponded = [a for a in active_alerts if not a.get("acknowledged") and a.get("status") in ["CALL_REQUIRED", "ESCALATED", "NO_ANSWER"]]

        return {
            "total_alerts": len(alerts),
            "active_alerts": len(active_alerts),
            "critical_alerts": len(critical_alerts),
            "calls_in_progress": len(calls_in_progress),
            "acknowledged_alerts": len(acknowledged_alerts),
            "escalated_alerts": len(escalated_alerts),
            "unresponded_alerts": len(unresponded),
            "last_updated": datetime.now(timezone.utc).isoformat()
        }

    def initiate_alert_call(
        self,
        alert_id: str,
        manual_override_contact_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiates a voice call for an alert with duplicate call protection and provider validation.
        Selects the officer based on the alert's current escalation level.
        """
        if alert_id not in self.alerts_store:
            raise KeyError(f"Alert ID {alert_id} not found.")

        alert = self.alerts_store[alert_id]
        level = alert.get("current_level", 1)
        priority = alert.get("current_priority", 1)
        zone = alert.get("zone", "All")

        # Resolve contact
        if manual_override_contact_id:
            contacts = load_emergency_contacts()
            contact = next((c for c in contacts if c.get("contact_id") == manual_override_contact_id), None)
            if contact:
                level = contact.get("escalation_level", level)
                alert["current_level"] = level
        else:
            contact = get_contact_for_escalation(zone=zone, escalation_level=level, priority=priority)

        if not contact:
            contact = get_contact_for_escalation(zone="All", escalation_level=level)

        default_phone = "+919941765204" if level == 1 else "+918072778048"
        contact_id = contact.get("contact_id", f"CONT-{level}") if contact else f"CONT-{level}"
        name = contact.get("name", f"Level {level} Emergency Officer") if contact else f"Level {level} Emergency Officer"
        phone = contact.get("phone", default_phone) if contact else default_phone
        role = contact.get("role", "Emergency Officer") if contact else "Emergency Officer"

        # Dispatch via VoiceCallService
        call_resp = voice_service.initiate_call(
            alert_id=alert_id,
            contact_id=contact_id,
            officer_name=name,
            to_phone=phone,
            role=role,
            escalation_level=level,
            severity=alert.get("severity", "CRITICAL"),
            location=alert.get("location", "Wayanad Zone"),
            reason=alert.get("reason", "Disaster alert")
        )

        if not call_resp.get("success", False):
            # Return provider failure or active call notice
            return {
                "success": False,
                "status": call_resp.get("status", "FAILED"),
                "message": call_resp.get("message", "Failed to place emergency voice call."),
                "alert": self.sanitize_alert_for_client(alert),
                "call_attempt_id": call_resp.get("call_attempt_id")
            }

        call_attempt = call_resp["call_attempt"]

        # Update alert status
        alert["status"] = "CALLING"
        alert["call_status"] = call_attempt["status"]
        alert["is_call_active"] = True
        alert["current_officer"] = name
        alert["current_phone"] = phone
        alert["current_role"] = role
        alert["active_call_id"] = call_attempt["id"]

        self._add_event(
            alert_id,
            "CALL_INITIATED",
            f"📞 CALL INITIATED — LEVEL {level}",
            f"Emergency voice call dispatched to {name} ({role}) via {call_attempt['provider']}.",
            "Voice Dispatcher",
            {"call_id": call_attempt["id"], "level": level, "contact_id": contact_id}
        )

        return {
            "success": True,
            "alert_id": alert_id,
            "call_attempt_id": call_attempt["id"],
            "status": call_attempt["status"],
            "alert": self.sanitize_alert_for_client(alert),
            "call_attempt": voice_service.sanitize_call_for_client(call_attempt)
        }

    def process_voice_webhook(
        self,
        provider_call_id: str,
        raw_call_status: str,
        duration: int = 0,
        alert_id_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Handles real-time webhook callbacks from Twilio / Telephony Gateway.
        Source of truth for call state changes.
        """
        attempt = voice_service.get_call_attempt_by_provider_sid(provider_call_id)
        if not attempt and alert_id_hint and alert_id_hint in self.alerts_store:
            # Fallback to active call for this alert
            active_id = self.alerts_store[alert_id_hint].get("active_call_id")
            if active_id and active_id in voice_service.call_attempts:
                attempt = voice_service.call_attempts[active_id]

        if not attempt:
            logger.warning("[WEBHOOK] Call attempt not found for provider SID %s", provider_call_id)
            return {"status": "IGNORED", "message": "Call attempt not found"}

        alert_id = attempt["alert_id"]
        alert = self.alerts_store.get(alert_id)
        status_map = {
            "queued": "QUEUED",
            "initiated": "INITIATING",
            "ringing": "RINGING",
            "in-progress": "ANSWERED",
            "completed": "COMPLETED",
            "busy": "BUSY",
            "no-answer": "NO_ANSWER",
            "failed": "FAILED",
            "canceled": "CANCELED"
        }
        mapped_status = status_map.get(raw_call_status.lower(), raw_call_status.upper())

        voice_service.update_call_status(
            call_attempt_id=attempt["id"],
            new_status=mapped_status,
            duration=duration
        )

        if alert:
            alert["call_status"] = mapped_status
            if mapped_status == "ANSWERED":
                alert["call_answered"] = True
                alert["final_status"] = "ACKNOWLEDGEMENT PENDING"
                self._add_event(
                    alert_id,
                    "CALL_ANSWERED",
                    f"✓ CALL ANSWERED — LEVEL {attempt.get('escalation_level', 1)}",
                    f"Officer {attempt.get('officer_name')} answered the voice call. IVR prompt active.",
                    attempt.get("officer_name", "Officer")
                )
            elif mapped_status in ["NO_ANSWER", "BUSY", "FAILED"]:
                alert["is_call_active"] = False
                alert["status"] = "NO_ANSWER" if mapped_status == "NO_ANSWER" else "CALL_FAILED"
                self._add_event(
                    alert_id,
                    f"CALL_{mapped_status}",
                    f"⚠️ CALL {mapped_status} — LEVEL {attempt.get('escalation_level', 1)}",
                    f"Voice call ended with status {mapped_status}.",
                    "Voice Provider"
                )

        return {"status": "PROCESSED", "mapped_status": mapped_status, "alert_id": alert_id}

    def simulate_call_event(
        self,
        alert_id: str,
        call_attempt_id: str,
        event_type: str,
        ivr_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Simulates / transitions call states for demonstration:
        - RINGING
        - CONNECTED
        - ANSWERED
        - NO_ANSWER
        - BUSY
        - TIMEOUT
        - ACKNOWLEDGED (via IVR key 1)
        """
        if alert_id not in self.alerts_store:
            raise KeyError(f"Alert ID {alert_id} not found.")

        alert = self.alerts_store[alert_id]
        level = alert.get("current_level", 1)

        if event_type == "RINGING":
            voice_service.update_call_status(call_attempt_id, "RINGING")
            alert["call_status"] = "RINGING"
            self._add_event(alert_id, "CALL_RINGING", f"📞 PHONE RINGING — LEVEL {level}", "Officer phone is ringing.", "Voice Gateway")

        elif event_type == "CONNECTED":
            voice_service.update_call_status(call_attempt_id, "CONNECTED")
            alert["call_status"] = "CONNECTED"
            self._add_event(alert_id, "CALL_CONNECTED", f"📞 CALL CONNECTED — LEVEL {level}", "Telephony line connected.", "Voice Gateway")

        elif event_type == "ANSWERED":
            voice_service.update_call_status(call_attempt_id, "ANSWERED")
            alert["call_status"] = "ANSWERED"
            alert["call_answered"] = True
            alert["final_status"] = "ACKNOWLEDGEMENT PENDING"
            self._add_event(
                alert_id,
                "CALL_ANSWERED",
                f"✓ CALL ANSWERED — LEVEL {level}",
                f"{alert['current_officer']} answered the call. IVR message playing: 'Press 1 to acknowledge'.",
                alert['current_officer']
            )

        elif event_type in ["NO_ANSWER", "BUSY", "TIMEOUT", "FAILED"]:
            reason_map = {
                "NO_ANSWER": "Officer did not answer after ringing timeout.",
                "BUSY": "Line busy / rejected.",
                "TIMEOUT": "Call response timeout exceeded.",
                "FAILED": "Network delivery failure."
            }
            voice_service.update_call_status(call_attempt_id, event_type, failure_reason=reason_map.get(event_type, "Call ended"))
            alert["call_status"] = event_type
            alert["is_call_active"] = False
            alert["status"] = "NO_ANSWER" if event_type == "NO_ANSWER" else "CALL_FAILED"
            alert["final_status"] = f"ESCALATION REQUIRED ({event_type.replace('_', ' ')})"

            self._add_event(
                alert_id,
                f"CALL_{event_type}",
                f"⚠️ CALL {event_type.replace('_', ' ')} — LEVEL {level}",
                f"{alert['current_officer']} unreachable ({reason_map.get(event_type)}). Ready to escalate.",
                "Voice Gateway"
            )

        elif event_type == "IVR_ACKNOWLEDGE":
            voice_service.update_call_status(call_attempt_id, "ANSWERED", ivr_key="1")
            self.acknowledge_alert(
                alert_id=alert_id,
                operator_name=f"{alert['current_officer']} (via IVR Key 1)",
                notes="Automated voice recognition confirmed operator acknowledgement."
            )

        return {
            "alert": alert,
            "call_attempt": voice_service.call_attempts.get(call_attempt_id)
        }

    def escalate_alert(
        self,
        alert_id: str,
        reason: str = "Level 1 officer did not answer voice call"
    ) -> Dict[str, Any]:
        """
        Escalates an unacknowledged alert to LEVEL 2 (or next available level).
        Preserves the EXACT SAME Alert ID (e.g. NIV-1025).
        """
        if alert_id not in self.alerts_store:
            raise KeyError(f"Alert ID {alert_id} not found.")

        alert = self.alerts_store[alert_id]
        if alert.get("acknowledged"):
            logger.info("[ESCALATION SKIPPED] Alert %s already acknowledged.", alert_id)
            return alert

        current_level = alert.get("current_level", 1)
        next_contact = get_next_escalation_contact(
            current_level=current_level,
            current_priority=alert.get("current_priority", 1),
            zone=alert.get("zone", "All")
        )

        if not next_contact:
            # Fallback Level 2
            next_contact = get_contact_for_escalation(zone="All", escalation_level=2)

        next_level = next_contact.get("escalation_level", current_level + 1)
        next_name = next_contact.get("name", "NIVARA Demo Emergency Officer 2")
        next_phone = next_contact.get("phone", "+918072778048")
        next_role = next_contact.get("role", "Secondary Emergency Officer (Escalation on Call)")

        # Update alert
        alert["current_level"] = next_level
        alert["current_officer"] = next_name
        alert["current_phone"] = next_phone
        alert["current_role"] = next_role
        alert["recipient"] = f"{next_name} ({next_phone})"
        alert["status"] = "ESCALATED"
        alert["call_status"] = "READY_TO_CALL"
        alert["final_status"] = f"ESCALATED TO LEVEL {next_level}"
        alert["escalation_level"] = f"Level {next_level} — {next_role}"
        alert["escalated_count"] = alert.get("escalated_count", 0) + 1
        alert["is_call_active"] = False

        self._add_event(
            alert_id,
            "ESCALATION_TRIGGERED",
            f"⚠️ ESCALATION TRIGGERED — TO LEVEL {next_level}",
            f"{reason}. Escalating to {next_name} ({next_phone}). Same Alert ID [{alert_id}] maintained.",
            "Escalation Engine",
            {"previous_level": current_level, "new_level": next_level, "officer": next_name}
        )

        return alert

    def acknowledge_alert(
        self,
        alert_id: str,
        operator_name: str = "Duty Officer",
        notes: str = "Verified via emergency telemetry"
    ) -> Dict[str, Any]:
        """
        Marks an alert as officially ACKNOWLEDGED.
        Stops further escalation and confirms response.
        """
        if alert_id not in self.alerts_store:
            raise KeyError(f"Alert ID {alert_id} not found.")

        now_iso = datetime.now(timezone.utc).isoformat()
        alert = self.alerts_store[alert_id]

        alert["status"] = "ACKNOWLEDGED"
        alert["final_status"] = "ACKNOWLEDGED ✓"
        alert["acknowledged"] = True
        alert["acknowledged_at"] = now_iso
        alert["acknowledged_by"] = operator_name
        alert["operator_notes"] = notes
        alert["is_call_active"] = False

        self._add_event(
            alert_id,
            "ACKNOWLEDGED",
            "✓ ALERT ACKNOWLEDGED — RESPONSE CONFIRMED",
            f"Emergency response confirmed by {operator_name}. Escalation stopped.",
            operator_name,
            {"acknowledged_at": now_iso, "notes": notes}
        )

        return {
            "success": True,
            "alert_id": alert_id,
            "status": "ACKNOWLEDGED",
            "final_status": "ACKNOWLEDGED ✓",
            "acknowledged_at": now_iso,
            "acknowledged_by": operator_name
        }

    def resolve_alert(
        self,
        alert_id: str,
        operator_name: str = "Command Officer",
        reason: str = "Incident resolved and ground threat neutralized"
    ) -> Dict[str, Any]:
        """Marks an alert as permanently RESOLVED."""
        if alert_id not in self.alerts_store:
            raise KeyError(f"Alert ID {alert_id} not found.")

        now_iso = datetime.now(timezone.utc).isoformat()
        alert = self.alerts_store[alert_id]

        alert["resolved"] = True
        alert["resolved_at"] = now_iso
        alert["resolved_by"] = operator_name
        alert["resolution_reason"] = reason
        alert["status"] = "RESOLVED"
        alert["final_status"] = "RESOLVED ✓"
        alert["is_call_active"] = False

        self._add_event(
            alert_id,
            "ALERT_RESOLVED",
            "✓ INCIDENT RESOLVED",
            f"Incident marked resolved by {operator_name}. Reason: {reason}.",
            operator_name,
            {"resolved_at": now_iso, "reason": reason}
        )

        return alert


# Singleton AlertService
alert_service = AlertService()
