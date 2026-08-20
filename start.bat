@echo off
setlocal
title BetAnalyzer - Inicio Rapido (Local)

cd /d "%~dp0"

echo ================================================================
echo  BetAnalyzer - Inicio Rapido (Modo Local)
echo ================================================================
echo.

:: -------------------------------------------------------------------
:: 1. Detectar Node.js
:: -------------------------------------------------------------------
where npm >nul 2>nul
if not errorlevel 1 goto node_ready

if exist "C:\Program Files\nodejs\npm.cmd" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
    goto node_ready
)
if exist "C:\Program Files (x86)\nodejs\npm.cmd" (
    set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
    goto node_ready
)
if exist "%LOCALAPPDATA%\Programs\nodejs\npm.cmd" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    goto node_ready
)
if exist "%APPDATA%\npm\npm.cmd" (
    set "PATH=%APPDATA%\npm;%PATH%"
    goto node_ready
)

:: -------------------------------------------------------------------
:: 2. Si no hay Node.js, detectar Docker
:: -------------------------------------------------------------------
echo [INFO] Node.js no esta instalado de forma independiente.
echo [INFO] Buscando Docker en el equipo...

where docker >nul 2>nul
if not errorlevel 1 goto docker_found

if exist "%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin\docker.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin;%PATH%"
    goto docker_found
)
if exist "C:\Program Files\Docker\Docker\resources\bin\docker.exe" (
    set "PATH=C:\Program Files\Docker\Docker\resources\bin;%PATH%"
    goto docker_found
)
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" (
    set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
    goto docker_found
)

goto no_environment_found

:docker_found
echo [OK] Docker detectado. Verificando motor de Docker...

docker info >nul 2>nul
if not errorlevel 1 goto docker_engine_ready

echo [INFO] Docker Desktop no esta activo en segundo plano. Iniciandolo...

if exist "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe" (
    start "" "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
) else if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
) else (
    start "" "Docker Desktop" 2>nul
)

echo [INFO] Esperando a que el motor de Docker arranque (20-45 segundos)...
set /a tries=0

:docker_wait_loop
timeout /t 4 /nobreak >nul
docker info >nul 2>nul
if not errorlevel 1 goto docker_engine_ready

set /a tries+=1
if %tries% GEQ 20 goto docker_timeout

echo   ... esperando motor Docker (%tries%/20) ...
goto docker_wait_loop

:docker_timeout
echo.
echo ================================================================
echo  [ERROR] Docker tardo demasiado en iniciar.
echo  Por favor abre "Docker Desktop" manualmente desde el Menu Inicio,
echo  espera a que el icono este en verde ("Engine running") y vuelve
echo  a ejecutar este archivo.
echo ================================================================
echo.
pause
exit /b 1

:docker_engine_ready
echo [OK] Motor de Docker conectado y listo.
echo [INFO] Levantando contenedor de BetAnalyzer en local...
echo.

docker compose up -d
if errorlevel 1 (
    echo.
    echo [ERROR] No se pudo levantar el contenedor Docker.
    pause
    exit /b 1
)

echo [INFO] Esperando a que la aplicacion responda...
timeout /t 5 /nobreak >nul

start "" "http://localhost:3000"

echo.
echo ================================================================
echo  [OK] BetAnalyzer esta corriendo en tu navegador:
echo  - Acceso Local: http://localhost:3000
echo  - Para detener la app, ejecuta stop-deploy.bat
echo ================================================================
echo.
pause
exit /b 0

:: -------------------------------------------------------------------
:: Bloque de ejecucion con Node.js
:: -------------------------------------------------------------------
:node_ready
echo [OK] Node.js detectado en el sistema.
echo.
if not exist node_modules (
    echo [INFO] Instalando dependencias por primera vez...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] La instalacion de dependencias fallo.
        pause
        exit /b 1
    )
)
echo [INFO] Iniciando servidor de desarrollo en http://localhost:3000...
start "BetAnalyzer - Servidor" cmd /k "npm run dev"
timeout /t 6 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ================================================================
echo  [OK] BetAnalyzer iniciado en modo local: http://localhost:3000
echo  Para detener el servidor, cierra la ventana "BetAnalyzer - Servidor".
echo ================================================================
echo.
pause
exit /b 0

:: -------------------------------------------------------------------
:: Bloque de error: sin Node ni Docker
:: -------------------------------------------------------------------
:no_environment_found
echo.
echo ================================================================
echo  [ERROR] No se encontro Node.js ni Docker en este equipo.
echo.
echo  Para ejecutar BetAnalyzer:
echo    1. Instala Node.js (v20+): https://nodejs.org
echo    o
echo    2. Instala Docker Desktop: https://www.docker.com/products/docker-desktop
echo ================================================================
echo.
pause
exit /b 1
