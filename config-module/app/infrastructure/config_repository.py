from typing import List, Optional

from sqlalchemy.orm import Session

from app.domain.config_param import ConfigParam, DEFAULT_PARAMS
from app.infrastructure.database import ConfigParamModel


def _to_domain(m: ConfigParamModel) -> ConfigParam:
    return ConfigParam(
        id=m.id, key=m.key, value=m.value, description=m.description,
        category=m.category, is_active=m.is_active,
        created_at=m.created_at, updated_at=m.updated_at,
    )


def seed_defaults(db: Session):
    for p in DEFAULT_PARAMS:
        if not db.query(ConfigParamModel).filter(ConfigParamModel.key == p["key"]).first():
            db.add(ConfigParamModel(**p))
    db.commit()


def get_all(db: Session) -> List[ConfigParam]:
    return [_to_domain(m) for m in db.query(ConfigParamModel).filter(ConfigParamModel.is_active == True).all()]


def get_by_key(db: Session, key: str) -> Optional[ConfigParam]:
    m = db.query(ConfigParamModel).filter(ConfigParamModel.key == key).first()
    return _to_domain(m) if m else None


def get_by_category(db: Session, category: str) -> List[ConfigParam]:
    return [_to_domain(m) for m in db.query(ConfigParamModel).filter(
        ConfigParamModel.category == category, ConfigParamModel.is_active == True
    ).all()]


def upsert(db: Session, key: str, value: str, description: str = None, category: str = "general") -> ConfigParam:
    m = db.query(ConfigParamModel).filter(ConfigParamModel.key == key).first()
    if m:
        m.value = value
        if description:
            m.description = description
    else:
        m = ConfigParamModel(key=key, value=value, description=description, category=category)
        db.add(m)
    db.commit()
    db.refresh(m)
    return _to_domain(m)
