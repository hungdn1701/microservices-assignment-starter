# System Architecture

> This document is completed **after** the Analysis and Design phase.
> Choose **one** analysis approach and complete it first:
> - [Analysis and Design — Step-by-Step Action](analysis-and-design.md)
> - [Analysis and Design — DDD](analysis-and-design-ddd.md)
>
> Both approaches produce the same inputs for this document: **Service Candidates**, **Service Composition**, and **Non-Functional Requirements**.

**References:**
1. *Service-Oriented Architecture: Analysis and Design for Services and Microservices* — Thomas Erl (2nd Edition)
2. *Microservices Patterns: With Examples in Java* — Chris Richardson
3. *Bài tập — Phát triển phần mềm hướng dịch vụ* — Hung Dang (available in Vietnamese)

---

### How this document connects to Analysis & Design

```
┌─────────────────────────────────────────────────────┐
│         Analysis & Design (choose one)              │
│                                                     │
│  Step-by-Step Action        DDD                     │
│  Part 1: Analysis Prep     Part 1: Domain Discovery │
│  Part 2: Decompose →       Part 2: Strategic DDD →  │
│    Service Candidates        Bounded Contexts       │
│  Part 3: Service Design    Part 3: Service Design   │
│    (contract + logic)        (contract + logic)     │
└────────────────┬────────────────────────────────────┘
                 │ inputs: service list, NFRs,
                 │         service contracts (API specs)
                 ▼
┌─────────────────────────────────────────────────────┐
│         Architecture (this document)                │
│                                                     │
│  1. Pattern Selection                               │
│  2. System Components (tech stack, ports)           │
│  3. Communication Matrix                            │
│  4. Architecture Diagram                            │
│  5. Deployment                                      │
└─────────────────────────────────────────────────────┘
```

> 💡 **What you need before starting:** your completed service list from Part 2 (service candidates and their responsibilities) and your service contracts from Part 3 (API endpoints). This document turns those logical designs into a concrete, deployable system architecture.

---

## 1. Pattern Selection

> **How to fill in this table:** Pattern choices must be traceable back to your analysis. Use the following inputs:
> - **NFRs (Part 1.3)** of your analysis document — e.g., "High Availability" → Circuit Breaker; "Independent Scalability" → Database per Service
> - **Service composition (Step-by-Step 2.8 or DDD 2.6–2.7)** — e.g., a long-running cross-service transaction → Saga; loose coupling between contexts → Event-driven
> - **Communication style from Part 3** — e.g., async notification requirements → Message Queue; read/write performance separation → CQRS
>
> Leave "Derived from" blank only if the pattern is selected for a reason not covered in the analysis (explain in Justification).

| Pattern | Selected? | Derived from (Analysis Step) | Business/Technical Justification |
|---------|-----------|------------------------------|----------------------------------|
| API Gateway | | | |
| Database per Service | | | |
| Shared Database | | | |
| Saga | | | |
| Event-driven / Message Queue | | | |
| CQRS | | | |
| Circuit Breaker | | | |
| Service Registry / Discovery | | | |
| Other: ___ | | | |

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

> **How to fill in this table:**
>
> Each cell describes **how** the row component talks to the column component. Use one of the values below — choose based on your Pattern Selection (Section 1) and your service contracts (`docs/api-specs/`):
>
> | Value | Meaning | When to use |
> |-------|---------|-------------|
> | `REST` | Synchronous HTTP/JSON call | Default for Gateway → Service, Frontend → Gateway |
> | `gRPC` | Synchronous binary RPC (Protocol Buffers) | Service-to-service calls where performance matters; requires `x-grpc` filled in `service-*.yaml` |
> | `async/event` | Fire-and-forget via message broker (Kafka, RabbitMQ) | Cross-context notifications; requires `x-async-events` filled in `service-*.yaml` and Message Broker in diagram |
> | `TCP` | Direct database protocol | Service → its own database only (never cross-service DB access) |
> | `—` | No direct communication | Leave as `—`, do not leave blank |
>
> **Rules:**
> - A service should **only** connect to its **own** database (Database per Service pattern). If Service A and Service B share one database, mark it as `Shared DB` and justify in Section 1.
> - Frontend should **never** call a service directly — all traffic goes through the Gateway.
> - If two services need to exchange data, choose either `gRPC` (synchronous) or `async/event` (asynchronous) — not a direct database read across services.
>
> **Example (food delivery domain):**
>
> | From → To     | Order Service | Payment Service | Gateway | DB-Orders | DB-Payments |
> |---------------|---------------|-----------------|---------|-----------|-------------|
> | **Frontend**  | —             | —               | REST    | —         | — |
> | **Gateway**   | REST          | REST            | —       | —         | — |
> | **Order Svc** | —             | async/event     | —       | TCP       | — |
> | **Payment Svc**| async/event  | —               | —       | —         | TCP |

### Your Communication Matrix

> Replace the column/row headers with your actual service names from Section 2.

| From → To     | Service A | Service B | Gateway | Database |
|---------------|-----------|-----------|---------|----------|
| **Frontend**  |           |           |         |          |
| **Gateway**   |           |           |         |          |
| **Service A** |           |           |         |          |
| **Service B** |           |           |         |          |

---

## 4. Architecture Diagram

> These diagrams represent the **full deployment view** — showing every runtime component as it actually runs in production/Docker Compose. This is the completed picture that corresponds to the logical service map you drew in your analysis (Context Map in DDD 2.6, or Service Composition in Step-by-Step 2.8).
>
> Update the diagrams below to match your actual components. Remove any components you are not using (e.g., remove the Message Broker block if you chose synchronous-only communication).

### 4.1 System Context (C4 Level 1)

Who uses the system and what external systems does it interact with?

```mermaid
C4Context
    title System Context — [Your System Name]

    Person(user, "End User", "Uses the system via a web browser or mobile app")
    Person(admin, "Administrator", "Manages system configuration and monitors health")

    System(system, "[Your System Name]", "Automates [your business process]")

    System_Ext(extPayment, "Payment Gateway", "Processes payments (e.g., Stripe, VNPay)")
    System_Ext(extEmail, "Email / SMS Provider", "Sends notifications (e.g., SendGrid, Twilio)")

    Rel(user, system, "Uses", "HTTPS")
    Rel(admin, system, "Monitors / configures", "HTTPS")
    Rel(system, extPayment, "Processes payment via", "HTTPS/REST")
    Rel(system, extEmail, "Sends notifications via", "HTTPS/REST")
```

> 💡 Remove or replace `extPayment` and `extEmail` with your actual external systems. If there are none, remove those lines.

### 4.2 Container Diagram (C4 Level 2) — Full Deployment View

All runtime containers and how they communicate. This is the **primary architecture diagram**.

```mermaid
C4Container
    title Container Diagram — [Your System Name]

    Person(user, "End User")

    Container_Boundary(sys, "Your System") {
        Container(fe, "Frontend", "React / Vue / plain HTML", "Serves the UI. Port 3000")
        Container(gw, "API Gateway", "Nginx / Node / Traefik", "Single entry point — routes requests, handles auth. Port 8080")

        Container(sa, "Service A", "Python / Node / Java / ...", "Handles [Bounded Context A / Entity A]. Port 5001")
        Container(sb, "Service B", "Python / Node / Java / ...", "Handles [Bounded Context B / Entity B]. Port 5002")

        ContainerDb(dba, "Database A", "PostgreSQL / MongoDB / ...", "Stores data for Service A. Port 5432")
        ContainerDb(dbb, "Database B", "PostgreSQL / MongoDB / ...", "Stores data for Service B. Port 5433")

        %% Uncomment if you are using a Service Registry:
        %% Container(registry, "Service Registry", "Consul / Eureka", "Service discovery and health tracking. Port 8500")

        %% Uncomment if you are using a Message Broker:
        %% Container(broker, "Message Broker", "Kafka / RabbitMQ", "Async event bus between services. Port 9092")
    }

    Rel(user, fe, "Uses", "HTTPS")
    Rel(fe, gw, "API calls", "HTTP/REST")
    Rel(gw, sa, "Routes to", "HTTP/REST")
    Rel(gw, sb, "Routes to", "HTTP/REST")
    Rel(sa, dba, "Reads/Writes", "TCP")
    Rel(sb, dbb, "Reads/Writes", "TCP")

    %% Uncomment and adjust for async communication:
    %% Rel(sa, broker, "Publishes events", "TCP")
    %% Rel(broker, sb, "Delivers events", "TCP")

    %% Uncomment for gRPC inter-service:
    %% Rel(sa, sb, "Calls", "gRPC")
```

> 💡 **How to adapt this diagram:**
> - Replace placeholder names with your actual service names from your analysis.
> - Uncomment the Message Broker block if you selected Event-driven pattern in Section 1.
> - Uncomment the Service Registry block if you selected Service Registry/Discovery in Section 1.
> - Change `HTTP/REST` to `gRPC` on any inter-service edge where you use gRPC (see `docs/api-specs/grpc-spec-guide.md`).
> - Add more `Container` or `ContainerDb` blocks for additional services or databases.

---

## 5. Deployment

- All services containerized with Docker
- Orchestrated via Docker Compose
- Single command: `docker compose up --build`

> 💡 **Service communication inside Docker Compose:** Use Docker Compose service names as hostnames (e.g., `http://service-a:5001`), not `localhost`. The Gateway handles all inbound external traffic on port 8080.

---

## API Specification Formats

Depending on your communication style, use the appropriate specification format:

| Communication Style | Format | Location |
|---------------------|--------|----------|
| Synchronous REST (HTTP) | OpenAPI 3.0 YAML | `docs/api-specs/service-*.yaml` |
| gRPC (binary, high-performance sync) | Protocol Buffers `.proto` | See [`docs/api-specs/grpc-spec-guide.md`](api-specs/grpc-spec-guide.md) |
| Async / Message Broker (Kafka, RabbitMQ) | AsyncAPI 2.x YAML | See [`docs/api-specs/async-spec-guide.md`](api-specs/async-spec-guide.md) |
