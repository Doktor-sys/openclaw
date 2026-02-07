#!/bin/bash

# ============================================================================
# OpenClaw Server Deployment Script
# Server: 35-195-246-45.nip.io
# ============================================================================

set -e

# Configuration
REPO_URL="https://github.com/Doktor-sys/openclaw.git"
PROJECT_DIR="/opt/openclaw"
DOMAIN="35-195-246-45.nip.io"
ADMIN_EMAIL="admin@$DOMAIN"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# ============================================================================
# PREREQUISITES CHECK
# ============================================================================
check_prerequisites() {
    log_step "Prüfe Voraussetzungen..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker ist nicht installiert!"
        log_info "Installiere Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $USER
    fi
    log_info "Docker: $(docker --version)"
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose ist nicht installiert!"
        exit 1
    fi
    log_info "Docker Compose: $(docker compose version 2>/dev/null || docker-compose --version)"
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        log_warn "Nginx ist nicht installiert - wird übersprungen"
    else
        log_info "Nginx: $(nginx -v 2>&1)"
    fi
    
    # Check Certbot
    if ! command -v certbot &> /dev/null; then
        log_warn "Certbot ist nicht installiert - SSL wird später eingerichtet"
    fi
    
    log_info "Voraussetzungen erfüllt!"
}

# ============================================================================
# SYSTEM UPDATE
# ============================================================================
update_system() {
    log_step "Aktualisiere System..."
    apt-get update -qq
    apt-get upgrade -y -qq
    log_info "System aktualisiert!"
}

# ============================================================================
# INSTALL DEPENDENCIES
# ============================================================================
install_dependencies() {
    log_step "Installiere Abhängigkeiten..."
    
    apt-get install -y \
        curl \
        wget \
        git \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw
    
    log_info "Abhängigkeiten installiert!"
}

# ============================================================================
# CONFIGURE FIREWALL
# ============================================================================
configure_firewall() {
    log_step "Konfiguriere Firewall..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    log_info "Firewall konfiguriert!"
}

# ============================================================================
# CLONE OR UPDATE REPOSITORY
# ============================================================================
setup_repository() {
    log_step "Richte Repository ein..."
    
    if [ -d "$PROJECT_DIR/.git" ]; then
        log_info "Repository existiert bereits - Update..."
        cd "$PROJECT_DIR"
        git pull origin main
    else
        log_info "Klone Repository..."
        mkdir -p $(dirname "$PROJECT_DIR")
        git clone "$REPO_URL" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
    
    # Make scripts executable
    chmod +x deployment/deploy-production.sh
    chmod +x deployment/ssl-setup.sh
    chmod +x deployment/update.sh
    chmod +x deploy.sh
    chmod +x deploy.bat 2>/dev/null || true
    
    log_info "Repository eingerichtet!"
}

# ============================================================================
# CONFIGURE ENVIRONMENT
# ============================================================================
configure_environment() {
    log_step "Konfiguriere Environment..."
    
    cd "$PROJECT_DIR"
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        log_info "Erstelle .env aus Template..."
        cp deployment/.env.production .env
        log_warn "BITTE .env BEARBEITEN: nano .env"
        log_warn "JWT_SECRET muss geändert werden!"
    fi
    
    log_info "Environment konfiguriert!"
}

# ============================================================================
# BUILD DOCKER IMAGES
# ============================================================================
build_images() {
    log_step "Baue Docker Images..."
    
    cd "$PROJECT_DIR"
    docker compose -f deployment/docker-compose.prod.yml build --no-cache
    
    log_info "Images gebaut!"
}

# ============================================================================
# STOP EXISTING CONTAINERS
# ============================================================================
stop_containers() {
    log_step "Stoppe existierende Container..."
    
    cd "$PROJECT_DIR"
    docker compose -f deployment/docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    
    log_info "Container gestoppt!"
}

# ============================================================================
# START CONTAINERS
# ============================================================================
start_containers() {
    log_step "Starte Container..."
    
    cd "$PROJECT_DIR"
    docker compose -f deployment/docker-compose.prod.yml up -d
    
    log_info "Container gestartet!"
}

# ============================================================================
# CONFIGURE NGINX
# ============================================================================
configure_nginx() {
    log_step "Konfiguriere Nginx..."
    
    # Copy nginx config
    cp deployment/nginx/nginx-http.conf /etc/nginx/sites-available/openclaw
    ln -sf /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    
    # Test and reload nginx
    nginx -t
    systemctl reload nginx
    
    log_info "Nginx konfiguriert!"
}

# ============================================================================
# OBTAIN SSL CERTIFICATE
# ============================================================================
obtain_ssl() {
    log_step "Hole SSL Zertifikat..."
    
    if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        log_info "Hole Let's Encrypt Zertifikat..."
        
        # Stop nginx temporarily
        systemctl stop nginx
        
        # Obtain certificate
        certbot certonly \
            --standalone \
            --email "$ADMIN_EMAIL" \
            --agree-tos \
            --non-interactive \
            -d "$DOMAIN"
        
        # Start nginx again
        systemctl start nginx
        
        if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
            log_info "SSL Zertifikat erhalten!"
        else
            log_warn "SSL Zertifikat konnte nicht erhalten werden"
        fi
    else
        log_info "SSL Zertifikat bereits vorhanden"
    fi
}

# ============================================================================
# UPDATE NGINX WITH SSL
# ============================================================================
configure_nginx_ssl() {
    log_step "Konfiguriere Nginx mit SSL..."
    
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        # Update nginx config with SSL
        cp deployment/nginx/nginx-ssl.conf /etc/nginx/sites-available/openclaw
        systemctl reload nginx
        log_info "Nginx mit SSL konfiguriert!"
    else
        log_warn "SSL nicht konfiguriert - verwende HTTP"
    fi
}

# ============================================================================
# WAIT FOR SERVICES
# ============================================================================
wait_for_services() {
    log_step "Warte auf Services..."
    
    log_info "Prüfe Backend Health..."
    for i in {1..30}; do
        if curl -sf http://localhost:3002/health > /dev/null 2>&1; then
            log_info "Backend ist gesund!"
            break
        fi
        echo -n "."
        sleep 2
    done
    echo ""
}

# ============================================================================
# VERIFY DEPLOYMENT
# ============================================================================
verify_deployment() {
    log_step "Verifiziere Deployment..."
    
    echo ""
    echo "======================================"
    echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"
    echo "======================================"
    echo ""
    
    echo "📊 Container Status:"
    docker compose -f deployment/docker-compose.prod.yml ps
    
    echo ""
    echo "🌐 Zugriffspunkte:"
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        echo "   Frontend: https://$DOMAIN"
        echo "   Backend:  https://$DOMAIN/api"
        echo "   Health:   https://$DOMAIN/health"
    else
        echo "   Frontend: http://$DOMAIN"
        echo "   Backend:  http://$DOMAIN/api"
        echo "   Health:   http://$DOMAIN/health"
    fi
    
    echo ""
    echo "📝 Nützliche Befehle:"
    echo "   Logs:     docker compose -f deployment/docker-compose.prod.yml logs -f"
    echo "   Restart:  docker compose -f deployment/docker-compose.prod.yml restart"
    echo "   Update:   cd $PROJECT_DIR && git pull && ./deployment/update.sh"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
main() {
    echo ""
    echo "=============================================="
    echo -e "${GREEN}🚀 OpenClaw Server Deployment${NC}"
    echo "=============================================="
    echo "Domain: $DOMAIN"
    echo "Repository: $REPO_URL"
    echo "=============================================="
    echo ""
    
    check_prerequisites
    update_system
    install_dependencies
    configure_firewall
    setup_repository
    configure_environment
    stop_containers
    build_images
    start_containers
    wait_for_services
    configure_nginx
    obtain_ssl
    configure_nginx_ssl
    verify_deployment
}

# Run with arguments
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
        obtain_ssl
        configure_nginx_ssl
        ;;
    update)
        setup_repository
        stop_containers
        build_images
        start_containers
        ;;
    *)
        echo "Usage: $0 [deploy|build|start|stop|restart|ssl|update]"
        exit 1
        ;;
esac
