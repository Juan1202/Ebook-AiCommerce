from dataclasses import dataclass
from datetime import datetime
from typing import Optional

DEFAULT_PARAMS = [
    {"key": "max_upload_size_mb",       "value": "10",          "description": "Tamaño máximo de archivo de inventario en MB",          "category": "inventory"},
    {"key": "allowed_file_extensions",  "value": "csv,xlsx,xls","description": "Extensiones de archivo permitidas para inventario",     "category": "inventory"},
    {"key": "max_batch_rows",           "value": "5000",         "description": "Máximo de filas por lote de inventario",               "category": "inventory"},
    {"key": "catalog_page_size",        "value": "20",           "description": "Número de productos por página en catálogo",           "category": "catalog"},
    {"key": "enrichment_timeout_secs",  "value": "30",           "description": "Timeout para servicio de enriquecimiento IA (seg)",    "category": "ai"},
    {"key": "pricing_fallback_enabled", "value": "true",         "description": "Habilitar cálculo de precio con fallback interno",     "category": "pricing"},
    {"key": "jwt_expiry_hours",         "value": "24",           "description": "Horas de expiración del token JWT",                   "category": "auth"},
]


@dataclass
class ConfigParam:
    id: Optional[int]
    key: str
    value: str
    description: Optional[str]
    category: str
    is_active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
