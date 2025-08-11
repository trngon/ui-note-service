#!/bin/bash

# UI Note Service - Deploy Script
# This script deploys the application using docker-compose

set -e

echo "🚀 Deploying UI Note Service to production..."

# Create necessary directories
echo "📁 Creating data directories..."
sudo mkdir -p /opt/ui-note-service/data
sudo mkdir -p /opt/ui-note-service/logs
sudo chown $USER:$USER /opt/ui-note-service/data
sudo chown $USER:$USER /opt/ui-note-service/logs

# Stop existing container if running
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

# Deploy with production compose file
echo "🔄 Starting production deployment..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for container to be healthy
echo "⏳ Waiting for service to be healthy..."
sleep 10

# Check container status
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo "📝 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo "✅ Deployment complete!"
echo "🌐 Service should be available at: https://note.ngon.info"
