# Cart Service

Shopping cart management service for BookFlow e-commerce platform.

## Features

- Create and manage shopping carts
- Add/remove items with stock and condition tracking
- Update item quantities
- Persistent cart storage in PostgreSQL
- Total price and item count tracking

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/carts/{cart_id}` | Get cart contents |
| POST | `/carts/{cart_id}/items` | Add item to cart |
| PUT | `/carts/{cart_id}/items/{book_id}` | Update item quantity |
| DELETE | `/carts/{cart_id}/items/{book_id}` | Remove item from cart |
| DELETE | `/carts/{cart_id}` | Clear entire cart |

## Environment Variables

```
DATABASE_URL=postgresql://bookflow:bookflow123@cart-db:5432/cart_db
```

## Running

```bash
# Development
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8010

# Production
python -m uvicorn app.main:app --host 0.0.0.0 --port 8010
```
