@echo off
setlocal
title BetAnalyzer - Detener despliegue

cd /d "%~dp0"

echo Deteniendo el tunel publico...
docker rm -f betanalyzer-tunnel >nul 2>nul

echo Deteniendo BetAnalyzer (docker compose down)...
docker compose down

echo.
echo Listo. BetAnalyzer y el tunel publico quedaron detenidos.
echo Tus datos siguen intactos en la carpeta data\ (no se borran al apagar).
echo.
pause
exit /b 0
