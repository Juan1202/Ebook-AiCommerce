# Auth Service — BookFlow

Servicio de autenticación JWT. Puerto **8001**.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Login → JWT |
| GET | `/auth/verify` | Verificar token |
| GET | `/auth/mock-token` | Token admin de prueba (desarrollo) |
| GET | `/health` | Health check |

## Ejecución local
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## Variables de entorno
- `DATABASE_URL` — PostgreSQL (default: `postgresql://bookflow:bookflow123@auth-db:5432/auth_db`)
- `SECRET_KEY` — Clave JWT
- `ACCESS_TOKEN_EXPIRE_MINUTES` — Expiración token (default: 1440)
