# Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Production server (Ubuntu 20.04+ recommended)
- Domain name and SSL certificate
- Supabase project (optional)

## Environment Setup

1. Copy production environment file:
```bash
cp .env.production.example .env
```

2. Edit `.env` with production values:
```bash
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-long-random-secret-here
```

## Docker Build

### Build Backend
```bash
cd backend
docker build -t openclaw-backend:latest --target production .
```

### Build Frontend
```bash
cd frontend
docker build -t openclaw-frontend:latest --target production .
```

### Build Bot
```bash
cd bot
docker build -t openclaw-bot:latest --target production .
```

## Deploy with Docker Compose

### Production Deployment
```bash
# Copy production docker-compose
cp docker-compose.yml docker-compose.prod.yml

# Edit docker-compose.prod.yml for production:
# - Remove volume mounts for development
# - Add SSL/TLS configuration
# - Set resource limits
# - Configure logging

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Nginx Reverse Proxy (Optional)

For production, consider using Nginx as reverse proxy:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong passwords
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable logging and monitoring
- [ ] Remove development tools
- [ ] Keep dependencies updated

## Monitoring

### View Logs
```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f bot
```

### Health Checks
```bash
# Check container status
docker-compose ps

# Test health endpoints
curl http://localhost:3002/health
curl http://localhost:3000/health
```

## Update Deployment

```bash
# Pull latest images
docker pull openclaw-backend:latest
docker pull openclaw-frontend:latest
docker pull openclaw-bot:latest

# Restart services
docker-compose up -d
```

## Backup

```bash
# Backup data volume
docker run --rm -v openclaw-data:/data -v $(pwd)/backup:/backup alpine tar czf /backup/data-backup.tar.gz /data

# Backup to remote server
scp backup/data-backup.tar.gz user@server:/backups/
```

## Scaling

### Horizontal Scaling with Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.yml openclaw
```

### Kubernetes Deployment (Optional)
```bash
kubectl apply -f k8s/
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Check port conflicts
netstat -tuln | grep :3002

# Restart services
docker-compose restart
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Increase resources in docker-compose.yml
# Optimize database queries
# Enable caching
```

## Cleanup

```bash
# Remove old images
docker image prune -a

# Remove old containers
docker container prune

# Remove unused volumes
docker volume prune
```