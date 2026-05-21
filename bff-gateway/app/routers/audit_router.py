from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.audit import get_event_statistics, query_events, record_event

router = APIRouter(prefix="/api/admin/audit", tags=["audit"])


class AuditEventCreate(BaseModel):
    event_type: str
    category: str
    description: str
    service: Optional[str] = None
    path: Optional[str] = None
    status_code: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


@router.post("/events")
async def create_audit_event(payload: AuditEventCreate):
    return record_event(
        event_type=payload.event_type,
        category=payload.category,
        description=payload.description,
        service=payload.service,
        path=payload.path,
        status_code=payload.status_code,
        metadata=payload.metadata,
    )


@router.get("/events")
async def list_audit_events(
    event_type: Optional[str] = Query(None, description="Filtrar por tipo de evento"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    service: Optional[str] = Query(None, description="Filtrar por servicio"),
    path_contains: Optional[str] = Query(None, description="Filtrar por parte de la ruta"),
    since: Optional[str] = Query(None, description="Fecha mínima ISO 8601"),
    until: Optional[str] = Query(None, description="Fecha máxima ISO 8601"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    try:
        return query_events(
            event_type=event_type,
            category=category,
            service=service,
            path_contains=path_contains,
            since=since,
            until=until,
            limit=limit,
            offset=offset,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/statistics")
async def audit_statistics():
    return get_event_statistics()
