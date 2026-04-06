# BookFlow AI Commerce — Sprint 1

Plataforma inteligente de catalogación, pricing competitivo y venta de libros.

## Arquitectura — Sprint 1 (Base Arquitectónica y Operativa)

```
Usuario
  └─► commercial-frontend :3000   (catálogo web)
  └─► admin-frontend      :3001   (panel admin)
         └─► bff-gateway  :8009   (API Gateway)
               ├─► auth-service         :8001  → auth_db
               ├─► inventory-service    :8002  → inventory_db
               ├─► catalog-service      :8003  → catalog_db
               ├─► ai-enrichment-mock   :8006  (sin DB, mock)
               ├─► data-quality-module  :8007  (proxy inventario)
               └─► config-module        :8008  → config_db
```

## Inicio rápido

### Opción A — Docker Compose (recomendado)
```bash
docker-compose up --build
```

### Opción B — Servicios individuales (desarrollo)

Cada servicio corre de forma independiente:

```bash
# Auth Service
cd auth-service && pip install -r requirements.txt
DATABASE_URL="postgresql://user:pass@localhost:5432/auth_db" uvicorn app.main:app --port 8001

# Inventory Service
cd inventory-service && pip install -r requirements.txt
DATABASE_URL="postgresql://user:pass@localhost:5432/inventory_db" uvicorn app.main:app --port 8002

# Catalog Service
cd catalog-service && pip install -r requirements.txt
DATABASE_URL="postgresql://user:pass@localhost:5432/catalog_db" uvicorn app.main:app --port 8003

# AI Enrichment Mock (no necesita DB)
cd ai-enrichment-mock && pip install -r requirements.txt
uvicorn app.main:app --port 8006

# Data Quality Module (no necesita DB)
cd data-quality-module && pip install -r requirements.txt
uvicorn app.main:app --port 8007

# Config Module
cd config-module && pip install -r requirements.txt
DATABASE_URL="postgresql://user:pass@localhost:5432/config_db" uvicorn app.main:app --port 8008

# BFF Gateway
cd bff-gateway && pip install -r requirements.txt
uvicorn app.main:app --port 8009

# Admin Frontend
cd admin-frontend && npm install && npm run dev  # → http://localhost:3001

# Commercial Frontend
cd commercial-frontend && npm install && npm run dev  # → http://localhost:3000
```

## Puertos

| Servicio             | Puerto | URL Docs                          |
|----------------------|--------|-----------------------------------|
| commercial-frontend  | 3000   | http://localhost:3000             |
| admin-frontend       | 3001   | http://localhost:3001             |
| auth-service         | 8001   | http://localhost:8001/docs        |
| inventory-service    | 8002   | http://localhost:8002/docs        |
| catalog-service      | 8003   | http://localhost:8003/docs        |
| ai-enrichment-mock   | 8006   | http://localhost:8006/docs        |
| data-quality-module  | 8007   | http://localhost:8007/docs        |
| config-module        | 8008   | http://localhost:8008/docs        |
| bff-gateway          | 8009   | http://localhost:8009/docs        |

## Token de prueba (desarrollo local)

Para autenticación sin base de datos:
```bash
curl http://localhost:8001/auth/mock-token
# o via BFF:
curl http://localhost:8009/api/auth/mock-token
```

## Prueba del flujo completo

1. **Obtener token de prueba:**
   ```bash
   curl http://localhost:8009/api/auth/mock-token
   ```

2. **Cargar inventario de prueba:**
   ```bash
   curl -X POST http://localhost:8009/api/inventory/upload \
     -F "file=@sample_inventory.csv"
   ```

3. **Ver inventario cargado:**
   ```bash
   curl http://localhost:8009/api/inventory/items
   ```

4. **Crear libro en catálogo:**
   ```bash
   curl -X POST http://localhost:8009/api/catalog/books \
     -H "Content-Type: application/json" \
     -d '{"title":"Cien años de soledad","author":"García Márquez","isbn":"9780307474728"}'
   ```

5. **Enriquecer libro (mock):**
   ```bash
   curl -X POST http://localhost:8009/api/enrichment/book \
     -H "Content-Type: application/json" \
     -d '{"book_reference":"REF-001","title":"Cien años de soledad","author":"Gabriel García Márquez"}'
   ```

6. **Ver calidad de datos:**
   ```bash
   curl http://localhost:8009/api/quality/summary
   ```

7. **Estado de todos los servicios:**
   ```bash
   curl http://localhost:8009/api/services/status
   ```

## Aislamiento (Regla de oro Sprint 1)

Cada servicio puede ejecutarse de forma INDEPENDIENTE:
- Si el BFF no está disponible → los frontends usan datos **mock** automáticamente
- Si el Inventory Service no está disponible → el Data Quality Module devuelve datos **mock**
- El AI Enrichment Mock no depende de ningún servicio externo
- Todos los servicios backend exponen `/health` para verificación


## Tecnologías

- **Backend:** Python 3.11 + FastAPI + SQLAlchemy + PostgreSQL
- **Frontend:** React 18 + Vite
- **Arquitectura backend:** Hexagonal Ligera (routers → application → domain → infrastructure)
- **Contenedores:** Docker + Docker Compose
- **Autenticación:** JWT (python-jose + passlib)
- **Validación:** Pydantic v2
