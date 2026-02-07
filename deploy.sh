#!/bin/bash

echo "OpenClaw Dashboard - Docker Deployment"
echo "======================================"

echo ""
echo "Prüfe ob Docker installiert ist..."
if ! command -v docker &> /dev/null; then
    echo "Fehler: Docker ist nicht installiert"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Fehler: Docker Compose ist nicht installiert"
    exit 1
fi

echo "✓ Docker und Docker Compose sind installiert"

echo ""
echo "Prüfe Umgebungsvariablen..."
if [ ! -f .env ]; then
    echo "Erstelle .env Datei aus .env.example..."
    cp .env.example .env
    echo "✓ .env Datei erstellt"
    echo "⚠ Bitte bearbeiten Sie die .env Datei mit Ihren Supabase-Zugangsdaten"
else
    echo "✓ .env Datei vorhanden"
fi

echo ""
echo "Stoppe laufende Container..."
docker-compose down

echo ""
echo "Baue und starte Container..."
docker-compose up -d --build

echo ""
echo "Warte auf Services..."
sleep 5

echo ""
echo "Prüfe Status..."
docker-compose ps

echo ""
echo "======================================"
echo "Deployment abgeschlossen!"
echo ""
echo "Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:3002"
echo ""
echo "Logs anzeigen: docker-compose logs -f"
echo "Stoppen:      docker-compose down"
echo "======================================"