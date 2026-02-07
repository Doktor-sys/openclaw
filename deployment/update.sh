#!/bin/bash

# OpenClaw Update Script
# Führe dieses Script auf dem Server aus

set -e

PROJECT_DIR="/opt/openclaw"
BACKUP_DIR="/opt/openclaw/backups/$(date +%Y%m%d-%H%M%S)"

echo "🔄 OpenClaw Update"
echo "================="

# Backup erstellen
echo "📦 Erstelle Backup..."
mkdir -p "${BACKUP_DIR}"
cp "${PROJECT_DIR}/.env" "${BACKUP_DIR}/"
docker run --rm -v openclaw_backend-uploads:/data -v "${BACKUP_DIR}":/backup alpine tar czf /backup/uploads.tar.gz -C /data .
echo "✅ Backup erstellt: ${BACKUP_DIR}"

# Projekt aktualisieren
echo "⬇️  Lade neueste Version..."
cd "${PROJECT_DIR}"
git pull origin main

# Images neu bauen
echo "🔨 Baue neue Images..."
docker compose -f deployment/docker-compose.prod.yml build --no-cache

# Container neu starten
echo "🚀 Starte Container neu..."
docker compose -f deployment/docker-compose.prod.yml down
docker compose -f deployment/docker-compose.prod.yml up -d

# Auf Gesundheit prüfen
echo "🏥 Prüfe Services..."
sleep 10
if curl -sf https://35-195-246-45.nip.io/health > /dev/null 2>&1; then
    echo "✅ Update erfolgreich!"
else
    echo "⚠️  Health Check fehlgeschlagen - prüfe Logs"
    docker compose -f deployment/docker-compose.prod.yml logs
fi

echo ""
echo "📊 Status:"
docker compose -f deployment/docker-compose.prod.yml ps
