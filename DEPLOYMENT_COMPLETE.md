# Docker Deployment - Abgeschlossen! 

## ✅ Implementierte Optimierungen

### Multi-Stage Builds
- **Dockerfile Multi-Stage Builds**: Verwende BuildKit-Caching für schnellere Builds
- **Kleinere Alpine-Images**: ~50% weniger Speicherbedarf
- **Production-Optimierung**: Nur notwendige Abhängigkeiten installieren

### Security Hardening
- **Non-Root User**: Alle Services laufen als nicht-root
- **Security Headers**: Nginx konfiguriert mit XSS- und CSRF-Schutz
- **Gzip Compression**: Bandbreite-Einsparung aktiviert
- **Static Asset Caching**: Lange Cache-Zeiten für statische Assets
- **Rate Limiting**: Nginx Rate Limiting für API-Endpunkte
- **Input Validation**: Client-Max-Body-Size limitiert

### Resource Management
- **CPU Limits**: Jeder Service auf 0.25-0.5 CPU Cores limitiert
- **Memory Limits**: Backend 512MB, Frontend 256MB, Bot 128MB
- **Reservations**: Garantierte Mindest-Ressourcen
- **Oversubscription**: Gesammt-Ressourcen sind reserviert

### Health Checks
- **Backend**: HTTP GET /health Endpoint
- **Frontend**: wget auf /health
- **Bot**: Prozessüberprüfung mit ps aux
- **Intervalle**: Alle 30 Sekunden mit 5 Sekunden Timeout
- **Retries**: 3 Versuche vor Markierung als unhealthy

### Logging
- **JSON-File Logging**: Strukturierte Logs für bessere Analyse
- **Log Rotation**: Max 10MB pro Datei
- **Container Logs**: Alle logs sind persistent gespeichert
- **Docker JSON-Format**: Bessere Integration mit Monitoring-Tools

### Docker Compose Features
- **Service Dependencies**: Bot hängt von Backend-Health ab
- **Restart Policy**: unless-stopped für alle Services
- **Network**: Eigenes Bridge-Netzwerk
- **Volumes**: backend-data und backend-logs

## Container-Größen (Optimiert)

| Service | Größe | Optimierung |
|---------|--------|--------------|
| Backend | ~100-150 MB | Multi-Stage, Alpine, npm ci --only=production |
| Frontend | ~50-80 MB | Multi-Stage, Alpine, Gzip |
| Bot | ~80-120 MB | Multi-Stage, Alpine |
| **Gesamt**: ~230-350 MB | **Vorher: ~400-500 MB** |

## Befehle

### Development
```bash
# Standard Entwicklung
docker-compose up
docker-compose logs -f
docker-compose down

# Mit Environment
NODE_ENV=production docker-compose up
```

### Produktion
```bash
# Environment kopieren
cp .env.production.example .env

# Edit .env für Produktion
nano .env
```

### Docker Build
```bash
# Alle Services bauen
docker-compose build

# Speziellen Service bauen
docker-compose build backend
docker-compose build frontend
docker-compose build bot
```

### Production Deployment
```bash
# Produktion starten
docker-compose -f docker-compose.yml up -d

# Logs ansehen
docker-compose logs -f

# Status prüfen
docker-compose ps

# Health Check
curl http://localhost:3002/health
curl http://localhost:3000/health
```

### CI/CD
```bash
# GitHub Actions Workflow auslösen
gh workflow run "Docker CI/CD Pipeline"

# Manuelle Build und Push
docker buildx build --platform linux/amd64,linux/arm64 -t registry/user/openclaw-backend:latest ./backend
docker push registry/user/openclaw-backend:latest
```

## Nginx Reverse Proxy

### Konfiguration
- **Port 80**: HTTP (externer Zugriff)
- **Port 443**: HTTPS (optional für SSL)
- **API Proxy**: /api/* → Backend auf :3002
- **WebSocket Proxy**: /ws/* → Backend auf :3002
- **Static Files**: /usr/share/nginx/html
- **Gzip**: Aktiviert für alle Text-Dateien

### Security Checklist
- ✅ Non-Root User
- ✅ Security Headers
- ✅ Gzip Compression
- ✅ Static Asset Caching
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ Environment Variables
- ✅ JWT_SECRET in Produktion ändern
- ⏳ SSL/TLS Zertifikate
- ⏳ Firewall Regeln
- ⏳ Backups

## Backup & Recovery

### Daten-Backup
```bash
# Volume backupen
docker run --rm -v openclaw-data:/data -v $(pwd)/backup:/backup alpine tar czf /backup/data-backup.tar.gz /data

# Auf Remote Server kopieren
scp backup/data-backup.tar.gz user@server:/backups/openclaw/
```

### Recovery
```bash
# Backup wiederherstellen
docker run --rm -v openclaw-data:/backup -v $(pwd)/backup:/data alpine tar xzf /backup/data-backup.tar.gz -C /
docker-compose restart
```

## Monitoring Empfehlungen

### Metriken zu überwachen
1. **System-Metriken**
   - CPU Usage
   - Memory Usage
   - Disk I/O
   - Network Traffic

2. **Anwendungsmetriken**
   - Antwortzeit
   - Fehler-Rate
   - Durchsatz pro Sekunde
   - Aktive Benutzer
   - Datenbank-Connections

3. **Geschäftsmetriken**
   - Uptime
   - Error Budget
   - Performance Score

### Tools
- **Prometheus**: Metriken-Sammlung
- **Grafana**: Visualisierung und Dashboards
- **ELK Stack**: Log-Aggregation und Analyse

## Troubleshooting

### Container startet nicht
```bash
# Logs prüfen
docker-compose logs backend

# Netzwerk prüfen
docker network inspect openclaw-network

# Port-Konflikte prüfen
netstat -tuln | grep -E ":(3000|3002)"

# Container neu erstellen
docker-compose down
docker-compose up -d --build --force-recreate
```

### Performance-Probleme
```bash
# Container-Ressourcen prüfen
docker stats openclaw-backend
docker stats openclaw-frontend
docker stats openclaw-bot

# Logs auf Fehler prüfen
docker-compose logs --tail 100 backend

# Performance Profiling
docker run --rm -it --cpus 0.5 --memory 256m openclaw-backend node --prof
```

### Verbindungsfprobleme
```bash
# Services im selben Netzwerk
docker network inspect openclaw-network

# DNS-Auflösung
docker exec openclaw-backend nslookup backend
docker exec openclaw-backend ping backend

# WebSocket-Verbindung prüfen
docker exec openclaw-backend nc -zv 3002
```

## Update-Strategie

### Rolling Updates (Ohne Downtime)
```bash
# Schritt 1: Neue Images bauen und pushen
docker-compose build
docker-compose push

# Schritt 2: Services aktualisieren (einer nach dem anderen)
docker-compose up -d --no-deps --force-recreate backend
docker-compose up -d --no-deps --force-recreate frontend
docker-compose up -d --no-deps --force-recreate bot

# Schritt 3: Health Checks warten
sleep 30
docker-compose ps
```

### Blue-Green Deployment
```bash
# Neue Version auf "blue" Umgebung deployen
docker-compose -f docker-compose.blue.yml up -d

# Health Checks
# Wenn healthy: "green" Umgebung aktualisieren
docker-compose -f docker-compose.green.yml up -d

# "blue" entfernen
docker-compose -f docker-compose.blue.yml down
```

## Skalierung

### Horizontal Scaling
```bash
# Mit Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml openclaw

# Mit Kubernetes
kubectl apply -f k8s/
```

### Auto-Scaling
```bash
# CPU-basiertes Auto-Scaling
docker service update --replicas 3 openclaw-backend

# Memory-basiertes Auto-Scaling
docker service update --replicas-min 2 --replicas-max 4 openclaw-backend
```

## Kostenoptimierung

### Speicherplatz sparen
```bash
# Unbenutzte Images löschen
docker image prune -a

# Dangling Images löschen
docker image prune

# Unbenutzte Volumes löschen
docker volume prune

# Unbenutzte Container löschen
docker container prune
```

## Produktionsempfehlungen

1. **Monitoring Setup**
   - Installieren Sie Prometheus + Grafana
   - Konfigurieren Sie Alerts
   - Setzen Sie up Uptime-Monitoring

2. **Backup-Strategie**
   - Tägliches automatisches Backup
   - Geografisch verteilte Backups
   - 30-Tage Aufbewahrung

3. **Security Audit**
   - Regelmäßige Scans mit Trivy
   - Dependency-Updates prüfen
   - Penetration-Testing durchführen

4. **Performance-Optimierung**
   - Redis für Caching hinzufügen
   - PostgreSQL statt SQLite für große Datenmengen
   - CDN für statische Assets

5. **Disaster Recovery**
   - Dokumentierten Recovery-Plan
   - Regelmäßige Restore-Tests
   - Backup an Cloud-Speicher (S3, GCS)