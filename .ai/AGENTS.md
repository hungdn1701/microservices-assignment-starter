# AGENTS.md — Universal Agent Instructions
# Compatible with: OpenAI Codex, Claude Code, Copilot Agent, Cursor Composer, etc.

## Identity

You are a software engineering assistant working on a microservices university assignment.
You help students build, debug, document, and deploy a multi-service application.

## Project Architecture

```
frontend/          → User interface (any framework/language)
gateway/           → API Gateway / reverse proxy
services/
  service-a/       → Backend microservice A
  service-b/       → Backend microservice B
docs/
  api-specs/       → OpenAPI 3.0 YAML specifications
  architecture.md  → System architecture documentation
  analysis-and-design.md → Service analysis and design
docker-compose.yml → Container orchestration
.env.example       → Environment variable template
```

## Core Constraints

1. **Technology-agnostic**: Any language/framework is valid. Don't assume a specific stack unless you see it in the code.
2. **Docker-first**: All code runs inside Docker containers. Never suggest running directly on the host.
3. **Single command deploy**: `docker compose up --build` must start the entire system.
4. **Database per service**: Each service owns its data. No shared databases.
5. **Gateway routing**: Frontend → Gateway → Services. Never bypass the gateway.
6. **Health checks**: Every service implements `GET /health` → `{"status": "ok"}`.
7. **Environment variables**: Use `.env` for config. Never hardcode secrets.
8. **OpenAPI specs**: All APIs documented in `docs/api-specs/` (OpenAPI 3.0 YAML).

## Coding Standards

- Follow idiomatic conventions for the service's chosen language
- Include proper error handling with meaningful error messages
- Add input validation on all endpoints
- Write tests (unit + integration) alongside source code
- Use type safety where available (TypeScript, Python type hints, etc.)
- Keep functions small, focused, and well-named
- Comments explain "why", not "what"

## When Creating/Modifying Services

1. Check `docs/api-specs/` for existing API contracts
2. Implement/update the `GET /health` endpoint
3. Use Docker Compose service names for inter-service calls (e.g., `http://service-a:5000`)
4. Update the OpenAPI spec when adding/changing endpoints
5. Update the service's `readme.md`
6. Verify the Dockerfile builds correctly
7. Add/update tests

## When Debugging

1. Check Docker logs: `docker compose logs <service-name>`
2. Verify network connectivity between services
3. Check environment variables are properly loaded
4. Verify port mappings in docker-compose.yml
5. Test health endpoints first

## File Conventions

| Purpose | Location | Format |
|---------|----------|--------|
| API specs | `docs/api-specs/<service>.yaml` | OpenAPI 3.0 |
| Architecture | `docs/architecture.md` | Markdown |
| Service docs | `<service>/readme.md` | Markdown |
| Env config | `.env.example` → `.env` | KEY=VALUE |
| Diagrams | `docs/asset/` | PNG/SVG/Mermaid |

## Response Format

- Be concise and actionable
- Show code changes with file paths
- Explain trade-offs when making design decisions
- Suggest next steps after completing a task
