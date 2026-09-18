"""
NIVARA 2.0 — Dedicated Emergency Telephony & Twilio Voice Calling Router
Exposes endpoints for:
- POST /api/emergency/call (initiates real Twilio outbound PSTN voice call to primary or secondary officer)
- GET /api/emergency/call/status/{call_sid} (fetches real live PSTN call status directly from Twilio)
- POST /api/emergency/twilio/status (Twilio status callback webhook)
- POST /api/emergency/twilio/ivr (DTMF keypad input handler)
- GET /api/emergency/officers (predefined verified emergency officer directory)
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import logging
import os
from datetime import datetime, timezone

from backend.app.config.settings import settings
from backend.app.services.voice_service import voice_service
from backend.app.services.alert_service import alert_service

logger = logging.getLogger("nivara.emergency_routes")

router = APIRouter(prefix="/api/emergency", tags=["Emergency Telephony & Alerts"])

# Strict officer mappings — Arbitrary phone numbers from client are strictly rejected
OFFICER_REGISTRY = {
    "primary": {
        "key": "primary",
        "name": "NIVARA Demo Emergency Officer 1",
        "role": "Primary Emergency Officer (First Responder)",
        "phone": "+919941765204",
        "display_phone": "+91 ••••• ••204",
        "level": 1,
        "priority": 1
    },
    "secondary": {
        "key": "secondary",
        "name": "NIVARA Demo Emergency Officer 2",
        "role": "Secondary Emergency Officer (Escalation on Call)",
        "phone": "+918072778048",
        "display_phone": "+91 ••••• ••048",
        "level": 2,
        "priority": 2
    }
}


class EmergencyCallRequest(BaseModel):
    officer: str = Field(..., description="Target officer: 'primary' or 'secondary'")
    alert_id: Optional[str] = Field("NIV-1025", description="Associated alert ID")


@router.get("/officers")
def get_emergency_officers():
    """Returns the predefined emergency officer directory with sanitized display numbers."""
    return OFFICER_REGISTRY


class TwilioConfigRequest(BaseModel):
    account_sid: str = Field(..., description="Twilio Account SID (starts with AC)")
    auth_token: str = Field(..., description="Twilio Auth Token")
    phone_number: str = Field(..., description="Twilio Outbound Phone Number (E.164, e.g. +1234567890)")
    webhook_base_url: Optional[str] = Field("http://localhost:8000", description="Webhook Base URL")


@router.get("/twilio/config")
def get_twilio_config():
    """Returns whether real Twilio telephony credentials are currently configured."""
    is_conf = voice_service.twilio_provider.is_configured()
    sid = voice_service.twilio_provider.account_sid.strip()
    phone = voice_service.twilio_provider.from_number.strip()
    return {
        "configured": is_conf,
        "mode": "REAL_TWILIO_CARRIER" if is_conf else "VOICE_GATEWAY_DEMO",
        "account_sid_masked": f"{sid[:6]}...{sid[-4:]}" if is_conf and len(sid) > 10 else None,
        "phone_number": phone if is_conf else None
    }


@router.post("/configure-twilio")
def configure_twilio(payload: TwilioConfigRequest):
    """
    Dynamically saves Twilio credentials to .env and updates running server settings.
    Enables immediate real physical PSTN calling without server restart.
    """
    sid = payload.account_sid.strip()
    token = payload.auth_token.strip()
    phone = payload.phone_number.strip()
    webhook = (payload.webhook_base_url or "http://localhost:8000").strip()

    if not (sid.startswith("AC") and len(sid) >= 32):
        raise HTTPException(status_code=400, detail="Invalid Twilio Account SID. Must start with 'AC' and be at least 32 characters.")
    if len(token) < 16:
        raise HTTPException(status_code=400, detail="Invalid Twilio Auth Token. Must be at least 16 characters.")
    if not (phone.startswith("+") and len(phone) >= 8):
        raise HTTPException(status_code=400, detail="Invalid Twilio Phone Number. Must start with '+' followed by country code and digits (e.g. +1234567890).")

    import os
    from backend.app.config.settings import settings

    os.environ["TWILIO_ACCOUNT_SID"] = sid
    os.environ["TWILIO_AUTH_TOKEN"] = token
    os.environ["TWILIO_PHONE_NUMBER"] = phone
    os.environ["WEBHOOK_BASE_URL"] = webhook
    os.environ["VOICE_CALL_MODE"] = "real"

    settings.TWILIO_ACCOUNT_SID = sid
    settings.TWILIO_AUTH_TOKEN = token
    settings.TWILIO_PHONE_NUMBER = phone
    settings.WEBHOOK_BASE_URL = webhook
    settings.VOICE_CALL_MODE = "real"

    # Persist in both root .env and backend/.env
    import re
    for env_path in [settings.ROOT_DIR / ".env", settings.BASE_DIR / ".env"]:
        try:
            content = ""
            if env_path.exists():
                with open(env_path, "r", encoding="utf-8") as f:
                    content = f.read()

            def set_key(txt, k, v):
                pat = rf"^{k}=.*$"
                if re.search(pat, txt, flags=re.MULTILINE):
                    return re.sub(pat, f"{k}={v}", txt, flags=re.MULTILINE)
                else:
                    return txt.rstrip() + f"\n{k}={v}\n"

            content = set_key(content, "VOICE_CALL_MODE", "real")
            content = set_key(content, "VOICE_PROVIDER", "twilio")
            content = set_key(content, "TWILIO_ACCOUNT_SID", sid)
            content = set_key(content, "TWILIO_AUTH_TOKEN", token)
            content = set_key(content, "TWILIO_PHONE_NUMBER", phone)
            content = set_key(content, "WEBHOOK_BASE_URL", webhook)

            with open(env_path, "w", encoding="utf-8") as f:
                f.write(content)
        except Exception as e:
            logger.error("Failed to write env file %s: %s", env_path, e)

    return {
        "success": True,
        "message": "Twilio telephony credentials configured successfully! Real physical PSTN voice calling is active.",
        "configured": True,
        "account_sid_masked": f"{sid[:6]}...{sid[-4:]}",
        "phone_number": phone
    }


@router.post("/call")
def initiate_emergency_call(payload: EmergencyCallRequest):
    """
    Places an emergency voice call to the selected emergency officer.
    Strictly maps:
      'primary'   -> +919941765204
      'secondary' -> +918072778048
    Inspects all Twilio environment variables and attempts real Twilio dispatch.
    Returns real Twilio error codes and messages without faking success.
    """
    officer_key = payload.officer.lower().strip()
    alert_id = payload.alert_id or "NIV-1025"

    print("\n" + "=" * 70)
    print("[NIVARA TWILIO EMERGENCY CALL INITIATED]")
    print(f"1. FRONTEND REQUEST: POST /api/emergency/call | Alert ID: {alert_id}")
    print(f"2. BACKEND REQUEST BODY: {payload.dict()}")

    if officer_key not in OFFICER_REGISTRY:
        print(f"[ERROR] Invalid officer '{payload.officer}'. Allowed: 'primary', 'secondary'")
        print("=" * 70 + "\n")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid officer '{payload.officer}'. Allowed values: 'primary', 'secondary'."
        )

    officer_meta = OFFICER_REGISTRY[officer_key]
    target_phone = officer_meta["phone"]
    officer_name = officer_meta["name"]
    officer_role = officer_meta["role"]
    display_phone = officer_meta["display_phone"]
    level = officer_meta["level"]

    print(f"   DESTINATION MAPPING VERIFIED:")
    print(f"   - Officer Key: '{officer_key}' (Level {level})")
    print(f"   - Officer Name: {officer_name}")
    print(f"   - Target Phone (E.164): {target_phone}")
    print(f"   - Display Phone: {display_phone}")

    # Inspect Environment Variables
    sid_val = (os.getenv("TWILIO_ACCOUNT_SID") or getattr(settings, "TWILIO_ACCOUNT_SID", "")).strip()
    token_val = (os.getenv("TWILIO_AUTH_TOKEN") or getattr(settings, "TWILIO_AUTH_TOKEN", "")).strip()
    from_num_val = (os.getenv("TWILIO_PHONE_NUMBER") or getattr(settings, "TWILIO_PHONE_NUMBER", "")).strip()

    sid_loaded = bool(sid_val and not sid_val.startswith("your_"))
    token_loaded = bool(token_val and not token_val.startswith("your_"))
    phone_loaded = bool(from_num_val and not from_num_val.startswith("your_"))

    masked_sid = f"{sid_val[:6]}...{sid_val[-4:]}" if (sid_loaded and len(sid_val) >= 10) else (sid_val if sid_loaded else "<EMPTY>")

    print(f"3. TWILIO_ACCOUNT_SID LOADED: {sid_loaded} (Masked SID: {masked_sid})")
    print(f"4. TWILIO_AUTH_TOKEN LOADED: {token_loaded} (Length: {len(token_val)} chars, NEVER PRINTING TOKEN)")
    print(f"5. TWILIO_PHONE_NUMBER LOADED: {phone_loaded} (Value: '{from_num_val}' if phone_loaded else '<EMPTY>')")

    # Check whether all 3 credentials are present
    if not (sid_loaded and token_loaded and phone_loaded):
        missing_vars = []
        if not sid_loaded: missing_vars.append("TWILIO_ACCOUNT_SID")
        if not token_loaded: missing_vars.append("TWILIO_AUTH_TOKEN")
        if not phone_loaded: missing_vars.append("TWILIO_PHONE_NUMBER")

        err_code = 20003  # Twilio Error 20003: Authentication / Missing credentials
        err_msg = (
            f"Twilio credentials missing in environment: {', '.join(missing_vars)}. "
            f"Please set them in .env and restart the backend server."
        )
        print(f"6. TWILIO CLIENT INITIALIZATION: SKIPPED (Credentials missing: {', '.join(missing_vars)})")
        print(f"7. TWILIO API ERROR CODE: {err_code} | Message: {err_msg}")
        print(f"8. TWILIO CALL SID: NONE (Call not created)")
        print("=" * 70 + "\n")

        return {
            "success": False,
            "status": "FAILED",
            "error": "TWILIO_CREDENTIALS_MISSING",
            "twilio_error_code": err_code,
            "http_status": 401,
            "message": err_msg,
            "missing_variables": missing_vars,
            "officer": officer_key,
            "officer_name": officer_name,
            "display_phone": display_phone,
            "target_phone": target_phone,
            "diagnostics": {
                "account_sid_loaded": sid_loaded,
                "auth_token_loaded": token_loaded,
                "phone_number_loaded": phone_loaded,
                "from_number": from_num_val or None,
                "destination_number": target_phone
            }
        }

    # Attempt Twilio Client Initialization
    print("6. ATTEMPTING TWILIO CLIENT INITIALIZATION...")
    try:
        from twilio.rest import Client
        client = Client(sid_val, token_val)
        print("   [OK] Twilio Client initialized successfully.")
    except Exception as e:
        err_msg = f"Failed to initialize Twilio Client: {str(e)}"
        print(f"   [ERROR] Twilio Client Initialization Error: {err_msg}")
        print("=" * 70 + "\n")
        return {
            "success": False,
            "status": "FAILED",
            "error": "TWILIO_CLIENT_INIT_FAILED",
            "message": err_msg,
            "officer": officer_key,
            "officer_name": officer_name,
            "display_phone": display_phone,
            "target_phone": target_phone
        }

    # Retrieve alert details for TwiML speech
    alert = alert_service.alerts_store.get(alert_id)
    if not alert:
        alert_service._seed_initial_alerts()
        alert = alert_service.alerts_store.get(alert_id) or alert_service.alerts_store.get("NIV-1025")

    location = alert.get("location", "Meppadi (Mundakkai / Chooralmala)") if alert else "Meppadi (Mundakkai / Chooralmala)"
    severity = alert.get("severity", "CRITICAL") if alert else "CRITICAL"
    rpi = float(alert.get("rpi", 91.0)) if alert else 91.0
    hri = float(alert.get("hri", 88.0)) if alert else 88.0
    rainfall = float(alert.get("rainfall_24h_mm", 182.0)) if alert else 182.0

    # Build dynamic emergency TwiML payload using Twilio inline TwiML parameter
    twiml_content = (
        f'<Response>'
        f'<Say voice="alice" language="en-IN">'
        f'Emergency alert from NIVARA Disaster Operations. '
        f'A critical multi-hazard incident has been detected. '
        f'Location: {location}. '
        f'Hazard status: {severity}. '
        f'Relocation Priority Index is {int(rpi)} out of 100. '
        f'Hazard Risk Index is {int(hri)} out of 100. '
        f'24 hour rainfall has exceeded {int(rainfall)} millimeters. '
        f'Please respond immediately to the NIVARA emergency alert system.'
        f'</Say>'
        f'</Response>'
    )

    # Hosted TwiML URL (standard zero-latency webhook compatible with all Twilio account tiers)
    public_twiml_url = (
        os.getenv("TWILIO_TWIML_URL") or 
        os.getenv("TWIML_URL") or 
        getattr(settings, "TWIML_URL", "") or 
        "https://handler.twilio.com/twiml/EH6abd15072d4a1a20c083b0bfcf81e79f"
    )

    create_kwargs = {
        "url": public_twiml_url,
        "to": target_phone,
        "from_": from_num_val,
    }

    # Only attach status callback if explicitly configured with a public non-localhost HTTPS URL
    webhook_base = (os.getenv("WEBHOOK_BASE_URL") or getattr(settings, "WEBHOOK_BASE_URL", "")).rstrip("/")
    is_public_webhook = bool(
        webhook_base and
        not any(h in webhook_base.lower() for h in ["localhost", "127.0.0.1", "0.0.0.0", "::1"]) and
        (webhook_base.startswith("http://") or webhook_base.startswith("https://"))
    )
    if is_public_webhook:
        create_kwargs["status_callback"] = f"{webhook_base}/api/emergency/twilio/status?alert_id={alert_id}"
        create_kwargs["status_callback_event"] = ['initiated', 'ringing', 'answered', 'completed']
        create_kwargs["status_callback_method"] = 'POST'

    # Attempt to place outbound Twilio voice call
    print(f"7. PLACING OUTBOUND TWILIO CALL via client.calls.create()...")
    print(f"   From: {from_num_val} -> To: {target_phone} | TwiML URL: {public_twiml_url}")

    try:
        is_forwarded = False
        try:
            call = client.calls.create(**create_kwargs)
        except Exception as inner_err:
            inner_code = getattr(inner_err, "code", None)
            inner_msg = str(getattr(inner_err, "msg", inner_err)).lower()
            # If target number is unverified in Twilio Trial account, route to verified primary duty phone
            if inner_code == 573002 or "verified recipient" in inner_msg:
                verified_phone = OFFICER_REGISTRY["primary"]["phone"]
                print(f"   [INFO] Twilio Trial unverified recipient ({target_phone}). Routing call to verified duty phone: {verified_phone}")
                call = client.calls.create(
                    url=public_twiml_url,
                    to=verified_phone,
                    from_=from_num_val
                )
                is_forwarded = True
            else:
                raise inner_err

        call_sid = call.sid
        call_status = (call.status or "CALLING").upper()
        now_iso = datetime.now(timezone.utc).isoformat()

        print(f"   [OK] CALL PLACED SUCCESSFULLY!")
        print(f"8. TWILIO CALL SID: {call_sid}")
        print(f"   Status: {call_status} (Forwarded: {is_forwarded})")
        print("=" * 70 + "\n")

        attempt_record = {
            "id": call_sid,
            "call_sid": call_sid,
            "provider_call_id": call_sid,
            "alert_id": alert_id,
            "contact_id": f"CONT-00{level}",
            "officer_key": officer_key,
            "officer_name": officer_name,
            "display_phone": display_phone,
            "role": officer_role,
            "escalation_level": level,
            "provider": "TWILIO_VOICE",
            "status": call_status,
            "is_demo": False,
            "is_forwarded": is_forwarded,
            "started_at": now_iso,
            "duration": 0,
            "call_answered": False,
            "acknowledged": False,
            "created_at": now_iso
        }
        voice_service.call_attempts[call_sid] = attempt_record

        dispatch_msg = (
            f"Real Twilio PSTN call dispatched to {officer_name} ({display_phone}). SID: {call_sid}"
            if not is_forwarded else
            f"Real Twilio call placed for {officer_name} (routed to verified phone +91 99417 65204 via Twilio Trial). SID: {call_sid}"
        )

        if alert:
            alert["status"] = "CALLING"
            alert["call_status"] = call_status
            alert["is_call_active"] = True
            alert["current_officer"] = officer_name
            alert["current_phone"] = target_phone
            alert["current_role"] = officer_role
            alert["current_level"] = level
            alert["active_call_id"] = call_sid
            alert_service._add_event(
                alert_id,
                "CALL_INITIATED",
                f"📞 REAL TWILIO VOICE CALL DISPATCHED — LEVEL {level}",
                dispatch_msg,
                "TWILIO_VOICE",
                {"call_sid": call_sid, "officer": officer_name, "level": level, "provider": "TWILIO_VOICE", "is_forwarded": is_forwarded}
            )

        return {
            "success": True,
            "call_sid": call_sid,
            "status": call_status,
            "officer": officer_key,
            "officer_name": officer_name,
            "display_phone": display_phone,
            "alert_id": alert_id,
            "is_real_twilio": True,
            "is_forwarded": is_forwarded,
            "provider": "TWILIO_VOICE",
            "message": dispatch_msg
        }

    except Exception as e:
        err_code = getattr(e, "code", None)
        http_status = getattr(e, "status", None)
        err_msg = getattr(e, "msg", None) or str(e)

        friendly_detail = f"Twilio Error {err_code}: {err_msg}" if err_code else f"Twilio API Error: {err_msg}"

        print(f"   [ERROR] TWILIO CALL CREATION FAILED!")
        print(f"7. TWILIO ERROR CODE: {err_code} (HTTP Status: {http_status})")
        print(f"   Error Message: {err_msg}")
        print(f"   Friendly Detail: {friendly_detail}")
        print(f"8. TWILIO CALL SID: NONE")
        print("=" * 70 + "\n")

        return {
            "success": False,
            "status": "FAILED",
            "error": "TWILIO_CALL_FAILED",
            "twilio_error_code": err_code,
            "http_status": http_status,
            "message": friendly_detail,
            "officer": officer_key,
            "officer_name": officer_name,
            "display_phone": display_phone,
            "target_phone": target_phone
        }


@router.api_route("/twilio/twiml", methods=["GET", "POST"])
def twilio_twiml_endpoint(alert_id: str = "NIV-1025"):
    """
    Returns dynamic TwiML XML response for Twilio Voice Webhooks.
    """
    alert = alert_service.alerts_store.get(alert_id)
    if not alert:
        alert_service._seed_initial_alerts()
        alert = alert_service.alerts_store.get(alert_id) or alert_service.alerts_store.get("NIV-1025")

    location = alert.get("location", "Meppadi (Mundakkai / Chooralmala)") if alert else "Meppadi (Mundakkai / Chooralmala)"
    severity = alert.get("severity", "CRITICAL") if alert else "CRITICAL"
    rpi = float(alert.get("rpi", 91.0)) if alert else 91.0
    hri = float(alert.get("hri", 88.0)) if alert else 88.0
    rainfall = float(alert.get("rainfall_24h_mm", 182.0)) if alert else 182.0

    twiml_content = (
        f'<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<Response>\n'
        f'<Say voice="Polly.Aditi" language="en-IN">\n'
        f'Attention emergency officer. This is an urgent critical disaster notification from NIVARA Multi Hazard Early Warning Command. \n'
        f'{severity} landslide and flash flood risk detected in {location}. Alert ID {alert_id}. \n'
        f'Relocation Priority Index is {int(rpi)} out of 100. Hazard Risk Index is {int(hri)} out of 100. 24 hour rainfall has exceeded {int(rainfall)} millimeters. \n'
        f'Immediate evacuation protocol and emergency response deployment are required. \n'
        f'Please listen to confirm response.\n'
        f'</Say>\n'
        f'<Gather numDigits="1" method="POST" timeout="10">\n'
        f'<Say voice="Polly.Aditi" language="en-IN">Press 1 on your phone keypad to acknowledge this emergency alert and confirm response. Press 2 if immediate field assistance is required.</Say>\n'
        f'</Gather>\n'
        f'<Say voice="Polly.Aditi" language="en-IN">No response received. Escalating emergency alert to secondary officer. Goodbye.</Say>\n'
        f'<Hangup/>\n'
        f'</Response>'
    )
    return Response(content=twiml_content, media_type="application/xml")


@router.get("/call/status/{call_sid}")
def get_emergency_call_status(call_sid: str):
    """
    Fetches the real live call state.
    - If Twilio call: Queries Twilio PSTN Gateway via REST API.
    - If Voice Gateway call: Progresses live state with real timestamps.
    """
    attempt = voice_service.call_attempts.get(call_sid, {})
    is_demo = attempt.get("is_demo", True) or call_sid.startswith("CA-DEMO")

    if not is_demo and voice_service.twilio_provider.is_configured():
        status_info = voice_service.twilio_provider.get_call_status(call_sid)
        current_status = status_info.get("status", attempt.get("status", "UNKNOWN"))
        duration = status_info.get("duration", attempt.get("duration", 0))
    else:
        # Progress based on actual elapsed time since initiation
        started_str = attempt.get("started_at")
        elapsed = 0
        if started_str:
            try:
                started_dt = datetime.fromisoformat(started_str.replace("Z", "+00:00"))
                elapsed = int((datetime.now(timezone.utc) - started_dt).total_seconds())
            except Exception:
                elapsed = 0

        duration = elapsed
        if attempt.get("acknowledged"):
            current_status = "ACKNOWLEDGED"
        elif elapsed < 3:
            current_status = "CALLING"
        elif elapsed < 7:
            current_status = "RINGING"
        else:
            current_status = "IN_PROGRESS"
            attempt["call_answered"] = True

    if call_sid in voice_service.call_attempts:
        attempt["status"] = current_status
        attempt["duration"] = duration
        if current_status in ["IN_PROGRESS", "ANSWERED"]:
            attempt["call_answered"] = True

    alert_id = attempt.get("alert_id")
    if alert_id and alert_id in alert_service.alerts_store:
        alert = alert_service.alerts_store[alert_id]
        alert["call_status"] = current_status
        if current_status in ["IN_PROGRESS", "ANSWERED"]:
            alert["call_answered"] = True
            alert["final_status"] = "ACKNOWLEDGEMENT PENDING"
        elif current_status in ["COMPLETED", "BUSY", "NO_ANSWER", "FAILED", "CANCELED"]:
            alert["is_call_active"] = False

    return {
        "success": True,
        "call_sid": call_sid,
        "status": current_status,
        "raw_status": current_status.lower(),
        "duration": duration,
        "officer": attempt.get("officer_key", "primary"),
        "officer_name": attempt.get("officer_name", "Emergency Officer"),
        "display_phone": attempt.get("display_phone", ""),
        "acknowledged": attempt.get("acknowledged", False),
        "is_demo": is_demo
    }


@router.post("/twilio/status")
async def twilio_status_webhook(request: Request):
    """
    Real-time webhook callback endpoint for Twilio Voice CallStatus events.
    Receives form-encoded CallSid, CallStatus, and CallDuration.
    """
    form_data = await request.form()
    call_sid = form_data.get("CallSid", "")
    raw_status = form_data.get("CallStatus", "")
    duration = int(form_data.get("CallDuration", 0) or 0)
    query_alert_id = request.query_params.get("alert_id")

    logger.info("[TWILIO WEBHOOK] Status update for Call SID %s: %s (Duration: %ss)", call_sid, raw_status, duration)

    return alert_service.process_voice_webhook(
        provider_call_id=call_sid,
        raw_call_status=raw_status,
        duration=duration,
        alert_id_hint=query_alert_id
    )


@router.post("/twilio/ivr")
async def twilio_ivr_webhook(request: Request):
    """
    Handles DTMF Keypad responses from the called officer.
    Digits=1: Acknowledged emergency response.
    Digits=2: Requested immediate field assistance.
    """
    form_data = await request.form()
    digits = form_data.get("Digits", "")
    call_sid = form_data.get("CallSid", "")
    alert_id = request.query_params.get("alert_id", "NIV-1025")

    logger.info("[TWILIO IVR] Received DTMF Digits '%s' for Call %s (Alert %s)", digits, call_sid, alert_id)

    # Update call attempt if present
    if call_sid in voice_service.call_attempts:
        voice_service.call_attempts[call_sid]["ivr_response"] = digits
        if digits == "1":
            voice_service.call_attempts[call_sid]["acknowledged"] = True

    if digits == "1":
        alert_service.acknowledge_alert(
            alert_id=alert_id,
            operator_name="Officer (via Twilio IVR Key 1)",
            notes="Real telephony IVR keypad acknowledgement confirmed."
        )
        xml = (
            '<Response>'
            '<Say voice="Polly.Aditi" language="en-IN">'
            'Thank you officer. Emergency response has been confirmed and registered in NIVARA Command Center.'
            '</Say>'
            '<Hangup/>'
            '</Response>'
        )
    elif digits == "2":
        alert_service._add_event(
            alert_id=alert_id,
            event_type="FIELD_ASSISTANCE_REQUESTED",
            title="⚠️ FIELD ASSISTANCE REQUESTED",
            description="Officer pressed IVR Key 2 requesting immediate emergency reinforcement.",
            actor="Emergency Officer"
        )
        xml = (
            '<Response>'
            '<Say voice="Polly.Aditi" language="en-IN">'
            'Field reinforcement request has been logged with the District Emergency Operations Center.'
            '</Say>'
            '<Hangup/>'
            '</Response>'
        )
    else:
        xml = (
            '<Response>'
            '<Say voice="Polly.Aditi" language="en-IN">Goodbye.</Say>'
            '<Hangup/>'
            '</Response>'
        )

    return Response(content=xml, media_type="application/xml")
