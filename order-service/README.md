# Order Service

Order management and checkout service for BookFlow e-commerce platform.

## Features

- Create orders from shopping cart
- Track order status (pending, confirmed, processing, shipped, delivered, cancelled)
- Process payments (mock)
- Maintain order history per user
- Integration with inventory for stock reservation
- Support for different book conditions

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| POST | `/orders` | Create new order |
| GET | `/orders/{order_id}` | Get order details |
| GET | `/orders/user/{user_id}` | Get user's orders |
| POST | `/orders/{order_id}/confirm` | Confirm and process payment |
| POST | `/orders/{order_id}/cancel` | Cancel order |

## Environment Variables

```
DATABASE_URL=postgresql://bookflow:bookflow123@order-db:5432/order_db
CART_SERVICE_URL=http://cart-service:8010
INVENTORY_SERVICE_URL=http://inventory-service:8002
```

## Running

```bash
# Development
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8011

# Production
python -m uvicorn app.main:app --host 0.0.0.0 --port 8011
```
