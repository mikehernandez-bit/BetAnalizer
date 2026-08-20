@echo off
setlocal
title BetAnalyzer - Despliegue (Docker + Tunel Publico)

cd /d "%~dp0"

echo ================================================================
echo  BetAnalyzer - Despliegue con Docker + Tunel Publico
echo ================================================================
echo.

:: -------------------------------------------------------------------
:: 1. Autodetectar Docker CLI
:: -------------------------------------------------------------------
where docker >nul 2>nul
if not errorlevel 1 goto docker_cli_ready

if exist "%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin\docker.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin;%PATH%"
    goto docker_cli_ready
)
if exist "C:\Program Files\Docker\Docker\resources\bin\docker.exe" (
    set "PATH=C:\Program Files\Docker\Docker\resources\bin;%PATH%"
    goto docker_cli_ready
)
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" (
    set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
    goto docker_cli_ready
)

echo [ERROR] No se encontro Docker CLI en este equipo.
echo Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
echo.
pause
exit /b 1

:docker_cli_ready
echo [OK] Docker CLI detectado.
echo [INFO] Verificando que el motor de Docker este activo...

docker info >nul 2>nul
if not errorlevel 1 goto docker_engine_ready

echo [INFO] Docker Desktop no esta activo. Iniciandolo...

if exist "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe" (
    start "" "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
) else if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
) else (
    start "" "Docker Desktop" 2>nul
)

echo [INFO] Esperando a que el motor de Docker arranque (20-45 segundos)...
set /a dtries=0

:waitdocker
timeout /t 4 /nobreak >nul
docker info >nul 2>nul
if not errorlevel 1 goto docker_engine_ready

set /a dtries+=1
if %dtries% GEQ 20 goto dockertimeout
echo   ... iniciando motor de Docker (%dtries%/20) ...
goto waitdocker

:dockertimeout
echo.
echo [ERROR] Docker tardo demasiado en iniciar.
echo Por favor abre "Docker Desktop" manualmente desde el Menu Inicio,
echo espera a que el icono este en verde ("Engine running") y vuelve a hacer doble clic aqui.
echo.
pause
exit /b 1

:docker_engine_ready
echo [OK] El motor de Docker esta listo y conectado.
echo.

:: -------------------------------------------------------------------
:: 2. Construir y levantar BetAnalyzer
:: -------------------------------------------------------------------
echo [INFO] Construyendo y levantando BetAnalyzer con Docker Compose...
docker compose up -d --build
if errorlevel 1 (
    echo.
    echo [ERROR] El build o arranque de Docker fallo.
    pause
    exit /b 1
)

echo.
echo [INFO] Esperando a que el contenedor este listo...
timeout /t 5 /nobreak >nul

echo [INFO] Iniciando tunel publico de Cloudflare...
docker rm -f betanalyzer-tunnel >nul 2>nul
start "BetAnalyzer - Tunel publico" cmd /k "docker run --rm --name betanalyzer-tunnel cloudflare/cloudflared:latest tunnel --url http://host.docker.internal:3000"

start "" "http://localhost:3000"

echo.
echo ================================================================
echo  [OK] BetAnalyzer esta desplegado y en ejecucion.
echo.
echo  - Enlace Local:   http://localhost:3000
echo  - Enlace Publico: Consulta la ventana "BetAnalyzer - Tunel publico"
echo                    donde aparecera tu URL (https://*.trycloudflare.com)
echo.
echo  Para detener todo cuando termines, haz doble clic en stop-deploy.bat
echo ================================================================
echo.
pause
exit /b 0
