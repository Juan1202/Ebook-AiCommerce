# Pricing Service — BookFlow AI Commerce

Motor de precios inteligente que calcula precios sugeridos trazables para libros. Cada decisión queda registrada con su desglose explicable.

**Puerto:** 8005  
**Sprint:** 2  
**Base de datos:** `pricing_db` (PostgreSQL)

---

## Descripción

El Pricing Service calcula el precio sugerido de venta para un ejemplar dado su ISBN, condición física y año de publicación. Consulta referencias externas (eBay Browse API) y aplica reglas internas como fallback. Toda decisión queda persistida con su explicación en texto legible.

---

## Arquitectura

```
pricing-service/
├── app/
│   ├── routers/
│   │   └── pricing_router.py       # HTTP routes, sin lógica de negocio
│   ├── application/
│   │   └── use_cases/
│   │       └── calculate_price.py  # Orquestación del cálculo
│   ├── domain/
│   │   └── entities/
│   │       └── pricing.py          # Entidades puras (sin FastAPI/SQLAlchemy)
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   ├── models.py
│   │   │   └── repositories/
│   │   └── adapters/
│   │       └── ebay_adapter.py     # Integración eBay Browse API
│   └── main.py
├── tests/
│   ├── unit/
│   └── integration/
├── alembic/
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## Endpoints

### `POST /pricing/calculate`

Calcula el precio sugerido para un libro.

**Request:**
```json
{
  "book_id": "550e8400-e29b-41d4-a716-446655440000",
  "isbn": "9780141439518",
  "title": "Great Expectations",
  "condition": "BUENO",
  "publication_year": 2010
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `book_id` | string (UUID) | Sí | Identificador del libro |
| `isbn` | string | No | ISBN-13 del libro |
| `title` | string | No | Título (usado si no hay ISBN) |
| `condition` | enum | Sí | `NUEVO`, `BUENO`, `ACEPTABLE`, `DETERIORADO` |
| `publication_year` | int | No | Año de publicación |

**Response 200:**
```json
{
  "book_id": "550e8400-e29b-41d4-a716-446655440000",
  "suggested_price": 9.38,
  "currency": "USD",
  "explanation": "Precio calculado con base en 3 referencias de eBay (promedio: $12.50). Factor de condición BUENO aplicado (0.75). Precio base: $12.50. Precio final sugerido: $9.38.",
  "source": "ebay",
  "condition_factor": 0.75,
  "base_price": 12.50,
  "references_found": 3,
  "is_fallback": false,
  "calculated_at": "2026-04-12T10:00:00Z"
}
```

---

### `GET /pricing/{book_id}`

Consulta el último precio calculado para un libro.

**Response 200:** mismo schema que `POST /pricing/calculate`  
**Response 404:** `{"detail": "No pricing decision found for book {book_id}"}`

---

### `GET /pricing/{book_id}/history`

Historial de todas las decisiones de precio para un libro.

**Response 200:**
```json
[
  {
    "book_id": "550e8400-...",
    "suggested_price": 9.38,
    "source": "ebay",
    "is_fallback": false,
    "calculated_at": "2026-04-12T10:00:00Z"
  },
  {
    "book_id": "550e8400-...",
    "suggested_price": 6.00,
    "source": "internal_rules",
    "is_fallback": true,
    "calculated_at": "2026-04-10T08:30:00Z"
  }
]
```

---

### `GET /pricing/{book_id}/explanation`

Desglose completo del cálculo con referencias individuales.

**Response 200:**
```json
{
  "book_id": "550e8400-...",
  "suggested_price": 9.38,
  "explanation": "Precio calculado con base en 3 referencias de eBay...",
  "condition_factor": 0.75,
  "base_price": 12.50,
  "adjustment_reasons": ["Ajuste por libro descatalogado: +10%"],
  "references": [
    {"source": "ebay", "external_price": 11.00, "confidence_score": 0.9},
    {"source": "ebay", "external_price": 13.00, "confidence_score": 0.85},
    {"source": "ebay", "external_price": 13.50, "confidence_score": 0.8}
  ]
}
```

---

### `GET /pricing/external-apis/status`

Estado del circuit breaker de eBay.

**Response 200:**
```json
{
  "ebay": {
    "status": "healthy",
    "failure_count": 0,
    "is_open": false,
    "last_failure": null
  }
}
```

---

### `GET /health`

**Response 200:**
```json
{
  "status": "ok",
  "service": "pricing-service",
  "version": "2.0.0"
}
```

---

## Lógica de Precios

### Factores de condición

| Condición | Factor | Efecto |
|-----------|--------|--------|
| `NUEVO` | 1.00 | Precio de referencia completo |
| `BUENO` | 0.75 | 75% del precio de referencia |
| `ACEPTABLE` | 0.50 | 50% del precio de referencia |
| `DETERIORADO` | 0.25 | 25% del precio de referencia |

### Flujo de cálculo

```
1. Consultar eBay Browse API (categoria Books & Magazines)
   ├── Éxito → calcular promedio de precios encontrados
   └── Falla (timeout/error/circuit breaker abierto)
       └── Aplicar reglas internas (fallback)
           ├── publication_year >= 2024 → base $20.00
           ├── publication_year >= 2016 → base $12.00
           └── publication_year <  2016 → base $8.00

2. Si libro tiene >10 años → ajuste backlist +10%

3. Aplicar factor de condición:
   precio_sugerido = precio_base × factor_condición

4. Aplicar límites:
   ├── Mínimo absoluto: $1.00
   └── Máximo: 3× el precio de referencia promedio

5. Persistir PricingDecision con explicación
```

### Circuit Breaker — eBay

- Se abre tras **5 fallos consecutivos**
- Permanece abierto **5 minutos** (300 segundos)
- Durante ese tiempo: retorna `is_fallback=true` inmediatamente
- Se cierra automáticamente al vencer el cooldown

---

## Variables de entorno

```env
# Base de datos
DATABASE_URL=postgresql://bookflow:bookflow@pricing-db:5432/pricing_db

# eBay Browse API
EBAY_APP_ID=TU_EBAY_APP_ID_AQUI
EBAY_BASE_URL=https://api.ebay.com/buy/browse/v1

# Servicios relacionados
CATALOG_SERVICE_URL=http://catalog-service:8001
INVENTORY_SERVICE_URL=http://inventory-service:8002

# Puerto
SERVICE_PORT=8005
```

Copiar desde `.env.example` y completar con credenciales del equipo.

---

## Cómo ejecutar

### Con Docker Compose (recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up pricing-service pricing-db

# Verificar que levantó
curl http://localhost:8005/health
```

### Localmente (desarrollo)

```bash
cd pricing-service

# Crear entorno virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con valores locales

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload --port 8005
```

---

## Cómo ejecutar los tests

```bash
cd pricing-service

# Todos los tests
pytest tests/ -v

# Solo tests unitarios
pytest tests/unit/ -v

# Solo tests de integración
pytest tests/integration/ -v

# Con cobertura
pytest --cov=app --cov-report=term-missing

# Tests específicos
pytest tests/unit/test_calculate_price.py::test_calculate_price_new_book_with_references -v
```

### Tests obligatorios

| Test | Descripción |
|------|-------------|
| `test_calculate_price_new_book_with_references` | Libro nuevo con referencias de eBay |
| `test_calculate_price_used_book_condition_factor_applied` | Factor de condición aplicado correctamente |
| `test_fallback_when_ebay_unavailable` | Reglas internas cuando eBay no responde |
| `test_minimum_price_never_below_threshold` | Precio mínimo absoluto $1.00 |
| `test_explanation_text_generated_correctly` | Campo explanation generado en español |
| `test_pricing_decision_persisted_with_full_traceability` | Persistencia completa en DB |
| `test_condition_factor_deteriorated_applies_correctly` | Factor 0.25 aplicado correctamente |

---

## Modelos de dominio

### `PriceReference`
Referencia de precio encontrada en fuente externa.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `book_reference` | string | ISBN o título usado como referencia |
| `source` | string | Fuente (`ebay`) |
| `external_price` | float | Precio encontrado |
| `currency` | string | Moneda (`USD`) |
| `confidence_score` | float | Confianza de la referencia (0-1) |
| `observed_at` | datetime | Momento de observación |

### `PricingDecision`
Decisión de precio persistida con trazabilidad completa.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `book_reference` | string | Referencia del libro |
| `suggested_price` | float | Precio sugerido final |
| `currency` | string | Moneda |
| `explanation` | string | **Obligatorio** — texto explicativo en español |
| `condition_factor` | float | Factor aplicado |
| `base_price` | float | Precio antes de aplicar factor |
| `reference_count` | int | Número de referencias usadas |
| `adjustment_reasons` | list[str] | Razones de ajuste adicionales |
| `is_fallback` | bool | `true` si se usaron reglas internas |
| `source` | string | `ebay` o `internal_rules` |
| `created_at` | datetime | Timestamp de creación |

---

## Integración con otros servicios

- **No expone datos directamente a frontends** — todo pasa por el BFF (`http://localhost:8000`)
- **BFF rutas de admin:** `GET /api/admin/pricing`, `POST /api/admin/pricing/recalculate`, `GET /api/admin/pricing/{id}/history`
- Este servicio no consume otros microservicios internos en el flujo de cálculo

---

## Migraciones Alembic

```bash
# Crear nueva migración
alembic revision --autogenerate -m "descripcion"

# Aplicar migraciones pendientes
alembic upgrade head

# Ver historial
alembic history

# Revertir última migración
alembic downgrade -1
```

Migraciones del Sprint 2:
- `001_create_price_reference.py`
- `002_create_pricing_decision.py`
