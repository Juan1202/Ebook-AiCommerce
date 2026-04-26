from datetime import datetime
from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.infrastructure.database import AuditModel


def seed_initial_audits(db: Session):
    if db.query(AuditModel).count() > 0:
        return

    initial_audits = [
        AuditModel(
            id=101,
            timestamp=datetime(2026, 4, 25, 9, 18),
            module="Pricing",
            decision="Precio ajustado",
            estado="APROBADO",
            anomaly=False,
            source="IA Pricing",
            original_value=95.0,
            computed_value=109.5,
            rule="Regla de margen mínimo",
            detail="Se aplicó un aumento basado en la comparación de precios y el costo interno.",
        ),
        AuditModel(
            id=102,
            timestamp=datetime(2026, 4, 25, 10, 2),
            module="Enrichment",
            decision="Enriquecimiento completo",
            estado="APROBADO",
            anomaly=False,
            source="Enrichment API",
            original_value=160.0,
            computed_value=158.4,
            rule="Ajuste de competencia",
            detail="Se validaron datos externos y se normalizó el precio con la tasa de cambio actual.",
        ),
        AuditModel(
            id=103,
            timestamp=datetime(2026, 4, 25, 11, 35),
            module="Pricing",
            decision="Precio fuera de rango",
            estado="ANOMALÍA",
            anomaly=True,
            source="IA Pricing",
            original_value=22.0,
            computed_value=9.5,
            rule="Detección de outlier",
            detail="Precio calculado quedó por debajo del umbral mínimo. Se marcó para revisión manual.",
        ),
        AuditModel(
            id=104,
            timestamp=datetime(2026, 4, 25, 12, 42),
            module="Enrichment",
            decision="Datos incompletos",
            estado="ERROR",
            anomaly=True,
            source="Enrichment API",
            original_value=0.0,
            computed_value=0.0,
            rule="Validación de atributos",
            detail="Faltó atributo de categoría y el registro quedó en estado de error para corrección.",
        ),
        AuditModel(
            id=105,
            timestamp=datetime(2026, 4, 25, 13, 15),
            module="Pricing",
            decision="Precio validado",
            estado="APROBADO",
            anomaly=False,
            source="IA Pricing",
            original_value=48.0,
            computed_value=50.4,
            rule="Margen objetivo",
            detail="Se mantuvo el margen objetivo tras revisión de costos y demanda esperada.",
        ),
    ]

    db.add_all(initial_audits)
    db.commit()


def list_audits(db: Session, q: str = "", estado: str = "") -> List[AuditModel]:
    query = db.query(AuditModel)
    if estado:
        query = query.filter(AuditModel.estado == estado)
    if q:
        term = f"%{q}%"
        query = query.filter(
            or_(
                AuditModel.module.ilike(term),
                AuditModel.decision.ilike(term),
                AuditModel.source.ilike(term),
                AuditModel.rule.ilike(term),
            )
        )
    return query.order_by(AuditModel.timestamp.desc()).all()


def get_audit(db: Session, audit_id: int) -> Optional[AuditModel]:
    return db.query(AuditModel).filter(AuditModel.id == audit_id).first()


def create_audit(db: Session, *, module: str, decision: str, estado: str, source: str,
                 original_value: float, computed_value: float, anomaly: bool = False,
                 rule: Optional[str] = None, detail: Optional[str] = None,
                 timestamp: Optional[datetime] = None) -> AuditModel:
    if timestamp is None:
        timestamp = datetime.utcnow()

    # Detección automática de anomalías
    if not anomaly:
        anomaly = detect_anomaly(module, original_value, computed_value)

    if anomaly and estado == "APROBADO":
        estado = "ANOMALÍA"

    audit = AuditModel(
        module=module,
        decision=decision,
        estado=estado,
        source=source,
        original_value=original_value,
        computed_value=computed_value,
        anomaly=anomaly,
        rule=rule,
        detail=detail,
        timestamp=timestamp,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


def detect_anomaly(module: str, original_value: float, computed_value: float) -> bool:
    if module == "Pricing":
        # Anomalía si precio calculado < 50% del original o < mínimo absoluto
        return computed_value < max(original_value * 0.5, 10.0)
    elif module == "Enrichment":
        # Ya manejado en el cliente, pero fallback
        return False
    return False
