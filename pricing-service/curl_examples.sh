# Comandos cURL para probar Pricing Service

# 1. Health Check
curl http://localhost:8005/health

# 2. Calcular precio - NUEVO
curl -X POST http://localhost:8005/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "book-001",
    "book_title": "Clean Code: A Handbook of Agile Software Craftsmanship",
    "condition": "NUEVO",
    "author": "Robert C. Martin"
  }'

# 3. Calcular precio - BUENO
curl -X POST http://localhost:8005/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "book-002",
    "book_title": "The Pragmatic Programmer",
    "condition": "BUENO"
  }'

# 4. Calcular precio - ACEPTABLE
curl -X POST http://localhost:8005/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "book-003",
    "book_title": "Design Patterns",
    "condition": "ACEPTABLE"
  }'

# 5. Calcular precio - DETERIORADO
curl -X POST http://localhost:8005/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "book-004",
    "book_title": "Refactoring",
    "condition": "DETERIORADO"
  }'

# 6. Obtener último precio
curl http://localhost:8005/pricing/book-001

# 7. Historial de precios
curl http://localhost:8005/pricing/history/book-001

# 8. Explicación de decisión (usar ID de respuesta anterior)
curl http://localhost:8005/pricing/explanation/1

# 9. Estado de APIs externas
curl http://localhost:8005/pricing/external-apis/status

# 10. Probar fallback (simular fallo de API externa)
# Para probar fallback, modificar el código para forzar error o
# usar una URL inválida en la configuración