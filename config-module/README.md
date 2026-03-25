# Config Module — BookFlow

Parámetros del sistema. Puerto **8008**.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/config/` | Listar todos los parámetros |
| GET | `/config/{key}` | Obtener parámetro |
| GET | `/config/category/{cat}` | Por categoría |
| PUT | `/config/{key}` | Actualizar parámetro |
| POST | `/config/` | Crear parámetro |
| GET | `/health` | Health check |

## Ejecución local
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8008
```
