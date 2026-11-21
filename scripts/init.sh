#!/usr/bin/env bash
# ==============================================
# Project Initialization Script
# Usage: bash scripts/init.sh
# ==============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Initializing Microservices Project..."
echo "==========================================="

# --- 1. Environment file ---
if [ ! -f "$PROJECT_DIR/.env" ]; then
  cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
  echo "✅ Created .env from .env.example"
else
  echo "ℹ️  .env already exists, skipping"
fi

# --- 2. Check Docker ---
if command -v docker &> /dev/null; then
  echo "✅ Docker found: $(docker --version)"
else
  echo "❌ Docker not found. Please install Docker Desktop."
  echo "   https://docs.docker.com/get-docker/"
  exit 1
fi

# --- 3. Check Docker Compose ---
if docker compose version &> /dev/null; then
  echo "✅ Docker Compose found: $(docker compose version --short)"
elif command -v docker-compose &> /dev/null; then
  echo "✅ Docker Compose (legacy) found: $(docker-compose --version)"
else
  echo "❌ Docker Compose not found."
  exit 1
fi

# No build here: the Dockerfiles are placeholders until you pick a stack (next steps 2-3).

echo ""
echo "==========================================="
echo "✅ Project initialized successfully!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your configuration"
echo "  2. Implement your services in services/*/src/"
echo "  3. Update Dockerfiles for your chosen stack"
echo "  4. Run: docker compose up --build"
echo "  5. Or use: make up"
echo "==========================================="