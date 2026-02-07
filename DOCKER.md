# Docker Deployment

## Voraussetzungen

- Docker und Docker Compose installiert
- Supabase-Projekt eingerichtet
- Umgebungsvariablen konfiguriert

## Einrichtung

1. **Umgebungsvariablen kopieren:**
```bash
cp .env.example .env
```

2. **Umgebungsvariablen anpassen:**
```bash
nano .env
# Oder verwenden Sie Ihren bevorzugten Editor
```

3. **Supabase-Datenbank einrichten:**
   - Öffnen Sie die Supabase SQL-Console
   - Führen Sie `backend/supabase_setup.sql` aus

## Docker-Befehle

**Alle Services starten:**
```bash
docker-compose up -d
```

**Status prüfen:**
```bash
docker-compose ps
```

**Logs ansehen:**
```bash
# Alle Logs
docker-compose logs -f

# Spezieller Service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f bot
```

**Services stoppen:**
```bash
docker-compose down
```

**Services stoppen und Volumes löschen:**
```bash
docker-compose down -v
```

**Services neu erstellen:**
```bash
docker-compose up -d --build
```

## Services

### Backend (Port 3002)
- Express.js Server
- WebSocket-Unterstützung
- Supabase-Integration

### Frontend (Port 3000)
- React Application
- Nginx Reverse Proxy
- Statische Dateien

### Bot
- OpenClaw Bot
- WebSocket-Kommunikation
- Automatischer Reconnect

## Netzwerk

Alle Services kommunizieren über das `openclaw-network` Netzwerk.

## Volumes

- `backend-data`: Persistente Datenspeicherung

## Health Checks

Alle Services haben Health Checks für automatische Überwachung.

## Troubleshooting

**Container neu starten:**
```bash
docker-compose restart [service]
```

**Logs prüfen:**
```bash
docker-compose logs [service]
```

**Container in die Shell:**
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec bot sh
```

**Bilder bereinigen:**
```bash
docker system prune -a
```

## Produktion

Für Produktion:
1. Setzen Sie `NODE_ENV=production`
2. Verwenden Sie echte JWT-Secrets
3. Konfigurieren Sie HTTPS
4. Richten Sie Monitoring ein