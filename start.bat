@echo off
setlocal
title BetAnalyzer - Inicio rapido

cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
    echo No se encontro Node.js/npm en este equipo.
    echo Instala Node.js desde https://nodejs.org y vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Instalando dependencias por primera vez, esto puede tardar unos minutos...
    call npm install
    if errorlevel 1 (
        echo.
        echo La instalacion de dependencias fallo. Revisa el mensaje de error.
        pause
        exit /b 1
    )
)

echo Iniciando el servidor de desarrollo de BetAnalyzer...
start "BetAnalyzer - Servidor" cmd /k "npm run dev"

echo Esperando a que el servidor este listo...
timeout /t 6 /nobreak >nul

start "" "http://localhost:3000"

echo.
echo BetAnalyzer deberia abrirse en tu navegador en unos segundos.
echo Si la pagina no carga, espera un momento y recarga http://localhost:3000
echo Para detener el servidor, cierra la ventana "BetAnalyzer - Servidor".
echo.
pause
exit /b 0
