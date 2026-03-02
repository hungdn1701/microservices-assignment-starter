# Service B

> Rename this to match your actual service name (e.g., `product-service`, `payment-service`).

## Overview

Describe the responsibility of this service:
- What business domain does it cover?
- What data does it own?
- What operations does it expose?

## Tech Stack

| Component  | Choice             |
|------------|--------------------|
| Language   | *(e.g., Python, Node.js, Java, Go, C#)* |
| Framework  | *(e.g., FastAPI, Express, Spring Boot)*  |
| Database   | *(e.g., PostgreSQL, MongoDB, MySQL)*     |

## API Endpoints

| Method | Endpoint      | Description          |
|--------|---------------|----------------------|
| GET    | `/`           | Health check         |
| GET    | `/resources`  | List all resources   |
| POST   | `/resources`  | Create a resource    |
| ...    | ...           | ...                  |

> Full API specification: [`docs/api-specs/service-b.yaml`](../../docs/api-specs/service-b.yaml)

## Running Locally

```bash
# From project root
docker compose up service-b --build
```

## Testing

```bash
# Add your test commands here
```