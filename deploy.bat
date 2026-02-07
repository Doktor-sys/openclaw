@echo off
echo OpenClaw Dashboard - Docker Deployment
echo ======================================

echo.
echo Prüfe ob Docker installiert ist...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Fehler: Docker ist nicht installiert
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Fehler: Docker Compose ist nicht installiert
    pause
    exit /b 1
)

echo [OK] Docker und Docker Compose sind installiert

echo.
echo Prüfe Umgebungsvariablen...
if not exist .env (
    echo Erstelle .env Datei aus .env.example...
    copy .env.example .env
    echo [OK] .env Datei erstellt
    echo [WARNUNG] Bitte bearbeiten Sie die .env Datei mit Ihren Supabase-Zugangsdaten
) else (
    echo [OK] .env Datei vorhanden
)

echo.
echo Stoppe laufende Container...
docker-compose down

echo.
echo Baue und starte Container...
docker-compose up -d --build

echo.
echo Warte auf Services...
timeout /t 5 /nobreak

echo.
echo Prüfe Status...
docker-compose ps

echo.
echo ======================================
echo Deployment abgeschlossen!
echo.
echo Services:
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:3002
echo.
echo Logs anzeigen: docker-compose logs -f
echo Stoppen:      docker-compose down
echo ======================================

pause