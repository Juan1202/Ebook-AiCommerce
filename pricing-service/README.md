# Pricing Service

Servicio de cálculo de precios sugeridos para libros basado en referencias externas y reglas internas.

## 🚀 **Inicio Rápido**

### **Opción 1: Docker (Recomendado)**
```bash
# Desde el directorio raíz del proyecto
docker-compose up pricing-service -d
```

### **Opción 2: Pruebas Rápidas (Sin Docker)**
```bash
# Ejecutar todas las pruebas
cd pricing-service
run_tests.bat

# O manualmente:
python quick_test.py  # Pruebas básicas
python -m pytest tests/ -v  # Tests completos
```

### **Opción 3: Desarrollo Local**
```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servicio
uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```

## 📖 **Documentación de Pruebas**

Ver [`TESTING_GUIDE.md`](TESTING_GUIDE.md) para instrucciones detalladas de testing.

## Funcionalidades

- Cálculo de precio sugerido con factores de condición física
- Integración con APIs externas (eBay) con fallback interno
- Trazabilidad completa de decisiones de pricing
- Endpoints para cálculo, consulta de precios, historial y estado de APIs

## Endpoints

- `POST /pricing/calculate` - Calcular precio sugerido
- `GET /pricing/{book_id}` - Obtener último precio calculado
- `GET /pricing/history/{book_id}` - Historial de precios
- `GET /pricing/explanation/{decision_id}` - Explicación de decisión
- `GET /pricing/external-apis/status` - Estado de APIs externas

## Condiciones de libro

- NUEVO: Factor 1.0
- BUENO: Factor 0.8
- ACEPTABLE: Factor 0.6
- DETERIORADO: Factor 0.4

## Umbral mínimo

Precio mínimo: $5.00
