# GitHub Copilot — Custom Instructions
# Docs: https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions
#
# Full project rules and context: .ai/AGENTS.md
# This file contains a summary for Copilot. Edit .ai/AGENTS.md for the source of truth.

## Project

Microservices university assignment. Technology-agnostic.
Run with: `docker compose up --build`

## Key Rules

- Every service exposes `GET /health` → `{"status": "ok"}`
- Services communicate via Docker Compose DNS (service names, not localhost)
- API specs in `docs/api-specs/*.yaml` (OpenAPI 3.0)
- Use environment variables for config — never hardcode secrets
- Code runs inside Docker containers
- Follow OpenAPI specs when implementing endpoints
