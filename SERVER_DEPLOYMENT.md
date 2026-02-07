# OpenClaw Deployment Anleitung

## Schnellstart

### 1. Auf Server verbinden

```bash
ssh root@35-195-246-45.nip.io
```

### 2. Deployment Script herunterladen

```bash
cd /opt
curl -O https://raw.githubusercontent.com/Doktor-sys/openclaw/main/server-deploy.sh
chmod +x server-deploy.sh
```

### 3. Deployment ausführen

```bash
./server-deploy.sh deploy
```

---

## Manuelle Schritte

### Schritt 1: System aktualisieren

```bash
apt update && apt upgrade -y
```

### Schritt 2: Docker installieren

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER
```

### Schritt 3: Docker Compose installieren

```bash
docker compose install
```

### Schritt 4: Repository klonen

```bash
cd /opt
git clone https://github.com/Doktor-sys/openclaw.git
cd openclaw
```

### Schritt 5: Environment konfigurieren

```bash
cp deployment/.env.production .env
nano .env
```

Wichtige Einstellungen:
```env
JWT_SECRET=dein-sehr-sicheres-geheimnis-min-32-zeichen
SUPABASE_URL=https://xxx.supabase.co  # Optional
SUPABASE_ANON_KEY=xxx                  # Optional
```

### Schritt 6: Container bauen und starten

```bash
docker compose -f deployment/docker-compose.prod.yml build --no-cache
docker compose -f deployment/docker-compose.prod.yml up -d
```

### Schritt 7: Nginx konfigurieren

```bash
cp deployment/nginx/nginx-http.conf /etc/nginx/sites-available/openclaw
ln -sf /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### Schritt 8: SSL Zertifikat holen

```bash
certbot --nginx -d 35-195-246-45.nip.io --email admin@35-195-246-45.nip.io --agree-tos --redirect
```

---

## Nach dem Deployment

### Status prüfen

```bash
docker compose -f deployment/docker-compose.prod.yml ps
```

### Health Check

```bash
curl https://35-195-246-45.nip.io/health
```

### Logs anzeigen

```bash
docker compose -f deployment/docker-compose.prod.yml logs -f
```

---

## Deployment Script verwenden

```bash
# Vollständiges Deployment
./server-deploy.sh deploy

# Nur Container neu bauen
./server-deploy.sh build

# Container starten
./server-deploy.sh start

# Container stoppen
./server-deploy.sh stop

# Container neustarten
./server-deploy.sh restart

# SSL einrichten
./server-deploy.sh ssl

# Update durchführen
./server-deploy.sh update
```

---

## Firewall

```bash
# Firewall prüfen
ufw status

# Ports öffnen
ufw allow 80
ufw allow 443
ufw allow 22
ufw enable
```

---

## Troubleshooting

### Container startet nicht

```bash
# Logs prüfen
docker compose -f deployment/docker-compose.prod.yml logs backend

# Container neu starten
docker compose -f deployment/docker-compose.prod.yml restart backend
```

### Backend nicht erreichbar

```bash
# Port prüfen
netstat -tulpn | grep 3002

# Firewall prüfen
ufw status
```

### SSL Fehler

```bash
# Zertifikat prüfen
certbot certificates

# Zertifikat erneuern
certbot renew
```

---

## Docker Compose Dateien

| Datei | Verwendung |
|-------|------------|
| `docker-compose.yml` | Development |
| `deployment/docker-compose.prod.yml` | Production |

---

## URLs nach Deployment

| Service | URL |
|---------|-----|
| Frontend | https://35-195-246-45.nip.io |
| Backend API | https://35-195-246-45.nip.io/api |
| Health Check | https://35-195-246-45.nip.io/health |
