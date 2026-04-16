# Analysis and Design — Domain-Driven Design Approach

> **Goal**: Analyze a specific business process and design a service-oriented automation solution using Domain-Driven Design.
> **Scope**: 4–6 week assignment — focus on **one business process**, not an entire system.
>
> **Alternative to**: [`analysis-and-design.md`](analysis-and-design.md) (Step-by-Step Action approach).
> Choose **one** approach, not both. Use this if your team prefers discovering service boundaries through **domain knowledge and business semantics** rather than action decomposition.

**References:**
1. *Domain-Driven Design: Tackling Complexity in the Heart of Software* — Eric Evans
2. *Microservices Patterns: With Examples in Java* — Chris Richardson
3. *Bài tập — Phát triển phần mềm hướng dịch vụ* — Hung Dang (available in Vietnamese)

---

### How DDD differs from Step-by-Step Action

| | Step-by-Step Action | DDD (this document) |
|---|---|---|
| **Thinking direction** | Bottom-up: concrete actions → group → service | Dual: top-down framing + bottom-up discovery |
| **Service boundary decided by** | Similarity of actions/functions | Semantic boundary of business domain |
| **Best suited for** | Small–medium systems, clearer technical scope | Complex business logic, multiple subdomains |
| **Key risk** | Services may be fragmented by technical logic | Requires deep domain understanding upfront |

Both approaches lead to a list of services with clear responsibilities. DDD produces services aligned with *business boundaries* — changes in one business area only affect the corresponding service.

> 💡 **DDD's dual direction explained:**
> - **Top-down — strategic framing**: you start by understanding the business domain as a whole, building a shared vocabulary (Ubiquitous Language) before touching any implementation detail. This prevents premature fragmentation by technical concerns.
> - **Bottom-up — tactical discovery (Event Storming)**: within the domain, you discover the structure by listing granular events → tracing commands → clustering aggregates → drawing bounded contexts. This is deliberately bottom-up so that structure *emerges* from real business facts rather than being imposed from a high-level guess.
>
> The combination is intentional: the domain framing guides *what* you're looking for, while Event Storming builds it *from the ground up* using business evidence.

### Progression Overview

| Step | What you do | Output |
|------|------------|--------|
| **1.1** | Define the Business Process | Process diagram, actors, scope |
| **1.2** | Survey existing systems | System inventory |
| **1.3** | State non-functional requirements | NFR table |
| **2.1** | Build a shared domain vocabulary | Ubiquitous Language glossary |
| **2.2** | Discover Domain Events via Event Storming | Chronological event list |
| **2.3** | Identify Commands and Actors | Command → Event mapping |
| **2.4** | Form Aggregates from related Commands/Events | Aggregate table with owned data |
| **2.5** | Draw Bounded Contexts around Aggregates | Bounded Context → service candidate |
| **2.6** | Map relationships between Bounded Contexts | Context Map diagram + relationship table |
| **2.7** | Design service interactions | Service composition diagram |
| **3.1** | Specify service contracts | OpenAPI endpoint tables |
| **3.2** | Design internal service logic | Flowchart per service |

---

## Part 1 — Domain Discovery

### 1.1 Business Process Definition

Describe the **one** business process your team will automate. Keep scope realistic for 4–6 weeks.

- **Domain**: *(e.g., Online Food Delivery, University Course Registration, ...)*
- **Business Process**: *(e.g., "Customer places an order and receives delivery")*
- **Actors**: *(e.g., Customer, Restaurant Owner, Delivery Driver)*
- **Scope**: *(e.g., "From order placement to delivery confirmation — excluding payment settlement")*

**Process Diagram:**

*(Insert BPMN, flowchart, or image into `docs/asset/` and reference here)*

> 💡 **Tip:** A good scope for this assignment is a process with 5–15 steps and 2–4 actors. If your process has more than 20 steps, narrow the scope.

### 1.2 Existing Automation Systems

List existing systems, databases, or legacy logic related to this process.

| System Name | Type | Current Role | Interaction Method |
|-------------|------|--------------|-------------------|
|             |      |              |                   |

> If none exist, state: *"None — the process is currently performed manually."*

### 1.3 Non-Functional Requirements

Non-functional requirements help justify design decisions in later steps (e.g., why a particular bounded context deserves an independent service).

| Requirement    | Description |
|----------------|-------------|
| Performance    |             |
| Security       |             |
| Scalability    |             |
| Availability   |             |

---

## Part 2 — Strategic Domain-Driven Design

> In DDD, **strategic framing is top-down** (we understand the domain vocabulary and boundaries first), but **tactical discovery is bottom-up** (we list events → trace commands → cluster aggregates → draw bounded contexts). This dual direction is what makes DDD powerful: domain knowledge guides the discovery, while bottom-up evidence prevents over-engineering boundaries that don't reflect real business facts.

### 2.1 Ubiquitous Language

Before diving into events and commands, build a **shared vocabulary** — the Ubiquitous Language. This ensures everyone (developer, BA, domain expert) uses the same terms consistently.

> 💡 **How to do it:** List every important noun and verb that appears when you describe the business process. Give each term a precise definition. Avoid synonyms — pick one term and stick with it.

| Term | Definition | Example |
|------|-----------|---------|
| *(e.g., Order)* | *(A request from a customer to purchase one or more menu items)* | *(Customer places an Order containing 2 pizzas)* |
| *(e.g., Fulfillment)* | *(The process of preparing and delivering an order to the customer)* | *(Restaurant marks the Order as ready for Fulfillment)* |
|      |           |         |

> ⚠️ **Common mistake:** Using the same word with different meanings in different contexts (e.g., "Account" means a user profile in one place but a financial ledger in another). If this happens, it's a strong signal that you have **two Bounded Contexts**.

### 2.2 Event Storming — Domain Events

**Domain Events** are things that **have happened** in the business process. Write them in **past tense**.

> 💡 **How to do it:** Walk through the business process from start to finish. At each step, ask: *"What just happened that the business cares about?"* Write it down as a Domain Event. Don't worry about grouping yet — just list them in chronological order.

| # | Domain Event | Description |
|---|-------------|-------------|
| 1 | *(e.g., OrderPlaced)* | *(Customer submitted an order with items and delivery address)* |
| 2 | *(e.g., OrderConfirmed)* | *(Restaurant accepted the order and started preparation)* |
| 3 | *(e.g., PaymentReceived)* | *(Payment for the order was successfully processed)* |
|   |             |             |

> 💡 **How many events?** For a process with 5–15 steps, expect 8–20 domain events. If you have fewer than 5, your process may be too simple; if more than 30, consider narrowing scope.

### 2.3 Commands and Actors

A **Command** is the action that **causes** a Domain Event to happen. Every event should trace back to at least one command.

> 💡 **How to do it:** For each Domain Event in 2.2, ask: *"What action triggered this?"* and *"Who performed that action?"* Use **imperative** form (e.g., "PlaceOrder", not "OrderPlaced").

| Command | Actor | Triggers Event(s) | Description |
|---------|-------|--------------------|-------------|
| *(e.g., PlaceOrder)* | *(Customer)* | *(OrderPlaced)* | *(Customer submits selected items with delivery info)* |
| *(e.g., ConfirmOrder)* | *(Restaurant Owner)* | *(OrderConfirmed)* | *(Restaurant accepts and begins preparing the order)* |
|         |       |                    |             |

> ⚠️ **Check:** Every Domain Event from 2.2 should appear in the "Triggers Event(s)" column at least once. If an event has no command, it might be triggered by another event (event chaining) — note that in the Description.

### 2.4 Aggregates

An **Aggregate** is a cluster of closely related data and behavior, grouped around a **root entity**. The Aggregate enforces business rules for that cluster.

> 💡 **How to do it:** Look at your Commands and Events from 2.2–2.3. Ask: *"Which business entity does this command operate on?"* Commands that modify the same entity and its closely related data belong to the same Aggregate.

| Aggregate | Root Entity | Commands | Domain Events | Key Business Rules |
|-----------|------------|----------|---------------|--------------------|
| *(e.g., Order)* | *(Order)* | *(PlaceOrder, CancelOrder)* | *(OrderPlaced, OrderCancelled)* | *(Order total must be > 0; max 50 items per order)* |
| *(e.g., Payment)* | *(Payment)* | *(ProcessPayment, RefundPayment)* | *(PaymentReceived, PaymentRefunded)* | *(Payment amount must match order total)* |
|           |          |          |               |                    |

> 💡 **Rule of thumb:** If two pieces of data **must be updated together** to keep the business consistent, they belong in the same Aggregate. If they can change independently, they probably belong to different Aggregates.

### 2.5 Bounded Contexts

A **Bounded Context** is a boundary within which the Ubiquitous Language (2.1) has a single, consistent meaning. Each Bounded Context becomes a **service candidate**.

> 💡 **How to do it:** Look at your Aggregates from 2.4. Ask:
> 1. *"Do these Aggregates share the same language/terms with the same meaning?"*
> 2. *"Would they be managed by the same team or business unit?"*
> 3. *"Do they change for the same business reasons?"*
>
> If yes → same Bounded Context. If no → different Bounded Contexts.

| Bounded Context | Aggregates Included | Responsibility | Service Candidate |
|-----------------|---------------------|----------------|-------------------|
| *(e.g., Ordering)* | *(Order, Cart)* | *(Manages the lifecycle of customer orders from placement to completion)* | *(order-service)* |
| *(e.g., Payment)* | *(Payment, Invoice)* | *(Handles all payment processing and financial records)* | *(payment-service)* |
|                 |                     |                |                   |

> ⚠️ **Key signal for separate contexts:** The same word means different things. E.g., "Product" in the Catalog context means name + description + images, while "Product" in the Order context means item ID + quantity + price. This is **two** Bounded Contexts, not one.

> 💡 **For this assignment:** 2–4 Bounded Contexts is a good target. Each Bounded Context will map to one microservice in your implementation.

### 2.6 Context Map

Show how Bounded Contexts communicate with each other. This is the architectural "big picture."

```mermaid
graph LR
    BC1[Context A] -- "relationship" --> BC2[Context B]
    BC1 -- "relationship" --> BC3[Context C]
```

> 💡 **How to fill in:** For each pair of Bounded Contexts in 2.5, determine:
> - **Which one provides data?** → That is Upstream.
> - **Which one consumes data?** → That is Downstream.
> - **What is the nature of the dependency?** → Pick a relationship type.

**Common relationship types for this assignment:**

| Type | When to use |
|------|------------|
| **Upstream / Downstream** | One context provides data that another consumes |
| **Customer / Supplier** | Downstream context requests features from upstream |
| **Anti-Corruption Layer (ACL)** | Downstream translates upstream's model to protect its own model |
| **Open Host Service (OHS)** | Upstream exposes a well-defined API for any consumer |

| Upstream | Downstream | Relationship Type | Data Exchanged |
|----------|------------|-------------------|----------------|
| *(e.g., Ordering)* | *(e.g., Payment)* | *(OHS / Downstream)* | *(Order ID, total amount)* |
|          |            |                   |                |

### 2.7 Service Composition

Show how the identified services interact to fulfill the original business process from 1.1.

> 💡 **How to do it:** Walk through the business process again. For each step, identify which service handles it and what calls are made between services.

```mermaid
sequenceDiagram
    participant Client
    participant ServiceA as (Bounded Context A) Service
    participant ServiceB as (Bounded Context B) Service

    Client->>ServiceA: (fill in)
    ServiceA->>ServiceB: (fill in)
    ServiceB-->>ServiceA: (fill in)
    ServiceA-->>Client: (fill in)
```

> ⚠️ **Check:** Compare this diagram with your Process Diagram in 1.1. Every step in the business process should be covered by at least one service. If a step is not covered, you may be missing a Bounded Context.

---

### Part 2 Summary — How DDD Steps Map to Service Candidates and API Endpoints

The table below answers: *"How does each DDD step connect to the final deliverables — service candidates and API endpoints?"* It also shows the equivalent step in the Step-by-Step Action approach so you can compare how both paths converge.

| DDD Step | Equivalent in Step-by-Step Action | Intermediate Output | What it contributes to |
|----------|-----------------------------------|---------------------|------------------------|
| **2.1** Ubiquitous Language | *(no equivalent)* | Shared glossary | Consistent naming across all services and APIs |
| **2.2** Domain Events (Event Storming) | 2.1–2.2 Decompose & filter actions | Chronological event list | Evidence base for commands and service boundaries |
| **2.3** Commands + Actors | 2.1 Actions (suitable ✅) | Command list with triggering actors | → **API endpoints** (each command ≈ one endpoint) |
| **2.4** Aggregates | 2.3 Entity grouping by shared entity | Aggregate table with owned data | → **Service boundaries** (aggregates cluster by context) |
| **2.5** Bounded Contexts | 2.3 Entity Service + 2.4 Task Service | **→ Service Candidates** *(primary output)* | Each Bounded Context = one service candidate |
| **2.6** Context Map | 2.8 Service Composition | Upstream/downstream relationships | → Deployment topology and communication patterns |
| **2.7** Service Composition | 2.8 Service Composition (sequence diagram) | Inter-service sequence | → Architecture diagram in `architecture.md` |
| **3.1** Contract Design | 3.1 Contract Design | **→ API Endpoints** *(final output)* | OpenAPI specs in `docs/api-specs/` |

**Key insight:** Both approaches converge at the same two deliverables:
1. **Service Candidates** (from 2.5 Bounded Contexts or 2.3–2.4 Entity/Task services)
2. **API Endpoints** (from 3.1 Contract Design, traced back to Commands in 2.3 or Capabilities in 2.6)

The difference is *how* you get there: DDD builds service boundaries from *business meaning*, while Step-by-Step Action builds them from *action similarity*. For the same problem, both should produce approximately the same services — DDD boundaries tend to be more stable under business change.

---

## Part 3 — Service-Oriented Design

> Part 3 is the **convergence point** — regardless of whether you used Step-by-Step Action or DDD in Part 2, the outputs here are the same: service contracts and service logic.

### 3.1 Uniform Contract Design

Service Contract specification for each Bounded Context / service.
Full OpenAPI specs:
- [`docs/api-specs/service-a.yaml`](api-specs/service-a.yaml)
- [`docs/api-specs/service-b.yaml`](api-specs/service-b.yaml)

> 💡 **Derive from 2.3 and 2.5:** Each Command from 2.3 typically maps to one API endpoint. The Bounded Context (2.5) determines which service owns the endpoint.

**Service A — *(Bounded Context name)*:**

| Endpoint | Method | Description | Request Body | Response Codes |
|----------|--------|-------------|--------------|----------------|
|          |        |             |              |                |

**Service B — *(Bounded Context name)*:**

| Endpoint | Method | Description | Request Body | Response Codes |
|----------|--------|-------------|--------------|----------------|
|          |        |             |              |                |

> 💡 **Then:** Update the corresponding OpenAPI YAML files in `docs/api-specs/` to match this table. The YAML is the authoritative contract — the table here is a summary.

### 3.2 Service Logic Design

Internal processing flow for each service.

> 💡 **How to do it:** For each service, pick its most important endpoint and draw the internal logic. Focus on: input validation → business rule checks → persistence/external calls → response.

**Service A — *(Bounded Context name)*:**

```mermaid
flowchart TD
    A[Receive Request] --> B{Validate input?}
    B -->|Valid| C{Business rule check?}
    B -->|Invalid| D[Return 400 Bad Request]
    C -->|Pass| E[(Persist / Call downstream)]
    C -->|Fail| F[Return 409 / 422 Error]
    E --> G[Return 200/201 Response]
```

**Service B — *(Bounded Context name)*:**

```mermaid
flowchart TD
    A[Receive Request] --> B{Validate input?}
    B -->|Valid| C{Business rule check?}
    B -->|Invalid| D[Return 400 Bad Request]
    C -->|Pass| E[(Persist / Call downstream)]
    C -->|Fail| F[Return 409 / 422 Error]
    E --> G[Return 200/201 Response]
```
