from typing import List, Optional

from sqlalchemy.orm import Session

from app.domain.config_param import ConfigParam
from app.infrastructure import config_repository


def list_params(db: Session) -> List[ConfigParam]:
    config_repository.seed_defaults(db)
    return config_repository.get_all(db)


def get_param(db: Session, key: str) -> Optional[ConfigParam]:
    return config_repository.get_by_key(db, key)


def list_by_category(db: Session, category: str) -> List[ConfigParam]:
    return config_repository.get_by_category(db, category)


def upsert_param(db: Session, key: str, value: str, description: str = None, category: str = "general") -> ConfigParam:
    return config_repository.upsert(db, key, value, description, category)
