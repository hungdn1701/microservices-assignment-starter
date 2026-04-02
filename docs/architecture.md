# System Architecture

> This document is completed **after** [Analysis and Design](analysis-and-design.md).
> Based on the Service Candidates and Non-Functional Requirements identified there, select appropriate architecture patterns and design the deployment architecture.

**References:**
1. *Service-Oriented Architecture: Analysis and Design for Services and Microservices* — Thomas Erl (2nd Edition)
2. *Microservices Patterns: With Examples in Java* — Chris Richardson
3. *Bài tập — Phát triển phần mềm hướng dịch vụ* — Hung Dang (available in Vietnamese)

---

## 1. Pattern Selection

Select patterns based on business/technical justifications from your analysis.

| Pattern | Selected? | Business/Technical Justification |
|---------|-----------|----------------------------------|
| API Gateway | | |
| Database per Service | | |
| Shared Database | | |
| Saga | | |
| Event-driven / Message Queue | | |
| CQRS | | |
| Circuit Breaker | | |
| Service Registry / Discovery | | |
| Other: ___ | | |

> Reference: *Microservices Patterns* — Chris Richardson, chapters on decomposition, data management, and communication patterns.

---

## 2. System Components

| Component     | Responsibility | Tech Stack      | Port  |
|---------------|----------------|-----------------|-------|
| **Frontend**  |                | *(your choice)* | 3000  |
| **Gateway**   |                | *(your choice)* | 8080  |
| **Service A** |                | *(your choice)* | 5001  |
| **Service B** |                | *(your choice)* | 5002  |
| **Database**  |                | *(your choice)* | 5432  |

---

## 3. Communication

### Inter-service Communication Matrix

| From → To     | Service A | Service B | Gateway | Database |
|---------------|-----------|-----------|---------|----------|
| **Frontend**  |           |           |         |          |
| **Gateway**   |           |           |         |          |
| **Service A** |           |           |         |          |
| **Service B** |           |           |         |          |

---

## 4. Architecture Diagram

> Place diagrams in `docs/asset/` and reference here.

```mermaid
graph LR
    U[User] --> FE[Frontend]
    FE --> GW[API Gateway]
    GW --> SA[Service A]
    GW --> SB[Service B]
    SA --> DB1[(Database A)]
    SB --> DB2[(Database B)]
```

---

## 5. Deployment

- All services containerized with Docker
- Orchestrated via Docker Compose
- Single command: `docker compose up --build`
