# BFF Gateway Audit

Esta carpeta contiene el gateway BFF con un módulo de auditoría global.

## Endpoints de auditoría

- `GET /api/admin/audit/events` - Consulta de eventos registrados.
  - Query params: `event_type`, `category`, `service`, `path_contains`, `since`, `until`, `limit`, `offset`
- `POST /api/admin/audit/events` - Registra un evento arbitrario.
- `GET /api/admin/audit/statistics` - Estadísticas generales de eventos.

## Modelo de evento

Cada evento auditado almacena:

- `timestamp` - Fecha y hora UTC en formato ISO 8601
- `event_type` - Tipo de evento (por ejemplo, `pedido`, `consulta_ia`, `error`, `critical`)
- `category` - Clasificación (`business`, `technical`, `security`, `operational`)
- `service` - Servicio de origen o destino
- `path` - Ruta asociada
- `description` - Texto libre descriptivo
- `status_code` - Código de respuesta HTTP cuando aplica
- `metadata` - Metadatos adicionales en JSON

## Persistencia

Los eventos se almacenan en SQLite en `bff-gateway/audit.db` por defecto.

## Integración

El gateway registra automáticamente eventos de proxy para rutas de `pricing`, `catalog`, `inventory` y `enrichment`, incluyendo errores y respuestas críticas.
