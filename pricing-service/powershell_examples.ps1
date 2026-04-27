# Ejemplos de prueba con PowerShell para Pricing Service

# 1. Health Check
Invoke-RestMethod -Uri "http://localhost:8005/health" -Method Get

# 2. Calcular precio - NUEVO
$body = @{
    book_id = "book-001"
    book_title = "Clean Code: A Handbook of Agile Software Craftsmanship"
    condition = "NUEVO"
    author = "Robert C. Martin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8005/pricing/calculate" -Method Post -Body $body -ContentType "application/json"

# 3. Calcular precio - BUENO
$body = @{
    book_id = "book-002"
    book_title = "The Pragmatic Programmer"
    condition = "BUENO"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8005/pricing/calculate" -Method Post -Body $body -ContentType "application/json"

# 4. Calcular precio - ACEPTABLE
$body = @{
    book_id = "book-003"
    book_title = "Design Patterns"
    condition = "ACEPTABLE"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8005/pricing/calculate" -Method Post -Body $body -ContentType "application/json"

# 5. Calcular precio - DETERIORADO
$body = @{
    book_id = "book-004"
    book_title = "Refactoring"
    condition = "DETERIORADO"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8005/pricing/calculate" -Method Post -Body $body -ContentType "application/json"

# 6. Obtener último precio
Invoke-RestMethod -Uri "http://localhost:8005/pricing/book-001" -Method Get

# 7. Historial de precios
Invoke-RestMethod -Uri "http://localhost:8005/pricing/history/book-001" -Method Get

# 8. Explicación de decisión
Invoke-RestMethod -Uri "http://localhost:8005/pricing/explanation/1" -Method Get

# 9. Estado de APIs externas
Invoke-RestMethod -Uri "http://localhost:8005/pricing/external-apis/status" -Method Get