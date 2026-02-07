#!/bin/bash

# OpenClaw Production Deployment Script
# For server: 35-195-246-45.nip.io

set -e

# Configuration
DOMAIN="35-195-246-45.nip.io"
PROJECT_DIR="/opt/openclaw"
ENV_FILE=".env.production"
DOCKER_COMPOSE_FILE="deployment/docker-compose.prod.yml"
NGINX_CONFIG="deployment/nginx/nginx-ssl.conf"
SSL_SCRIPT="deployment/ssl-setup.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 OpenClaw Production Deployment${NC}"
echo "===================================="
echo "Domain: ${DOMAIN}"
echo "Project: ${PROJECT_DIR}"
echo ""

# Functions
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Prüfe Voraussetzungen..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker ist nicht installiert!"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose ist nicht installiert!"
        exit 1
    fi
    
    if ! command -v certbot &> /dev/null; then
        log_warn "Certbot ist nicht installiert (SSL wird übersprungen)"
    fi
    
    log_info "Voraussetzungen erfüllt"
}

# Create project directory
setup_directory() {
    log_info "Erstelle Projektverzeichnis..."
    
    if [ ! -d "${PROJECT_DIR}" ]; then
        sudo mkdir -p "${PROJECT_DIR}"
        sudo chown $USER:$USER "${PROJECT_DIR}"
    fi
    
    cd "${PROJECT_DIR}"
    log_info "Arbeitsverzeichnis: $(pwd)"
}

# Copy project files
copy_files() {
    log_info "Kopiere Projektdateien..."
    
    # Copy only necessary files for production
    rsync -av --exclude='node_modules' \
          --exclude='.git' \
          --exclude='dist' \
          --exclude='*.log' \
          --exclude='coverage' \
          . "${PROJECT_DIR}/"
    
    log_info "Dateien kopiert"
}

# Setup environment
setup_environment() {
    log_info "Konfiguriere Umgebung..."
    
    if [ ! -f "${PROJECT_DIR}/${ENV_FILE}" ]; then
        log_warn "Keine .env.production gefunden - erstelle Standard..."
        cat > "${PROJECT_DIR}/${ENV_FILE}" << 'EOF'
JWT_SECRET=change-this-in-production-minimum-32-chars
SUPABASE_URL=
SUPABASE_ANON_KEY=
DISCORD_TOKEN=
OPENAI_API_KEY=
EOF
        log_warn "BITTE .env.production MANUELL BEARBEITEN!"
    fi
    
    # Source environment
    set -a
    source "${PROJECT_DIR}/${ENV_FILE}"
    set +a
    
    log_info "Umgebung konfiguriert"
}

# Build Docker images
build_images() {
    log_info "Baue Docker Images..."
    
    docker compose -f "${DOCKER_COMPOSE_FILE}" build --no-cache
    
    log_info "Images gebaut"
}

# Stop existing containers
stop_containers() {
    log_info "Stoppe existierende Container..."
    
    docker compose -f "${DOCKER_COMPOSE_FILE}" down --remove-orphans 2>/dev/null || true
    
    log_info "Container gestoppt"
}

# Start containers
start_containers() {
    log_info "Starte Container..."
    
    docker compose -f "${DOCKER_COMPOSE_FILE}" up -d
    
    log_info "Container gestartet"
}

# Wait for services
wait_for_services() {
    log_info "Warte auf Services..."
    
    sleep 10
    
    # Check backend health
    for i in {1..30}; do
        if curl -sf http://localhost:3002/health > /dev/null 2>&1; then
            log_info "Backend ist gesund"
            break
        fi
        echo -n "."
        sleep 2
    done
    echo ""
}

# Setup Nginx
setup_nginx() {
    log_info "Konfiguriere Nginx..."
    
    # Copy nginx config
    sudo cp "${NGINX_CONFIG}" /etc/nginx/conf.d/openclaw.conf
    sudo nginx -t
    
    # Reload nginx
    sudo systemctl reload nginx
    
    log_info "Nginx konfiguriert"
}

# Setup SSL
setup_ssl() {
    log_info "Richte SSL ein..."
    
    if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
        log_info "Hole SSL Zertifikat..."
        
        # Run certbot
        certbot --nginx \
            -d "${DOMAIN}" \
            --email "admin@${DOMAIN}" \
            --agree-tos \
            --non-interactive \
            --redirect \
            --hsts \
            --staple-ocsp \
            -m "admin@${DOMAIN}"
        
        log_info "SSL Zertifikat erhalten"
    else
        log_info "SSL Zertifikat bereits vorhanden"
    fi
}

# Show status
show_status() {
    echo ""
    echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"
    echo ""
    echo "📊 Services:"
    docker compose -f "${DOCKER_COMPOSE_FILE}" ps
    
    echo ""
    echo "🌐 Zugriffspunkte:"
    echo "   Frontend: https://${DOMAIN}"
    echo "   Backend:  https://${DOMAIN}/api"
    echo "   Health:   https://${DOMAIN}/health"
    
    echo ""
    echo "📝 Nützliche Befehle:"
    echo "   Logs:     docker compose -f ${DOCKER_COMPOSE_FILE} logs -f"
    echo "   Restart:  docker compose -f ${DOCKER_COMPOSE_FILE} restart"
    echo "   Update:  ./deploy-production.sh"
}

# Main execution
main() {
    check_prerequisites
    setup_directory
    copy_files
    setup_environment
    stop_containers
    build_images
    start_containers
    wait_for_services
    setup_nginx
    setup_ssl
    show_status
}

# Run with options
case "${1:-deploy}" in
    deploy)
        main
        ;;
    build)
        build_images
        ;;
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    restart)
        stop_containers
        start_containers
        ;;
    ssl)
        setup_ssl
        ;;
    *)
        echo "Usage: $0 [deploy|build|start|stop|restart|ssl]"
        exit 1
        ;;
esac
