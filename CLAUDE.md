# CLAUDE.md — Instructions for Claude Code
# Docs: https://docs.anthropic.com/en/docs/claude-code
#
# Full project rules and context: .ai/AGENTS.md
# This file contains a summary for Claude. Edit .ai/AGENTS.md for the source of truth.

## Project

Microservices university assignment. Technology-agnostic.
Run with: `docker compose up --build`

## Key Rules

- Every service exposes `GET /health` → `{"status": "ok"}`
- Services communicate via Docker Compose DNS (service names, not localhost)
- API specs in `docs/api-specs/*.yaml` (OpenAPI 3.0)
- Use environment variables for config — never hardcode secrets
- Code runs inside Docker containers

## When Making Changes

1. Check `docs/api-specs/` before implementing endpoints
2. Update OpenAPI specs when adding/modifying endpoints
3. Use service names for inter-service calls (e.g., `http://service-a:5000`)
4. Update the service's `readme.md` when changing behavior
5. Run `docker compose build` to verify changes
