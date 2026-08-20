@echo off
setlocal
title BetAnalyzer - Detener Despliegue

cd /d "%~dp0"

echo ================================================================
echo  BetAnalyzer - Detener Despliegue
echo ================================================================
echo.

:: Autodetectar Docker CLI si no esta en PATH
where docker >nul 2>nul
if errorlevel 1 (
    if exist "%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin\docker.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin;%PATH%"
    ) else if exist "C:\Program Files\Docker\Docker\resources\bin\docker.exe" (
        set "PATH=C:\Program Files\Docker\Docker\resources\bin;%PATH%"
    ) else if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" (
        set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
    )
)

echo [INFO] Deteniendo el tunel publico...
docker rm -f betanalyzer-tunnel >nul 2>nul

echo [INFO] Deteniendo contenedor de BetAnalyzer (docker compose down)...
docker compose down

echo.
echo ================================================================
echo  [OK] BetAnalyzer y el tunel publico han sido detenidos.
echo  Tus datos permanecen intactos en la carpeta data\
echo ================================================================
echo.
pause
exit /b 0
