# Project Name

[![Stars](https://img.shields.io/github/stars/hungdn1701/microservices-assignment-starter?style=social)](https://github.com/hungdn1701/microservices-assignment-starter/stargazers)
[![Forks](https://img.shields.io/github/forks/hungdn1701/microservices-assignment-starter?style=social)](https://github.com/hungdn1701/microservices-assignment-starter/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Brief description of the business process being automated and the service-oriented solution.

> **New to this repo?** See [`GETTING_STARTED.md`](GETTING_STARTED.md) for setup instructions and workflow guide.

---

## Team Members

| Name | Student ID | Role | Contribution |
|------|------------|------|-------------|
|      |            |      |             |

---

## Business Process

*(Summarize the business process being automated — domain, actors, scope)*

---

## Architecture

```mermaid
graph LR
    U[User] --> FE[Frontend :3000]
    FE --> GW[API Gateway :8080]
    GW --> SA[Service A :5001]
    GW --> SB[Service B :5002]
    SA --> DB1[(Database A)]
    SB --> DB2[(Database B)]
```

| Component     | Responsibility | Tech Stack | Port |
|---------------|----------------|------------|------|
| **Frontend**  |                |            | 3000 |
| **Gateway**   |                |            | 8080 |
| **Service A** |                |            | 5001 |
| **Service B** |                |            | 5002 |

> Full documentation: [`docs/architecture.md`](docs/architecture.md) · [`docs/analysis-and-design.md`](docs/analysis-and-design.md)

---

## Getting Started

```bash
# Clone and initialize
git clone <your-repo-url>
cd <project-folder>
cp .env.example .env

# Build and run
docker compose up --build
```

### Verify

```bash
curl http://localhost:8080/health   # Gateway
curl http://localhost:5001/health   # Service A
curl http://localhost:5002/health   # Service B
```

---

## API Documentation

- [Service A — OpenAPI Spec](docs/api-specs/service-a.yaml)
- [Service B — OpenAPI Spec](docs/api-specs/service-b.yaml)

---

## Submission Checklist

- [ ] `README.md` updated with team info and service descriptions
- [ ] All services start with `docker compose up --build`
- [ ] Every service has a working `GET /health` endpoint
- [ ] [`docs/analysis-and-design.md`](docs/analysis-and-design.md) completed
- [ ] [`docs/architecture.md`](docs/architecture.md) completed
- [ ] OpenAPI specs match implementation
- [ ] API documentation complete in `docs/api-specs/`
- [ ] Architecture documented in `docs/architecture.md`
- [ ] Analysis and design documented in `docs/analysis-and-design.md`
- [ ] Each service has its own `readme.md`
- [ ] Code is clean, organized, and follows chosen language conventions
- [ ] Tests are included and passing

---

## Author

This template was created by **Hung Dang**.
- Email: hungdn@ptit.edu.vn
- GitHub: [hungdn1701](https://github.com/hungdn1701)

Good luck! 💪🚀

