"""
NIVARA 2.0 — Mock SMS & IVR Provider
Safe simulation provider for development and demo mode. Simulates message dispatch, delivery, and delivery receipts.
"""

from typing import Dict, Any
import time
from datetime import datetime
from .sms_provider import BaseSMSProvider

class MockSMSProvider(BaseSMSProvider):
    """
    Mock SMS provider for safe prototype testing.
    Never sends real SMS to external networks.
    """

    def send_alert(
        self,
        recipient: str,
        message: str,
        alert_id: str,
        severity: str
    ) -> Dict[str, Any]:
        timestamp = datetime.utcnow().isoformat() + "Z"
        return {
            "provider": "MOCK_SMS_GATEWAY",
            "alert_id": alert_id,
            "recipient": recipient,
            "status": "DELIVERED",
            "dispatched_at": timestamp,
            "delivery_receipt": f"MOCK-DELIV-{int(time.time())}",
            "severity": severity,
            "message_length": len(message),
            "simulated": True,
            "note": "Demo mode simulation: No real SMS dispatched"
        }
