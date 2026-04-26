@echo off
setlocal
title Truncate Databases - BookFlow AI
echo ======================================================
echo   LIMPIEZA DE DATOS (TRUNCATE) - BookFlow AI
echo ======================================================
echo Este comando vaciara las tablas pero mantendra la 
echo estructura y los contenedores activos.
echo.
pause
 
:: Credenciales por defecto (segun .env)
set PGPASSWORD=bookflow123
set PGUSER=bookflow
 
echo.
echo [1/3] Limpiando Auth Service (auth_db)...
docker-compose exec -T auth-db psql -U %PGUSER% -d auth_db -c "TRUNCATE TABLE users, revoked_tokens CASCADE;"
 
echo.
echo [2/3] Limpiando Inventory Service (inventory_db)...
docker-compose exec -T inventory-db psql -U %PGUSER% -d inventory_db -c "TRUNCATE TABLE inventory_items, import_batches, import_errors CASCADE;"
 
echo.
echo [3/3] Limpiando Catalog Service (catalog_db)...
docker-compose exec -T catalog-db psql -U %PGUSER% -d catalog_db -c "TRUNCATE TABLE categories, books CASCADE;"
 
echo.
echo ======================================================
echo   LIMPIEZA COMPLETADA
echo   Las tablas han sido vaciadas exitosamente.
echo ======================================================
pause