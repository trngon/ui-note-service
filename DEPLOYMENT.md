# UI Note Service - Production Deployment Guide

This guide explains how to deploy the UI Note Service to production using Docker and Traefik.

## Prerequisites

- Docker and Docker Compose installed
- Traefik reverse proxy running
- Domain `note.ngon.info` pointing to your server

## Quick Start

### 1. Build the Docker Image

```bash
./scripts/build.sh
```

### 2. Deploy to Production

```bash
./scripts/deploy.sh
```

### 3. Update Deployment

```bash
./scripts/update.sh
```

## Manual Deployment

### Build the Image

```bash
docker build -t ui-note-service:latest .
```

### Deploy with Docker Compose

```bash
# For production
docker-compose -f docker-compose.prod.yml up -d

# For development
docker-compose up -d
```

## Configuration

### Environment Variables

The application uses these environment variables in production:

- `NODE_ENV=production`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`
- `NEXT_TELEMETRY_DISABLED=1`

### Data Persistence

User data is stored in JSON files and persisted using Docker volumes:

- Production: `/opt/ui-note-service/data:/app/data`
- Development: `./data:/app/data`

### Traefik Configuration

The application is configured with these Traefik labels:

- **Domain**: `note.ngon.info`
- **HTTPS**: Automatic SSL with Let's Encrypt
- **Security Headers**: XSS protection, HSTS, frame denial
- **Rate Limiting**: 100 requests/second average, 50 burst
- **HTTP to HTTPS**: Automatic redirect

## Monitoring

### Health Checks

The container includes health checks that monitor:
- Application responsiveness
- API endpoint availability (`/api/docs`)

### Logs

View application logs:

```bash
# Production
docker-compose -f docker-compose.prod.yml logs -f

# Development
docker-compose logs -f
```

### Container Status

Check container status:

```bash
# Production
docker-compose -f docker-compose.prod.yml ps

# Development
docker-compose ps
```

## Backup and Recovery

### Backup User Data

```bash
# Create backup
sudo cp -r /opt/ui-note-service/data /backup/location/

# Restore backup
sudo cp -r /backup/location/data /opt/ui-note-service/
```

### Container Backup

```bash
# Export image
docker save ui-note-service:latest > ui-note-service-backup.tar

# Import image
docker load < ui-note-service-backup.tar
```

## Security

### Production Security Features

- **HTTPS Only**: All traffic redirected to HTTPS
- **Security Headers**: XSS protection, content type sniffing prevention
- **HSTS**: HTTP Strict Transport Security enabled
- **Rate Limiting**: Protection against abuse
- **Resource Limits**: CPU and memory constraints

### Recommended Additional Security

1. **Firewall**: Only allow ports 80, 443, and SSH
2. **SSH**: Use key-based authentication only
3. **Updates**: Keep system and Docker updated
4. **Monitoring**: Set up log monitoring and alerts

## Troubleshooting

### Common Issues

#### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check container status
docker ps -a
```

#### Traefik not routing traffic
```bash
# Verify labels
docker inspect ui-note-service-prod

# Check Traefik dashboard
# Access your Traefik dashboard to verify routing rules
```

#### Permission issues with data directory
```bash
# Fix permissions
sudo chown -R 1001:1001 /opt/ui-note-service/data
```

### Performance Tuning

#### Resource Limits

Adjust in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'        # Increase CPU limit
      memory: 2G         # Increase memory limit
    reservations:
      cpus: '1.0'        # Increase CPU reservation
      memory: 1G         # Increase memory reservation
```

#### Rate Limiting

Adjust Traefik rate limiting:

```yaml
- "traefik.http.middlewares.ui-note-service-ratelimit.ratelimit.average=200"  # Increase rate limit
- "traefik.http.middlewares.ui-note-service-ratelimit.ratelimit.burst=100"   # Increase burst limit
```

## API Documentation

Once deployed, the API documentation will be available at:
- https://note.ngon.info/docs - Interactive documentation
- https://note.ngon.info/api/docs - JSON specification

## Support

For issues and questions:
1. Check the logs first
2. Verify Traefik configuration
3. Ensure domain DNS is pointing correctly
4. Check firewall and security group settings
