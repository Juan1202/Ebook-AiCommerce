# E2E Flow — BookFlow Sprint 3

Documentación completa del flujo End-to-End del comercio electrónico de libros con integración de Carrito y Órdenes.

---

## ✅ Servicios Integrados

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| auth-service | 8001 | Autenticación JWT |
| inventory-service | 8002 | Gestión de stock |
| catalog-service | 8003 | Catálogo de libros |
| ai-enrichment-service | 8004 | Enriquecimiento de datos IA |
| pricing-service | 8005 | Cálculo de precios |
| **cart-service** | **8010** | **🆕 Carrito persistente** |
| **order-service** | **8011** | **🆕 Gestión de órdenes** |
| bff-gateway | 8009 | API Gateway central |
| admin-frontend | 3001 | Panel admin |
| commercial-frontend | 3000 | Tienda de clientes |

---

## 🚀 Inicio Rápido

### 1. Preparar Entorno

```bash
# Clonar o actualizar repo
git clone https://github.com/Juan1202/Ebook-AiCommerce.git
cd Ebook-AiCommerce

# Checkout rama dev
git checkout dev

# Crear archivo .env
cp .env.example .env

# Limpiar volúmenes antiguos (IMPORTANTE - actualización de schema)
docker compose down -v --rmi all
```

### 2. Levantar Servicios

```bash
# Construir e iniciar todo
docker compose up --build

# En otra terminal, verificar health
curl http://localhost:8009/health
```

Esperar ~30 segundos a que todas las bases de datos estén listas.

### 3. Verificar Servicios

```bash
# Todos los servicios disponibles
curl http://localhost:8009/health | jq .

# Debería mostrar:
{
  "status": "ok",
  "service": "bff-gateway",
  "version": "2.0.0",
  "services": {
    "auth": {"status": "ok"},
    "inventory": {"status": "ok"},
    "catalog": {"status": "ok"},
    "enrichment": {"status": "ok"},
    "enrichment-real": {"status": "ok"},
    "pricing": {"status": "ok"},
    "cart": {"status": "ok"},        # ← NUEVO
    "order": {"status": "ok"},       # ← NUEVO
    "quality": {"status": "ok"},
    "config": {"status": "ok"}
  }
}
```

---

## 📋 Flujo Completo Paso a Paso

### PASO 1: Autenticación (1-2 min)

**Objetivo:** Obtener token JWT

```http
POST http://localhost:8009/api/auth/login
Content-Type: application/x-www-form-urlencoded

username=john&password=doe
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

**Guardar token como:**
```
TOKEN = eyJhbGciOiJIUzI1NiIs...
```

**Nota:** Si no funciona, usar token mock:
```http
GET http://localhost:8009/api/auth/mock-token
```

---

### PASO 2: Ver Catálogo (1-2 min)

**Objetivo:** Obtener lista de libros disponibles

```http
GET http://localhost:8009/api/catalog/books?published_only=true
Authorization: Bearer ${TOKEN}
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565",
    "price": 1299,
    "stock": 15,
    "condition": "new",
    "published_flag": true,
    "cover_url": "..."
  },
  ...
]
```

**Guardar IDs de libros a usar:**
```
BOOK_1_ID = 1
BOOK_2_ID = 2
```

---

### PASO 3: Ver Detalle de Libro (1-2 min)

**Objetivo:** Obtener información completa de un libro con pricing y enrichment

```http
GET http://localhost:8009/api/catalog/books/1
Authorization: Bearer ${TOKEN}
```

**Respuesta:**
```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "description": "A classic novel...",
  "price": 1299,
  "stock": 15,
  "cover_url": "...",
  "enriched_flag": true
}
```

---

### PASO 4: Obtener Precios Sugeridos (1-2 min)

**Objetivo:** Verificar precio según condición del libro

```http
GET http://localhost:8009/api/pricing/1
Authorization: Bearer ${TOKEN}
```

**Respuesta:**
```json
{
  "id": 1,
  "book_id": 1,
  "condition": "NUEVO",
  "base_price": 1299,
  "condition_factor": 1.0,
  "suggested_price": 1299,
  "source": "fallback",
  "explanation": "Base price used (no external references)"
}
```

---

### PASO 5: Verificar Stock/Inventario (1-2 min)

**Objetivo:** Confirmar disponibilidad real en inventory

```http
GET http://localhost:8009/api/inventory/availability/978-0743273565
Authorization: Bearer ${TOKEN}
```

**Respuesta:**
```json
{
  "book_reference": "978-0743273565",
  "quantity_available": 15,
  "is_available": true
}
```

---

### PASO 6: Crear Carrito y Agregar Items (2-3 min)

**Objetivo:** Crear carrito persistente en backend

```http
POST http://localhost:8009/api/cart/user-123/items
Authorization: Bearer ${TOKEN}
Content-Type: application/json

{
  "book_id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "price": 1299,
  "quantity": 2,
  "condition": "NUEVO"
}
```

**Respuesta:**
```json
{
  "id": "user-123",
  "items": [
    {
      "book_id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "price": 1299,
      "quantity": 2,
      "condition": "NUEVO",
      "added_at": "2024-05-20T..."
    }
  ],
  "total_items": 2,
  "total_price": 2598,
  "created_at": "2024-05-20T...",
  "updated_at": "2024-05-20T..."
}
```

**Guardar CART_ID:**
```
CART_ID = user-123
```

---

### PASO 7: Agregar Más Items (1-2 min)

**Objetivo:** Agregar segundo libro al carrito

```http
POST http://localhost:8009/api/cart/user-123/items
Authorization: Bearer ${TOKEN}
Content-Type: application/json

{
  "book_id": 2,
  "title": "1984",
  "author": "George Orwell",
  "price": 1499,
  "quantity": 1,
  "condition": "BUENO"
}
```

**Respuesta:**
```json
{
  "id": "user-123",
  "items": [
    {
      "book_id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "price": 1299,
      "quantity": 2,
      "condition": "NUEVO"
    },
    {
      "book_id": 2,
      "title": "1984",
      "author": "George Orwell",
      "price": 1499,
      "quantity": 1,
      "condition": "BUENO"
    }
  ],
  "total_items": 3,
  "total_price": 4397,
  "created_at": "2024-05-20T...",
  "updated_at": "2024-05-20T..."
}
```

---

### PASO 8: Ver Carrito (1 min)

**Objetivo:** Verificar contenido del carrito

```http
GET http://localhost:8009/api/cart/user-123
Authorization: Bearer ${TOKEN}
```

---

### PASO 9: CREAR ORDEN (3-5 min)

**Objetivo:** Convertir carrito a orden y procesar

```http
POST http://localhost:8009/api/order
Authorization: Bearer ${TOKEN}
Content-Type: application/json

{
  "user_id": "user-123",
  "items": [
    {
      "book_id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "price": 1299,
      "quantity": 2,
      "condition": "NUEVO"
    },
    {
      "book_id": 2,
      "title": "1984",
      "author": "George Orwell",
      "price": 1499,
      "quantity": 1,
      "condition": "BUENO"
    }
  ],
  "shipping_address": "Calle Principal 123, Ciudad, País",
  "notes": "Entregar entre 9-17hs"
}
```

**Respuesta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-123",
  "status": "pending",
  "payment_status": "pending",
  "items": [
    {
      "book_id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "price": 1299,
      "quantity": 2,
      "condition": "NUEVO",
      "subtotal": 2598
    },
    {
      "book_id": 2,
      "title": "1984",
      "author": "George Orwell",
      "price": 1499,
      "quantity": 1,
      "condition": "BUENO",
      "subtotal": 1499
    }
  ],
  "total_price": 4097,
  "shipping_address": "Calle Principal 123, Ciudad, País",
  "notes": "Entregar entre 9-17hs",
  "created_at": "2024-05-20T...",
  "updated_at": "2024-05-20T..."
}
```

**Guardar ORDER_ID:**
```
ORDER_ID = 550e8400-e29b-41d4-a716-446655440000
```

---

### PASO 10: Confirmar Pago (1-2 min)

**Objetivo:** Procesar pago (mock) y confirmar orden

```http
POST http://localhost:8009/api/order/550e8400-e29b-41d4-a716-446655440000/confirm
Authorization: Bearer ${TOKEN}
```

**Respuesta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-123",
  "status": "confirmed",
  "payment_status": "completed",
  "items": [...],
  "total_price": 4097,
  "shipping_address": "Calle Principal 123, Ciudad, País",
  "created_at": "2024-05-20T...",
  "updated_at": "2024-05-20T..."
}
```

---

### PASO 11: Ver Detalle de Orden (1 min)

**Objetivo:** Verificar datos de la orden creada

```http
GET http://localhost:8009/api/order/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer ${TOKEN}
```

---

### PASO 12: Ver Órdenes del Usuario (1 min)

**Objetivo:** Listar todas las órdenes de un usuario

```http
GET http://localhost:8009/api/order/user/user-123
Authorization: Bearer ${TOKEN}
```

**Respuesta:**
```json
{
  "user_id": "user-123",
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-123",
      "status": "confirmed",
      "payment_status": "completed",
      "items": [...],
      "total_price": 4097,
      "created_at": "2024-05-20T..."
    }
  ],
  "count": 1
}
```

---

## 🧪 Validaciones Críticas

Después de completar el flujo, verificar que:

### ✓ Consistencia de Datos

```bash
# 1. Precio en catálogo = Precio en orden
curl http://localhost:8009/api/catalog/books/1 | jq .price
curl http://localhost:8009/api/order/ORDER_ID | jq .items[0].price

# Deben ser iguales: 1299

# 2. Stock se refleja en inventory
curl http://localhost:8009/api/inventory/availability/978-0743273565

# 3. Total de carrito = Total de orden
# Carrito: total_price = 4397 (con 2 items de $1299 + 1 de $1499)
```

### ✓ Estados Correctos

```bash
# Orden debe estar confirmed y payment_status completed
curl http://localhost:8009/api/order/ORDER_ID | jq '.status, .payment_status'

# Respuesta esperada:
# "confirmed"
# "completed"
```

### ✓ Persistencia

```bash
# Carrito debe persistir en BD
curl http://localhost:8009/api/cart/user-123

# Orden debe persistir en BD
curl http://localhost:8009/api/order/ORDER_ID
```

---

## 🧪 Casos de Error (Manejo)

### Error 1: Carrito Vacío

```http
POST http://localhost:8009/api/order
Content-Type: application/json

{
  "user_id": "user-123",
  "items": [],
  "shipping_address": "..."
}
```

**Esperado:** `400 Bad Request - Error creating order: Validation error`

### Error 2: Stock Insuficiente

```http
POST http://localhost:8009/api/order
Content-Type: application/json

{
  "user_id": "user-123",
  "items": [
    {
      "book_id": 1,
      "title": "The Great Gatsby",
      "price": 1299,
      "quantity": 9999,
      "condition": "NUEVO"
    }
  ],
  "shipping_address": "..."
}
```

**Nota:** Orden se crea pero inventory no reserva (en fase mock)

### Error 3: Libro No Existe

```http
POST http://localhost:8009/api/catalog/books/99999
Authorization: Bearer ${TOKEN}
```

**Esperado:** `404 Not Found`

### Error 4: Cancelar Orden Entregada

```http
POST http://localhost:8009/api/order/ORDER_ID/cancel
Authorization: Bearer ${TOKEN}
```

**Si status = "delivered":**
```json
{
  "detail": "Cannot cancel delivered order"
}
```

---

## 📊 Datos Semilla Disponibles

El sistema crea automáticamente 18 libros con stock variado:

```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565",
    "stock": 15,
    "price": 1299,
    "condition": "new"
  },
  ...
]
```

Todos con stock >0 y precios entre $5-$20 (500-2000 centavos).

---

## 🔧 Troubleshooting

### Q: "Service unavailable" en /api/cart o /api/order

**R:** Los servicios pueden no estar completamente levantados. Esperar 30 segundos y reintentar.

```bash
# Verificar logs
docker logs cart-service
docker logs order-service
```

### Q: "Database connection refused"

**R:** Las BDs pueden no estar listas. Ver logs:

```bash
docker logs cart-db
docker logs order-db
```

### Q: Errores de schema/tablas

**R:** Ejecutar limpieza completa:

```bash
docker compose down -v --rmi all
docker compose up --build
```

### Q: Endpoint /api/cart retorna 404

**R:** BFF Gateway no tiene SERVICE_MAP actualizado. Verificar `bff-gateway/app/proxy.py`:

```python
SERVICE_MAP = {
    ...
    "cart": os.getenv("CART_SERVICE_URL", "http://cart-service:8010"),
    "order": os.getenv("ORDER_SERVICE_URL", "http://order-service:8011"),
    ...
}
```

---

## 📚 Referencias Técnicas

### Arquitectura de Servicios

```
┌─────────────────────────────────────────┐
│        Commercial Frontend :3000        │
│              Tienda de Clientes         │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼─────────────┐
        │   BFF Gateway :8009  │  ← Proxy Central
        │   (Routing Hub)      │
        └┬──────────┬───────┬──┬────┬──────┐
         │          │       │  │    │      │
    ┌────▼───┐  ┌───▼──┐ ┌─▼──▼┐ ┌▼──┐ ┌─▼────┐
    │ Auth   │  │Cat   │ │ Inv │ │Pri│ │Cart  │
    │ :8001  │  │ :8003│ │:8002│ │:8│ │:8010 │
    └────────┘  └──────┘ └─────┘ │05│ └──────┘
                                  │  │  ┌───────┐
                                  └──┼─▶│Order  │
                                     │  │:8011  │
                                  ┌─▼──┐└───────┘
                                  │Enri│
                                  │:804│
                                  └────┘
                 ┌────────────────┬─────────────┐
                 │                │             │
            ┌────▼──┐        ┌────▼──┐   ┌────▼──┐
            │auth_db│        │cat_db │   │inv_db │
            └───────┘        └───────┘   └───────┘
```

### Flujo de Datos - End-to-End

```
1. Usuario accede frontend :3000
   ↓
2. Frontend hace POST /api/auth/login → obtiene TOKEN
   ↓
3. Frontend GET /api/catalog/books → lista libros
   ↓
4. Usuario selecciona libro y ve detalles + precios
   ↓
5. Usuario agrega al carrito → POST /api/cart/{user_id}/items
   ↓
6. Carrito persistido en cart-service DB
   ↓
7. Usuario finaliza compra → POST /api/order (con items del carrito)
   ↓
8. Order Service crea orden en order-service DB
   ↓
9. Order Service intenta reservar en inventory-service (opcional)
   ↓
10. Usuario confirma pago → POST /api/order/{id}/confirm
    ↓
11. Order Status = "confirmed", Payment Status = "completed"
    ↓
12. Usuario puede ver /api/order/{id} o /api/order/user/{id}
    ↓
13. Admin puede ver todas las órdenes en admin-frontend :3001
```

---

## 📝 Endpoints Resumen Rápido

| Servicio | Endpoint | Método | Descripción |
|----------|----------|--------|-------------|
| **Auth** | `/api/auth/login` | POST | Login |
| **Auth** | `/api/auth/mock-token` | GET | Token para dev |
| **Catalog** | `/api/catalog/books` | GET | Listar libros |
| **Catalog** | `/api/catalog/books/{id}` | GET | Detalle libro |
| **Inventory** | `/api/inventory/availability/{ref}` | GET | Verificar stock |
| **Pricing** | `/api/pricing/{book_id}` | GET | Obtener precio |
| **Cart** | `/api/cart/{cart_id}` | GET | Ver carrito |
| **Cart** | `/api/cart/{cart_id}/items` | POST | Agregar item |
| **Cart** | `/api/cart/{cart_id}/items/{book_id}` | PUT | Actualizar cantidad |
| **Cart** | `/api/cart/{cart_id}/items/{book_id}` | DELETE | Quitar item |
| **Order** | `/api/order` | POST | Crear orden |
| **Order** | `/api/order/{order_id}` | GET | Ver orden |
| **Order** | `/api/order/user/{user_id}` | GET | Órdenes del usuario |
| **Order** | `/api/order/{order_id}/confirm` | POST | Confirmar pago |
| **Order** | `/api/order/{order_id}/cancel` | POST | Cancelar orden |

---

## 🎯 Próximas Mejoras

- [ ] Integración real con Payment Gateway
- [ ] Notificaciones por email
- [ ] Tracking de envío en tiempo real
- [ ] Sistema de devoluciones
- [ ] Descuentos y cupones
- [ ] Wishlist
- [ ] Reviews y ratings
- [ ] Búsqueda avanzada con filtros
