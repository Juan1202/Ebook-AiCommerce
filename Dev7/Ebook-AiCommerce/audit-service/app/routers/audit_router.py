from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.application.audit_use_cases import create_audit, get_audit as get_audit_record, list_audits as list_audit_records
from app.infrastructure.database import get_db

router = APIRouter()


class AuditResponse(BaseModel):
    id: int
    timestamp: datetime
    module: str
    decision: str
    estado: str
    anomaly: bool
    source: str
    originalValue: float
    computedValue: float
    rule: Optional[str] = None
    detail: Optional[str] = None


class AuditCreateRequest(BaseModel):
    module: str
    decision: str
    estado: str
    source: str
    original_value: float
    computed_value: float
    anomaly: bool = False
    rule: Optional[str] = None
    detail: Optional[str] = None
    timestamp: Optional[datetime] = None


def serialize_audit(audit) -> dict:
    return {
        "id": audit.id,
        "timestamp": audit.timestamp,
        "module": audit.module,
        "decision": audit.decision,
        "estado": audit.estado,
        "anomaly": audit.anomaly,
        "source": audit.source,
        "originalValue": float(audit.original_value),
        "computedValue": float(audit.computed_value),
        "rule": audit.rule,
        "detail": audit.detail,
    }


@router.get("/", response_model=List[AuditResponse])
def list_all_audits(q: str = "", estado: str = "", db: Session = Depends(get_db)):
    return [serialize_audit(audit) for audit in list_audit_records(db, q=q, estado=estado)]


@router.get("/{audit_id}", response_model=AuditResponse)
def get_audit_detail(audit_id: int, db: Session = Depends(get_db)):
    audit = get_audit_record(db, audit_id)
    if audit is None:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    return serialize_audit(audit)


@router.post("/", response_model=AuditResponse, status_code=201)
def create_audit_entry(req: AuditCreateRequest, db: Session = Depends(get_db)):
    audit = create_audit(
        db,
        module=req.module,
        decision=req.decision,
        estado=req.estado,
        source=req.source,
        original_value=req.original_value,
        computed_value=req.computed_value,
        anomaly=req.anomaly,
        rule=req.rule,
        detail=req.detail,
        timestamp=req.timestamp,
    )
    return serialize_audit(audit)


@router.get("/stats")
def get_audit_stats(db: Session = Depends(get_db)):
    total_decisions = db.query(AuditModel).count()
    approved_count = db.query(AuditModel).filter(AuditModel.estado == "APROBADO").count()
    anomaly_count = db.query(AuditModel).filter(AuditModel.anomaly == True).count()
    error_count = db.query(AuditModel).filter(AuditModel.estado == "ERROR").count()

    success_rate = (approved_count / total_decisions * 100) if total_decisions > 0 else 0.0

    module_stats = db.query(
        AuditModel.module,
        db.func.count(AuditModel.id).label("count")
    ).group_by(AuditModel.module).all()

    return {
        "total_decisions": total_decisions,
        "approved_count": approved_count,
        "anomaly_count": anomaly_count,
        "error_count": error_count,
        "success_rate": round(success_rate, 2),
        "module_breakdown": {module: count for module, count in module_stats},
    }
