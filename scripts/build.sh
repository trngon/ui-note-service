#!/bin/bash

# UI Note Service - Build Script
# This script builds the Docker image for production deployment

set -e

echo "🚀 Building UI Note Service Docker image..."

# Build the Docker image
docker build -t ui-note-service:latest .

echo "✅ Docker image built successfully!"

# Optional: Tag with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker tag ui-note-service:latest ui-note-service:$TIMESTAMP

echo "📦 Tagged image as ui-note-service:$TIMESTAMP"

# Show image info
echo "📋 Image information:"
docker images ui-note-service:latest

echo "🎉 Build complete! Ready for deployment."
