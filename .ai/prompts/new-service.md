# Prompt: Scaffold a New Microservice

Use this prompt to have an AI tool generate a complete microservice scaffold.

---

## Prompt

```
Create a new microservice called [SERVICE_NAME] using [LANGUAGE] and [FRAMEWORK].

Location: services/[SERVICE_NAME]/

Requirements:
1. Project structure following [FRAMEWORK] best practices
2. Dockerfile with multi-stage build
3. GET /health endpoint returning {"status": "ok"}
4. Basic CRUD endpoints for [ENTITY_NAME]:
   - GET /[ENTITY_PLURAL] — list all
   - GET /[ENTITY_PLURAL]/:id — get by ID
   - POST /[ENTITY_PLURAL] — create
   - PUT /[ENTITY_PLURAL]/:id — update
   - DELETE /[ENTITY_PLURAL]/:id — delete
5. Database connection using environment variables (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
6. Input validation and error handling
7. OpenAPI spec in docs/api-specs/[SERVICE_NAME].yaml
8. Basic unit tests
9. Update docker-compose.yml to include this service
10. Service readme.md with setup instructions

The service should:
- Listen on port 5000 inside the container
- Use environment variables from .env
- Be accessible via the API gateway
- Follow RESTful conventions
```

---

## Example Usage

Replace placeholders:
- `[SERVICE_NAME]` → `user-service`
- `[LANGUAGE]` → `Python`
- `[FRAMEWORK]` → `FastAPI`
- `[ENTITY_NAME]` → `User`
- `[ENTITY_PLURAL]` → `users`
