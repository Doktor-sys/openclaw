#!/bin/bash

# OpenClaw SSL/TLS Setup mit Let's Encrypt
# Führt dieses Script auf dem Server aus

set -e

DOMAIN="35-195-246-45.nip.io"
EMAIL="admin@${DOMAIN}"
NGINX_CONFIG="/etc/nginx/sites-available/openclaw"
NGINX_ENABLED="/etc/nginx/sites-enabled/openclaw"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}"
WEBROOT="/var/www/certbot"

echo "🔒 OpenClaw SSL/TLS Setup"
echo "=========================="
echo "Domain: ${DOMAIN}"
echo "Email: ${EMAIL}"
echo ""

# Prüfe ob Certbot installiert ist
if ! command -v certbot &> /dev/null; then
    echo "📦 Installiere Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Erstelle Nginx Konfiguration
echo "📝 Erstelle Nginx Konfiguration..."
mkdir -p $(dirname ${NGINX_CONFIG})
mkdir -p ${WEBROOT}
mkdir -p /var/www/openclaw/html

cat > ${NGINX_CONFIG} << 'EOF'
server {
    listen 80;
    server_name 35-195-246-45.nip.io;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
EOF

ln -sf ${NGINX_CONFIG} ${NGINX_ENABLED}
nginx -t
systemctl reload nginx

echo ""
echo "🔐 Hole SSL Zertifikat von Let's Encrypt..."
certbot --nginx \
    -d ${DOMAIN} \
    --email ${EMAIL} \
    --agree-tos \
    --non-interactive \
    --redirect \
    --hsts \
    --staple-ocsp \
    -m ${EMAIL}

echo ""
echo "✅ SSL Zertifikat erhalten!"
echo ""
echo "Zertifikat Details:"
ls -la ${CERT_PATH}/
echo ""

echo "🔄 Teste SSL Konfiguration..."
curl -I https://${DOMAIN}/health 2>/dev/null | head -5

echo ""
echo "✅ SSL Setup abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Stelle sicher, dass Port 80 und 443 in der Firewall offen sind"
echo "   2. Dein DNS zeigt auf: ${DOMAIN}"
echo "   3. Das Zertifikat wird automatisch erneuert"
echo ""
echo "ℹ️  Zertifikats Erneuerung testen:"
echo "   certbot renew --dry-run"
