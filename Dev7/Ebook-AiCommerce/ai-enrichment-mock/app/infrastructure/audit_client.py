import logging
import os

import httpx

logger = logging.getLogger(__name__)

AUDIT_SERVICE_URL = os.getenv("AUDIT_SERVICE_URL")
AUDIT_TIMEOUT_SECONDS = float(os.getenv("AUDIT_TIMEOUT_SECONDS", "5.0"))


def send_audit_event(payload: dict) -> None:
    if not AUDIT_SERVICE_URL:
        return

    try:
        with httpx.Client(timeout=AUDIT_TIMEOUT_SECONDS) as client:
            response = client.post(AUDIT_SERVICE_URL, json=payload)
            response.raise_for_status()
    except Exception as exc:
        logger.warning("No se pudo enviar evento de auditoría: %s", exc)
