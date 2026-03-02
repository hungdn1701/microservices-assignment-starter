# Prompt: Generate Tests

Use this prompt to create comprehensive tests for a service or endpoint.

---

## Prompt

```
Generate tests for [SERVICE_NAME] using [TEST_FRAMEWORK].

Test the following:
1. Health check endpoint (GET /health returns 200 with {"status": "ok"})
2. CRUD operations for [ENTITY]:
   - GET /[ENTITIES] returns a list
   - GET /[ENTITIES]/:id returns a single item or 404
   - POST /[ENTITIES] creates with valid data, rejects invalid data
   - PUT /[ENTITIES]/:id updates existing, returns 404 for missing
   - DELETE /[ENTITIES]/:id deletes existing, returns 404 for missing
3. Input validation (missing fields, wrong types, boundary values)
4. Error handling (database errors, network errors)

Requirements:
- Use [TEST_FRAMEWORK] conventions
- Include setup/teardown for test data
- Mock external dependencies (database, other services)
- Test both happy path and error cases
- Include meaningful test descriptions
- Aim for >80% code coverage

Place test files in: services/[SERVICE_NAME]/tests/ (or src/__tests__/ for Node.js)
```

---

## Example Framework Choices

| Language   | Test Frameworks                     |
|------------|-------------------------------------|
| Python     | pytest, unittest                    |
| Node.js    | Jest, Mocha, Vitest                 |
| Java       | JUnit 5, Mockito                    |
| Go         | testing (stdlib), testify           |
| C#         | xUnit, NUnit, MSTest                |
| Rust       | cargo test (built-in)               |
