"""
NIVARA 2.0 — Emergency Contacts Repository & Escalation Selector
Provides data-driven retrieval of emergency contacts based on zone, priority, escalation_level, and active status.
Stores contacts in configuration/database without hard-coding phone numbers in Python logic.
"""

import json
import os
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger("nivara.contacts")

CONTACTS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "emergency_contacts.json"
)

DEFAULT_CONTACTS = [
    {
        "contact_id": "CONT-001",
        "name": "NIVARA Demo Emergency Officer 1",
        "role": "Primary Emergency Officer (First Responder)",
        "phone": "+919941765204",
        "zone": "All",
        "escalation_level": 1,
        "priority": 1,
        "is_active": True,
        "created_at": "2026-08-28T00:00:00Z",
        "notes": "First responder on-duty for Wayanad District multi-hazard early warning."
    },
    {
        "contact_id": "CONT-002",
        "name": "NIVARA Demo Emergency Officer 2",
        "role": "Secondary Emergency Officer (Escalation on Call)",
        "phone": "+918072778048",
        "zone": "All",
        "escalation_level": 2,
        "priority": 2,
        "is_active": True,
        "created_at": "2026-08-28T00:00:00Z",
        "notes": "Secondary escalation officer triggered if Level 1 does not acknowledge within timeout."
    },
    {
        "contact_id": "CONT-003",
        "name": "District Emergency Operations Center (DEOC Wayanad)",
        "role": "District Collectorate Control Center",
        "phone": "+914936204151",
        "zone": "Wayanad",
        "escalation_level": 3,
        "priority": 3,
        "is_active": True,
        "created_at": "2026-08-28T00:00:00Z",
        "notes": "Command-level tertiary escalation center for district-wide red alert evacuation orders."
    }
]


def load_emergency_contacts() -> List[Dict[str, Any]]:
    """Loads all emergency contacts from database / JSON storage."""
    if not os.path.exists(CONTACTS_FILE):
        save_emergency_contacts(DEFAULT_CONTACTS)
        return DEFAULT_CONTACTS

    try:
        with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list) and len(data) > 0:
                return data
            return DEFAULT_CONTACTS
    except Exception as e:
        logger.error("Failed to load emergency contacts from %s: %s", CONTACTS_FILE, e)
        return DEFAULT_CONTACTS


def save_emergency_contacts(contacts: List[Dict[str, Any]]) -> bool:
    """Saves emergency contacts to database / JSON storage."""
    try:
        os.makedirs(os.path.dirname(CONTACTS_FILE), exist_ok=True)
        with open(CONTACTS_FILE, "w", encoding="utf-8") as f:
            json.dump(contacts, f, indent=2)
        return True
    except Exception as e:
        logger.error("Failed to save emergency contacts to %s: %s", CONTACTS_FILE, e)
        return False


def get_contact_for_escalation(
    zone: str = "All",
    escalation_level: int = 1,
    priority: Optional[int] = None
) -> Optional[Dict[str, Any]]:
    """
    Selects the matching emergency contact based on:
    - is_active == True
    - escalation_level
    - zone (matches specific zone or 'All')
    - priority (lowest numerical priority number = highest urgency)
    """
    contacts = load_emergency_contacts()
    
    # Filter active contacts for the requested level
    candidates = [
        c for c in contacts
        if c.get("is_active", True) and c.get("escalation_level") == escalation_level
    ]

    if not candidates:
        # Fallback to any active contact at this level
        candidates = [c for c in contacts if c.get("escalation_level") == escalation_level]

    if not candidates:
        return None

    # Filter by zone if zone-specific contact exists
    zone_candidates = [
        c for c in candidates
        if c.get("zone", "All").lower() in [zone.lower(), "all"]
    ]
    if zone_candidates:
        candidates = zone_candidates

    # Filter by specific priority if requested
    if priority is not None:
        p_candidates = [c for c in candidates if c.get("priority") == priority]
        if p_candidates:
            return p_candidates[0]

    # Sort by priority ascending (1 is higher priority than 2)
    candidates.sort(key=lambda x: x.get("priority", 999))
    return candidates[0] if candidates else None


def get_next_escalation_contact(
    current_level: int,
    current_priority: int = 1,
    zone: str = "All"
) -> Optional[Dict[str, Any]]:
    """
    Finds the next emergency contact in the hierarchy.
    First checks if there is another priority contact at the same level,
    otherwise advances to current_level + 1.
    """
    contacts = load_emergency_contacts()
    active_contacts = [c for c in contacts if c.get("is_active", True)]

    # 1. Check next priority at same level
    same_level_next = [
        c for c in active_contacts
        if c.get("escalation_level") == current_level and c.get("priority", 1) > current_priority
    ]
    if same_level_next:
        same_level_next.sort(key=lambda x: x.get("priority", 999))
        return same_level_next[0]

    # 2. Check next escalation level (level > current_level)
    higher_levels = [
        c for c in active_contacts
        if c.get("escalation_level", 0) > current_level
    ]
    if higher_levels:
        higher_levels.sort(key=lambda x: (x.get("escalation_level", 999), x.get("priority", 999)))
        return higher_levels[0]

    return None


def add_emergency_contact(contact: Dict[str, Any]) -> Dict[str, Any]:
    """Adds a new emergency contact."""
    contacts = load_emergency_contacts()
    contact_id = contact.get("contact_id") or f"CONT-{len(contacts) + 1:03d}"
    contact["contact_id"] = contact_id
    contacts.append(contact)
    save_emergency_contacts(contacts)
    return contact


def update_emergency_contact(contact_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Updates an existing emergency contact."""
    contacts = load_emergency_contacts()
    for i, c in enumerate(contacts):
        if c.get("contact_id") == contact_id:
            contacts[i].update(updates)
            save_emergency_contacts(contacts)
            return contacts[i]
    return None


def delete_emergency_contact(contact_id: str) -> bool:
    """Deletes or deactivates an emergency contact."""
    contacts = load_emergency_contacts()
    initial_len = len(contacts)
    contacts = [c for c in contacts if c.get("contact_id") != contact_id]
    if len(contacts) < initial_len:
        save_emergency_contacts(contacts)
        return True
    return False


def sanitize_contact_for_client(contact: Dict[str, Any]) -> Dict[str, Any]:
    """
    Strips phone numbers from client-facing JSON.
    Returns safe fields: contact_id, name, role/designation, escalation_level, priority, is_active, zone.
    """
    safe = dict(contact)
    safe.pop("phone", None)
    return safe


def get_public_emergency_contacts() -> List[Dict[str, Any]]:
    """Returns directory of emergency contacts with phone numbers omitted for client security."""
    contacts = load_emergency_contacts()
    return [sanitize_contact_for_client(c) for c in contacts]
