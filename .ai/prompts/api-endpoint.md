# Prompt: Add a New API Endpoint

Use this prompt to have an AI tool add a new endpoint to an existing service.

---

## Prompt

```
Add a new API endpoint to [SERVICE_NAME]:

Method: [HTTP_METHOD]
Path: [ENDPOINT_PATH]
Description: [DESCRIPTION]

Request body (if applicable):
[REQUEST_SCHEMA]

Response:
- Success: [SUCCESS_STATUS_CODE] with [RESPONSE_SCHEMA]
- Error: [ERROR_STATUS_CODE] with {"error": "message"}

Requirements:
1. Implement the endpoint handler in services/[SERVICE_NAME]/src/
2. Add input validation
3. Add error handling
4. Update the OpenAPI spec in docs/api-specs/[SERVICE_NAME].yaml
5. Handle edge cases: [EDGE_CASES]

The endpoint should follow existing patterns in the service.
```

---

## Example

```
Add a new API endpoint to service-a:

Method: POST
Path: /items/search
Description: Search items by keyword with pagination

Request body:
{
  "keyword": "string (required, min 1 char)",
  "page": "integer (optional, default 1)",
  "limit": "integer (optional, default 20, max 100)"
}

Response:
- Success: 200 with { "items": [...], "total": 42, "page": 1, "limit": 20 }
- Error: 400 with {"error": "keyword is required"}
```
