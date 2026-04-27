# BookFlow AI Commerce

Plataforma inteligente de catalogación, pricing competitivo y venta de libros usados y nuevos.

---

## Sprints

| Sprint | Estado | Descripción |
|--------|--------|-------------|
| Sprint 1 | Completado | Base arquitectónica: auth, inventory, catalog, BFF, frontends, calidad de datos |
| Sprint 2 | Completado | Motor de IA: pricing trazable, enriquecimiento real, catálogo enriquecido, UI de precios |

---

## Arquitectura — Sprint 2 (actual)

```
Usuario
  └─► commercial-frontend  :3000   (catálogo enriquecido con precios)
  └─► admin-frontend        :3001   (panel admin + gestión de precios)
         └─► bff-gateway    :8009   (API Gateway único)
               ├─► auth-service            :8001  → auth_db
               ├─► inventory-service       :8002  → inventory_db
               ├─► catalog-service         :8003  → catalog_db
               ├─► ai-enrichment-service   :8004  → enrichment_db  ← NUEVO Sprint 2
               ├─► pricing-service         :8005  → pricing_db     ← NUEVO Sprint 2
               ├─► ai-enrichment-mock      :8006  (mock Sprint 1, aún activo)
               ├─► data-quality-module     :8007  (proxy inventario)
               └─► config-module           :8008  → config_db
```

---

## Inicio rápido

### Requisitos previos

- Docker Desktop instalado y corriendo
- Git

### Primera vez (setup completo)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Juan1202/Ebook-AiCommerce.git
cd Ebook-AiCommerce

# 2. Estar en la rama de desarrollo
git checkout dev

# 3. Crear el archivo de variables de entorno
cp .env.example .env
# Editar .env si tienes API keys (ver sección Variables de entorno)

# 4. Construir y levantar todo
docker compose up --build
```

Al iniciar, el `catalog-service` puebla automáticamente la base de datos con 18 libros de muestra.

### Actualizar desde git (si ya tienes el proyecto)

```bash
git pull origin dev

# Limpiar volúmenes anteriores (obligatorio al actualizar esquemas de BD)
docker compose down -v --rmi all

docker compose up --build
```

> Si no limpias los volúmenes al actualizar, las bases de datos antiguas persisten
> con esquemas desactualizados y los nuevos servicios del Sprint 2 fallarán al iniciar.

### Levantar sin rebuild (veces siguientes)

```bash
docker compose up
```

---

## Variables de entorno

Copia `.env.example` como `.env`. Los servicios funcionan **sin API keys** usando fallbacks internos:

| Variable | Descripción | Sin key |
|----------|-------------|---------|
| `GOOGLE_BOOKS_API_KEY` | Google Books API (enriquecimiento) | Usa Open Library + Crossref |
| `EBAY_APP_ID` | eBay Browse API (referencias de precio) | Usa reglas internas de precio |

Las API keys opcionales mejoran la calidad de los resultados pero no son necesarias para correr el sistema.

---

## Verificar que todo está corriendo

```bash
# Estado general de todos los servicios
curl http://localhost:8009/health

# Servicios Sprint 2
curl http://localhost:8004/health   # AI Enrichment
curl http://localhost:8005/health   # Pricing
```

Respuesta esperada del BFF:
```json
{
  "status": "ok",
  "service": "bff-gateway",
  "version": "2.0.0",
  "services": {
    "auth": {"status": "ok"},
    "inventory": {"status": "ok"},
    "catalog": {"status": "ok"},
    "pricing": {"status": "ok"},
    "enrichment-real": {"status": "ok"},
    ...
  }
}
```

---

## Puertos

| Servicio | Puerto | Docs |
|----------|--------|------|
| commercial-frontend | 3000 | http://localhost:3000 |
| admin-frontend | 3001 | http://localhost:3001 |
| auth-service | 8001 | http://localhost:8001/docs |
| inventory-service | 8002 | http://localhost:8002/docs |
| catalog-service | 8003 | http://localhost:8003/docs |
| **ai-enrichment-service** | **8004** | http://localhost:8004/docs |
| **pricing-service** | **8005** | http://localhost:8005/docs |
| ai-enrichment-mock | 8006 | http://localhost:8006/docs |
| data-quality-module | 8007 | http://localhost:8007/docs |
| config-module | 8008 | http://localhost:8008/docs |
| bff-gateway | 8009 | http://localhost:8009/docs |

---

## Flujos principales

### Sprint 1 — Flujo base

**1. Obtener token de prueba:**
```bash
curl http://localhost:8009/api/auth/mock-token
```

**2. Cargar inventario:**
```bash
curl -X POST http://localhost:8009/api/inventory/upload \
  -F "file=@sample_inventory.csv"
```

**3. Ver inventario:**
```bash
curl http://localhost:8009/api/inventory/items
```

**4. Ver catálogo:**
```bash
curl http://localhost:8009/api/catalog/books
```

**5. Calidad de datos:**
```bash
curl http://localhost:8009/api/quality/summary
```

---

### Sprint 2 — Pricing e IA

**Calcular precio para un libro:**
```bash
curl -X POST http://localhost:8005/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "550e8400-e29b-41d4-a716-446655440001",
    "isbn": "9780141439518",
    "title": "Great Expectations",
    "condition": "BUENO",
    "publication_year": 2010
  }'
```

Respuesta:
```json
{
  "book_id": "550e8400-...",
  "suggested_price": 9.38,
  "currency": "USD",
  "explanation": "Precio calculado con base en 3 referencias de eBay (promedio: $12.50). Factor de condición BUENO aplicado (0.75). Precio sugerido: $9.38.",
  "source": "ebay",
  "condition_factor": 0.75,
  "is_fallback": false
}
```

**Enriquecer un libro con metadatos:**
```bash
curl -X POST http://localhost:8004/enrich \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "550e8400-e29b-41d4-a716-446655440001",
    "isbn": "9780141439518",
    "title": "Great Expectations",
    "author": "Charles Dickens"
  }'
```

Respuesta:
```json
{
  "request_id": "7b4e2a1c-...",
  "status": "completed",
  "normalized_title": "Great Expectations",
  "normalized_author": "Dickens, Charles",
  "cover_url": "https://books.google.com/...",
  "source_used": "google_books",
  "confidence_score": 0.95
}
```

**Ver precios vía BFF (admin):**
```bash
curl http://localhost:8009/api/admin/pricing/{book_id}
curl http://localhost:8009/api/admin/pricing/{book_id}/history
curl http://localhost:8009/api/admin/pricing/{book_id}/explanation
```

**Estado de APIs externas:**
```bash
curl http://localhost:8005/pricing/external-apis/status   # eBay
curl http://localhost:8004/external-apis/status           # Google Books / Open Library / Crossref
```

---

## Servicios Sprint 2 — resumen

### Pricing Service (`pricing-service/`)

Motor de precios inteligente y trazable.

- Consulta **eBay Browse API** para obtener referencias de precio de mercado
- Aplica **factores de condición**: NUEVO (1.0×), BUENO (0.75×), ACEPTABLE (0.50×), DETERIORADO (0.25×)
- **Fallback automático** con reglas internas si eBay no responde
- **Circuit breaker**: se abre tras 5 fallos consecutivos, cooldown de 5 minutos
- Toda decisión se persiste con `explanation` en español y trazabilidad completa
- Ver documentación detallada: [pricing-service/README.md](pricing-service/README.md)

### AI Enrichment Service (`ai-enrichment-service/`)

Enriquecimiento bibliográfico con APIs externas reales.

- Consulta **Google Books → Open Library → Crossref** en orden de prioridad
- **Módulo normalizer**: convierte autores a `Apellido, Nombre`, valida ISBN-10/13, fusiona resultados multi-fuente
- **Circuit breaker independiente** por cada API externa
- Si todas las fuentes fallan, devuelve datos parciales con `status: "failed"`
- Ver documentación detallada: [ai-enrichment-service/README.md](ai-enrichment-service/README.md)

---

## Estructura del repositorio

```
Ebook-AiCommerce/
├── admin-frontend/          # Panel administrativo (React)
├── commercial-frontend/     # Catálogo de ventas (React)
├── auth-service/            # Autenticación JWT (FastAPI)
├── inventory-service/       # Gestión de inventario (FastAPI)
├── catalog-service/         # Catálogo bibliográfico (FastAPI)
├── ai-enrichment-service/   # Enriquecimiento IA real — Sprint 2
├── pricing-service/         # Motor de precios — Sprint 2
├── ai-enrichment-mock/      # Mock enriquecimiento — Sprint 1
├── bff-gateway/             # API Gateway (FastAPI)
├── data-quality-module/     # Módulo de calidad de datos
├── config-module/           # Configuración centralizada
├── docker-compose.yml       # Orquestación completa
├── .env.example             # Plantilla de variables de entorno
└── sample_inventory.csv     # Datos de prueba para inventario
```

---

## Desarrollo local (sin Docker)

```bash
# Pricing Service
cd pricing-service && pip install -r requirements.txt
cp .env.example .env  # completar DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload --port 8005

# AI Enrichment Service
cd ai-enrichment-service && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8004

# Admin Frontend
cd admin-frontend && npm install && npm run dev    # → http://localhost:3001

# Commercial Frontend
cd commercial-frontend && npm install && npm run dev  # → http://localhost:3000
```

## Tests

```bash
# Pricing Service
cd pricing-service && pytest tests/ -v --cov=app --cov-report=term-missing

# AI Enrichment Service
cd ai-enrichment-service && pytest tests/ -v --cov=app --cov-report=term-missing
```

---

## Tecnologías

- **Backend:** Python 3.11 + FastAPI + SQLAlchemy 2.x + PostgreSQL 15
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Arquitectura backend:** Hexagonal ligera (routers → application → domain → infrastructure)
- **Contenedores:** Docker + Docker Compose
- **Autenticación:** JWT (python-jose + passlib)
- **Validación:** Pydantic v2
- **HTTP entre servicios:** httpx con timeout y circuit breaker
- **APIs externas:** Google Books, Open Library, Crossref, eBay Browse API
