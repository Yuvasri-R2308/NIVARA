"""
Hazard & Cadastral Risk API Endpoints
"""

from typing import Dict, Any, List

def get_cadastral_hazard_overview() -> Dict[str, Any]:
    return {
        "epicenter": "Meppadi (Mundakkai / Chooralmala)",
        "high_risk_parcels": 250,
        "study_villages": ["Meppadi", "Achooranam", "Kottathara", "Kuppadithara"],
        "status": "ACTIVE_SURVEILLANCE"
    }
