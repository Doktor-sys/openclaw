# OpenClaw Deployment Guide
# Server: 35-195-246-45.nip.io

## Voraussetzungen

```bash
# Server vorbereiten
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# Docker als non-root user nutzen
sudo usermod -aG docker $USER
```

## Deployment Schritte

### 1. Projekt auf Server übertragen

```bash
# Auf lokaler Maschine
scp -r . user@35-195-246-45.nip.io:/opt/openclaw/
```

### 2. Environment konfigurieren

```bash
# Auf dem Server
cd /opt/openclaw
cp deployment/.env.production .env
nano .env
```

Wichtige Variablen:
```env
JWT_SECRET=sehr-sicherer-geheimnis-min-32-zeichen
SUPABASE_URL=https://dein-projekt.supabase.co
SUPABASE_ANON_KEY=dein-anon-key
DISCORD_TOKEN=dein-discord-token
OPENAI_API_KEY=dein-openai-key
```

### 3. Deployment ausführen

```bash
chmod +x deployment/deploy-production.sh
./deployment/deploy-production.sh
```

## Manuelle Befehle

```bash
# Container starten
docker compose -f deployment/docker-compose.prod.yml up -d

# Container stoppen
docker compose -f deployment/docker-compose.prod.yml down

# Logs anzeigen
docker compose -f deployment/docker-compose.prod.yml logs -f

# Images neu bauen
docker compose -f deployment/docker-compose.prod.yml build --no-cache

# SSL Zertifikat erneuern
certbot renew --dry-run
certbot renew
```

## Firewall

```bash
# UFW Firewall konfigurieren
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

## Monitoring

```bash
# Container Status
docker compose -f deployment/docker-compose.prod.yml ps

# Ressourcen Nutzung
docker stats

# Health Checks
curl https://35-195-246-45.nip.io/health
curl https://35-195-246-45.nip.io/api/stats/health
```

## Backup

```bash
# Volumes sichern
docker run --rm -v openclaw_backend-uploads:/data -v $(pwd):/backup alpine tar czf /backup/backup-uploads.tar.gz -C /data .

# Restore
docker run --rm -v openclaw_backend-uploads:/data -v $(pwd):/backup alpine tar xzf /backup/backup-uploads.tar.gz -C /data
```

## Troubleshooting

```bash
# Backend Logs
docker compose -f deployment/docker-compose.prod.yml logs backend

# Frontend Logs
docker compose -f deployment/docker-compose.prod.yml logs frontend

# Nginx Logs
tail -f /var/log/nginx/openclaw_error.log
```

## DNS Konfiguration

Der Domain Name `35-195-246-45.nip.io` zeigt auf die IP des Servers.
Stelle sicher, dass:
- Port 80 und 443 in der Firewall offen sind
- Der DNS korrekt aufgelöst wird
- SSL Zertifikat erfolgreich erstellt wurde
