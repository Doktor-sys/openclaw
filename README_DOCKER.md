# OpenClaw Dashboard - Docker Deployment

## Projektstruktur

```
Dashboard/
├── backend/          # Node.js Backend
├── frontend/         # React Frontend
├── bot/             # OpenClaw Bot
├── docker-compose.yml
├── deploy.sh        # Linux/Mac Deployment-Skript
└── deploy.bat       # Windows Deployment-Skript
```

## Schnellstart

### Windows:
```bash
deploy.bat
```

### Linux/Mac:
```bash
./deploy.sh
```

### Manuelles Deployment:

1. **Umgebungsvariablen einrichten:**
```bash
cp .env.example .env
# .env mit Ihren Supabase-Daten bearbeiten
```

2. **Services starten:**
```bash
docker-compose up -d --build
```

## Services

| Service | Port | Beschreibung |
|---------|------|-------------|
| Frontend | 3000 | React Dashboard |
| Backend | 3002 | Express API + WebSocket |
| Bot | - | OpenClaw Bot Service |

## Docker-Befehle

**Status prüfen:**
```bash
docker-compose ps
```

**Logs ansehen:**
```bash
docker-compose logs -f              # Alle Logs
docker-compose logs -f backend     # Backend Logs
docker-compose logs -f frontend    # Frontend Logs
docker-compose logs -f bot        # Bot Logs
```

**Services stoppen:**
```bash
docker-compose down
```

**Neu aufbauen:**
```bash
docker-compose up -d --build --force-recreate
```

**Alles löschen (inkl. Volumes):**
```bash
docker-compose down -v
```

## Nginx Reverse Proxy

Das Frontend verwendet Nginx als Reverse Proxy:
- `/api/*` → Backend API
- `/ws/*` → WebSocket Verbindung
- `/*` → Statische Frontend-Dateien

## Health Checks

Alle Services haben Health Checks:
- **Backend**: API-Verfügbarkeit prüfen
- **Frontend**: HTTP-Server antwortet
- **Bot**: Prozess läuft

## Volumes

- `backend-data`: Persistente Datenbank/Datei-Speicherung

## Troubleshooting

**Container in Shell:**
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec bot sh
```

**Logs mit Zeitstempel:**
```bash
docker-compose logs -f --timestamps
```

**Speichernutzung prüfen:**
```bash
docker system df
```

**Bilder bereinigen:**
```bash
docker system prune -a
```

## Produktion

Für Produktionseinsatz:
1. HTTPS konfigurieren (SSL-Zertifikate)
2. JWT_SECRET in .env ändern
3. Supabase ROW LEVEL SECURITY konfigurieren
4. Monitoring und Logging hinzufügen
5. Backup-Strategie für Supabase einrichten

## Netzwerk

Alle Services kommunizieren über `openclaw-network`.

## Umgebung

Docker-Compose erstellt automatisch:
- Bridge-Netzwerk
- Named Volume
- Health Checks
- Auto-Restart Policy