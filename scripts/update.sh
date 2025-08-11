#!/bin/bash

# UI Note Service - Update Script
# This script updates the application by rebuilding and redeploying

set -e

echo "🔄 Updating UI Note Service..."

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull
fi

# Build new image
echo "🔨 Building new Docker image..."
./scripts/build.sh

# Backup current data (optional)
BACKUP_DIR="/opt/ui-note-service/backups/$(date +%Y%m%d-%H%M%S)"
echo "💾 Creating backup at $BACKUP_DIR..."
sudo mkdir -p $BACKUP_DIR
sudo cp -r /opt/ui-note-service/data $BACKUP_DIR/

# Deploy updated version
echo "🚀 Deploying updated version..."
./scripts/deploy.sh

echo "✅ Update complete!"
