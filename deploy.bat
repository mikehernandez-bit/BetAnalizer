@echo off
setlocal
title BetAnalyzer - Despliegue (Docker)

cd /d "%~dp0"

echo ================================================================
echo  BetAnalyzer - Despliegue con Docker
echo ================================================================
echo.

where docker >nul 2>nul
if errorlevel 1 (
    echo No se encontro Docker en este equipo.
    echo Instala Docker Desktop desde https://www.docker.com/products/docker-desktop
    echo y vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)

echo Verificando que Docker Desktop este corriendo...
docker info >nul 2>nul
if not errorlevel 1 goto dockerready

echo Docker Desktop no esta corriendo. Intentando abrirlo...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe" 2>nul
echo Esperando a que el motor de Docker arranque ^(puede tardar 30-60 segundos^)...

set /a dtries=0
:waitdocker
timeout /t 5 /nobreak >nul
docker info >nul 2>nul
if not errorlevel 1 goto dockerready
set /a dtries+=1
if %dtries% GEQ 24 goto dockertimeout
echo   ...todavia iniciando, esperando un poco mas.
goto waitdocker

:dockertimeout
echo.
echo Docker no arranco a tiempo. Abrilo manualmente desde el menu de
echo inicio, espera a que diga "Engine running" y volve a correr este archivo.
echo.
pause
exit /b 1

:dockerready
echo Docker esta listo.
echo.

echo Construyendo y levantando BetAnalyzer con Docker Compose...
echo ^(la primera vez puede tardar varios minutos^)
echo.
docker compose up -d --build
if errorlevel 1 (
    echo.
    echo El build o el arranque del contenedor fallaron. Revisa el mensaje de error arriba.
    pause
    exit /b 1
)

echo.
echo Esperando a que la aplicacion arranque...
timeout /t 8 /nobreak >nul

echo.
echo BetAnalyzer esta corriendo en http://localhost:3000
echo.

echo Reiniciando el tunel publico de Cloudflare...
docker rm -f betanalyzer-tunnel >nul 2>nul
start "BetAnalyzer - Tunel publico (la URL aparece en esta ventana)" cmd /k "docker run --rm --name betanalyzer-tunnel cloudflare/cloudflared:latest tunnel --url http://host.docker.internal:3000"

start "" "http://localhost:3000"

echo.
echo ================================================================
echo  BetAnalyzer desplegado.
echo   - Local:   http://localhost:3000
echo   - Publico: mira la ventana "BetAnalyzer - Tunel publico" que se
echo     acaba de abrir; ahi aparece una URL tipo https://algo.trycloudflare.com
echo     (cambia cada vez que corres este archivo, es un tunel temporal).
echo   - Para apagar todo, ejecuta stop-deploy.bat
echo ================================================================
echo.
pause
exit /b 0
