@echo off
echo ========================================
echo    PRICING SERVICE - TEST SUITE
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando estructura de archivos...
if not exist "app\main.py" (
    echo ❌ Error: app/main.py no encontrado
    pause
    exit /b 1
)
if not exist "tests\test_pricing.py" (
    echo ❌ Error: tests/test_pricing.py no encontrado
    pause
    exit /b 1
)
echo ✅ Estructura de archivos correcta
echo.

echo [2/4] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no encontrado
    echo.
    echo 📝 Instalacion requerida:
    echo - Descargar Python 3.11+ de: https://www.python.org/downloads/
    echo - O instalar via Microsoft Store
    pause
    exit /b 1
)
echo ✅ Python disponible
echo.

echo [3/4] Ejecutando pruebas rapidas...
python quick_test.py
if %errorlevel% neq 0 (
    echo.
    echo ❌ Pruebas rapidas fallaron
    pause
    exit /b 1
)
echo.

echo [4/4] Ejecutando tests unitarios...
python -m pytest tests/ -v --tb=short
if %errorlevel% neq 0 (
    echo.
    echo ❌ Tests unitarios fallaron
    echo.
    echo 💡 Posibles soluciones:
    echo - pip install -r requirements.txt
    echo - Verificar que todas las dependencias esten instaladas
    pause
    exit /b 1
)
echo.

echo ========================================
echo 🎉 ¡TODAS LAS PRUEBAS PASARON!
echo ========================================
echo.
echo 📋 Proximos pasos recomendados:
echo.
echo 1. Levantar con Docker:
echo    docker-compose up pricing-service -d
echo.
echo 2. Probar con Postman:
echo    - Importar: BookFlow_Sprint1_E2E.postman_collection.json
echo    - Ejecutar carpeta "DEV 03 - Pricing Service (IA)"
echo.
echo 3. Verificar endpoints:
echo    - Health: http://localhost:8005/health
echo    - Calcular precio: POST /pricing/calculate
echo.
pause