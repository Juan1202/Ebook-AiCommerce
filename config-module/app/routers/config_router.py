from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.application.config_use_cases import (
    get_param, list_by_category, list_params, upsert_param,
)
from app.infrastructure.database import get_db

router = APIRouter()


class ConfigResponse(BaseModel):
    id: Optional[int]
    key: str
    value: str
    description: Optional[str]
    category: str
    is_active: bool


class UpsertRequest(BaseModel):
    value: str
    description: Optional[str] = None
    category: str = "general"


def _resp(p) -> ConfigResponse:
    return ConfigResponse(id=p.id, key=p.key, value=p.value,
                          description=p.description, category=p.category, is_active=p.is_active)


@router.get("/", response_model=List[ConfigResponse])
def list_all(db: Session = Depends(get_db)):
    return [_resp(p) for p in list_params(db)]


@router.get("/category/{category}", response_model=List[ConfigResponse])
def by_category(category: str, db: Session = Depends(get_db)):
    return [_resp(p) for p in list_by_category(db, category)]


@router.get("/{key}", response_model=ConfigResponse)
def get_one(key: str, db: Session = Depends(get_db)):
    p = get_param(db, key)
    if not p:
        raise HTTPException(status_code=404, detail=f"Parámetro '{key}' no encontrado")
    return _resp(p)


@router.put("/{key}", response_model=ConfigResponse)
def update_one(key: str, req: UpsertRequest, db: Session = Depends(get_db)):
    return _resp(upsert_param(db, key, req.value, req.description, req.category))


@router.post("/", response_model=ConfigResponse, status_code=201)
def create_one(key: str, req: UpsertRequest, db: Session = Depends(get_db)):
    return _resp(upsert_param(db, key, req.value, req.description, req.category))
