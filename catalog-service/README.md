# Catalog Service — BookFlow

Catálogo comercial de libros. Puerto **8003**.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/books/` | Crear libro |
| GET | `/books/` | Listar libros |
| GET | `/books/search?q=` | Buscar |
| GET | `/books/{id}` | Detalle |
| PUT | `/books/{id}` | Actualizar |
| DELETE | `/books/{id}` | Eliminar |
| POST | `/books/{id}/publish` | Publicar |
| GET | `/categories/` | Categorías |
| POST | `/categories/` | Crear categoría |
| GET | `/health` | Health check |

## Ejecución local
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003
```
