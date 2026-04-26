# Audit Service

Servicio de auditoría para decisiones de pricing y enriquecimiento de IA en BookFlow.

## Propósito

Proporciona trazabilidad completa de decisiones automatizadas, permitiendo a administradores entender y confiar en la lógica del sistema.

## Arquitectura

- **Base de datos**: PostgreSQL con tabla `audit_decisions`.
- **Modelo**: `AuditModel` con campos para módulo, decisión, estado, anomalías, etc.
- **Endpoints**:
  - `GET /audit/` - Lista decisiones recientes con filtros.
  - `GET /audit/{id}` - Detalle de una decisión.
  - `POST /audit/` - Crear nueva auditoría (usado internamente).
  - `GET /audit/stats` - Estadísticas generales.

## Detección de Anomalías

- **Enrichment**: Anomalía si `confidence_score < 0.75`.
- **Pricing**: (Pendiente) Detección de outliers basada en rangos mínimos.

## Integración

- **BFF Gateway**: Rutas disponibles en `/api/admin/audit/*`.
- **Eventos**: `ai-enrichment-mock` envía eventos automáticamente.
- **Frontend**: `admin-frontend` consume datos para UI de auditoría.

## Configuración

- `DATABASE_URL`: Conexión a PostgreSQL.
- `AUDIT_SERVICE_URL`: Para envío de eventos desde otros servicios.

## Pruebas

Ejecutar con `pytest` en `audit-service/tests/`.

## Uso

1. Levantar con Docker Compose.
2. Acceder desde admin-frontend o directamente al BFF.
