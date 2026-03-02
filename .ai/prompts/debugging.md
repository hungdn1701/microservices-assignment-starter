# Prompt: Debug an Issue

Use this prompt when you encounter a bug or error in the system.

---

## Prompt

```
I'm encountering an issue in my microservices project:

**Service**: [SERVICE_NAME]
**Error message**: [ERROR_MESSAGE]
**When it happens**: [TRIGGER_DESCRIPTION]
**Expected behavior**: [EXPECTED]
**Actual behavior**: [ACTUAL]

Environment:
- Language/Framework: [LANGUAGE/FRAMEWORK]
- Running via: docker compose up --build
- OS: [OS]

Relevant logs:
```
[PASTE LOGS HERE]
```

Please:
1. Analyze the error and identify the root cause
2. Suggest a fix with code changes
3. Explain why this happened to help me learn
4. Suggest how to prevent similar issues
```

---

## Common Debug Commands

```bash
# View logs for a specific service
docker compose logs service-a

# Follow logs in real-time
docker compose logs -f service-a

# Check running containers
docker compose ps

# Enter a running container
docker compose exec service-a sh

# Rebuild a specific service
docker compose up --build service-a

# Check network connectivity
docker compose exec service-a ping service-b

# Check environment variables
docker compose exec service-a env
```
