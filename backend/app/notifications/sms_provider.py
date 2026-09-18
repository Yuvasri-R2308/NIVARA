"""
NIVARA 2.0 — SMS & Emergency Notification Provider Abstract Base Class
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseSMSProvider(ABC):
    """Abstract interface for SMS & IVR notification dispatchers."""

    @abstractmethod
    def send_alert(
        self,
        recipient: str,
        message: str,
        alert_id: str,
        severity: str
    ) -> Dict[str, Any]:
        """Dispatches an emergency alert and returns status metadata."""
        pass
