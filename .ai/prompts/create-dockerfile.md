# Prompt: Generate a Dockerfile

Use this prompt to create an optimized Dockerfile for any service.

---

## Prompt

```
Generate a production-ready Dockerfile for a [LANGUAGE]/[FRAMEWORK] application.

Service location: [SERVICE_PATH]
Entry point: [ENTRY_POINT]
Port: [PORT]

Requirements:
1. Multi-stage build (builder + runtime)
2. Use a minimal base image (alpine when possible)
3. Install dependencies separately for Docker layer caching
4. Copy only necessary files to the final image
5. Run as non-root user
6. Set proper WORKDIR
7. Expose the correct port
8. Include a HEALTHCHECK instruction
9. Use .dockerignore to exclude unnecessary files

Optimize for:
- Small image size
- Fast build times (layer caching)
- Security (non-root, minimal packages)
```

---

## Example

```
Generate a production-ready Dockerfile for a Python/FastAPI application.

Service location: services/service-a/
Entry point: uvicorn src.main:app --host 0.0.0.0 --port 5000
Port: 5000
```
