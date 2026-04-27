# Guía de Pruebas - Pricing Service

## 📋 **Métodos de Prueba Disponibles**

### **Opción 1: Docker (Recomendado)**
```bash
# 1. Instalar Docker Desktop
# Descargar de: https://www.docker.com/products/docker-desktop

# 2. Verificar instalación
docker --version
docker-compose --version

# 3. Levantar el servicio
cd "c:\Users\User\Downloads\Ing de sofware\Ebook-AiCommerce"
docker-compose up pricing-service -d

# 4. Verificar que está corriendo
docker-compose ps
```

### **Opción 2: Python Local**
```bash
# 1. Instalar Python 3.11+
# Descargar de: https://www.python.org/downloads/

# 2. Instalar dependencias
cd pricing-service
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp ../.env.example ../.env
# Editar .env con tus configuraciones

# 4. Ejecutar el servicio
uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```

### **Opción 3: Tests Unitarios (Sin Docker)**
```bash
# Ejecutar tests unitarios
cd pricing-service
python -m pytest tests/ -v

# Con reporte detallado
python -m pytest tests/ -v --tb=long
```

## 🧪 **Pruebas de Funcionalidad**

### **1. Health Check**
```bash
curl http://localhost:8005/health
# Respuesta esperada: {"status": "ok", "service": "pricing-service"}
```

### **2. Calcular Precio - NUEVO**
```bash
curl -X POST http://localhost:8005/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "test-book-001",
    "book_title": "Clean Code: A Handbook of Agile Software Craftsmanship",
    "condition": "NUEVO",
    "author": "Robert C. Martin"
  }'
```

### **3. Calcular Precio - BUENO**
```bash
curl -X POST http://localhost:8005/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "test-book-002",
    "book_title": "The Pragmatic Programmer",
    "condition": "BUENO"
  }'
```

### **4. Obtener Último Precio**
```bash
curl http://localhost:8005/pricing/test-book-001
```

### **5. Historial de Precios**
```bash
curl http://localhost:8005/pricing/history/test-book-001
```

### **6. Estado de APIs Externas**
```bash
curl http://localhost:8005/pricing/external-apis/status
# Respuesta esperada: {"source": "eBay", "available": true, "last_check": "...", "error_message": null}
```

## 📊 **Validaciones Esperadas**

### **Condiciones y Factores:**
- **NUEVO**: Factor 1.0 → Precio final = precio_base × 1.0
- **BUENO**: Factor 0.8 → Precio final = precio_base × 0.8
- **ACEPTABLE**: Factor 0.6 → Precio final = precio_base × 0.6
- **DETERIORADO**: Factor 0.4 → Precio final = precio_base × 0.4

### **Reglas de Negocio:**
- ✅ Precio mínimo: $5.00 (si el cálculo da menos, se aplica este mínimo)
- ✅ Fallback automático cuando eBay API falla
- ✅ Cache de 1 hora para evitar llamadas repetidas
- ✅ Circuit breaker para protección contra fallos

### **Trazabilidad:**
- ✅ Cada decisión se guarda en BD
- ✅ Explicación detallada de cada cálculo
- ✅ Referencias externas almacenadas
- ✅ Historial completo por libro

## 🧪 **Pruebas con Postman**

1. **Importar colección:**
   - Abrir Postman
   - Importar: `BookFlow_Sprint1_E2E.postman_collection.json`
   - Buscar carpeta: "DEV 03 - Pricing Service (IA)"

2. **Configurar variables:**
   - `base_url`: `http://localhost:8005`

3. **Ejecutar pruebas:**
   - Ejecutar cada request en orden
   - Verificar tests automáticos (✅ verde = éxito)

## 🔍 **Debugging**

### **Logs del Servicio:**
```bash
# Ver logs en Docker
docker-compose logs pricing-service -f

# Ver logs específicos
docker-compose logs pricing-service | grep ERROR
```

### **Base de Datos:**
```bash
# Conectar a PostgreSQL
docker-compose exec pricing-db psql -U bookflow -d pricing_db

# Ver decisiones de pricing
SELECT * FROM pricing_decisions ORDER BY created_at DESC LIMIT 5;

# Ver referencias
SELECT * FROM pricing_references ORDER BY observed_at DESC LIMIT 5;
```

### **Tests Específicos:**
```bash
# Solo tests de condición NUEVO
python -m pytest tests/test_pricing.py::test_calculate_price_nuevo_condition -v

# Tests de fallback
python -m pytest tests/test_pricing.py::test_fallback_pricing_when_external_fails -v
```

## ✅ **Checklist de Verificación**

- [ ] Servicio inicia sin errores
- [ ] Health check responde OK
- [ ] Cálculo de precio funciona para todas las condiciones
- [ ] Fallback funciona cuando API externa falla
- [ ] Precio mínimo se respeta
- [ ] Datos se guardan en BD correctamente
- [ ] Historial y explicaciones funcionan
- [ ] Tests unitarios pasan (8/8)
- [ ] Postman collection ejecuta sin errores

## 🚨 **Problemas Comunes**

### **Puerto 8005 ocupado:**
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "8006:8005"  # Cambiar a 8006
```

### **Error de conexión a BD:**
```bash
# Verificar variables de entorno en .env
DATABASE_URL=postgresql://bookflow:bookflow123@pricing-db:5432/pricing_db
```

### **Tests fallan:**
```bash
# Instalar dependencias de test
pip install pytest pytest-asyncio
```

¡El Pricing Service está listo para pruebas! 🎉