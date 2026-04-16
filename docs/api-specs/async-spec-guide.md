# API Specification — Asynchronous / Event-Driven Communication

> This guide applies when services communicate via a **message broker** (e.g., Kafka, RabbitMQ) instead of direct HTTP/gRPC calls.
>
> **You do not need this guide** if all your services communicate synchronously (REST or gRPC).

## Where to document async events

**Primary location: `service-a.yaml` (and `service-b.yaml`)**

Each service's YAML file contains an `x-async-events` extension block that documents the events the service publishes and consumes — in the same file as the REST and gRPC interface. Fill this in first.

**Why not native OpenAPI?**
OpenAPI 3.0 is designed for synchronous HTTP request/response. It has no model for:
- A message broker channel (Kafka topic / RabbitMQ queue) — there is no concept of a persistent stream
- Fire-and-forget publish (no response to describe)
- Consumer groups or fan-out subscriptions

So `x-async-events` is a custom extension (OpenAPI allows any `x-*` field). Validators and Swagger UI will ignore it, but it keeps the full service contract visible in one place.

**When to also write a formal AsyncAPI file:**
- When you need the [AsyncAPI Studio](https://studio.asyncapi.com/) to render and validate your event schemas
- When you need code generation from [AsyncAPI Generator](https://www.asyncapi.com/tools/generator)
- When your team maintains a shared event catalog

In that case, extract the `x-async-events` block into a proper AsyncAPI YAML following the structure described in the [AsyncAPI docs](https://www.asyncapi.com/docs).

---

---

## Why async? The mental model shift

In REST/gRPC, communication is **synchronous request/response**:

```
Service A ──[request]──► Service B
Service A ◄──[response]── Service B
```

In async/event-driven communication, there is **no direct response**:

```
Service A ──[publish event]──► Broker (Kafka topic / RabbitMQ queue)
                                      │
                                      └──[deliver event]──► Service B
```

Service A **does not wait** for Service B. Service B processes the event independently, possibly much later. This enables:
- **Loose coupling**: services don't know about each other
- **Resilience**: Service B can be temporarily down without affecting Service A
- **Scalability**: multiple consumers can process the same event stream independently

> 💡 **When to use async in this assignment:**
> - When a Domain Event (DDD 2.2) triggers work in a *different* Bounded Context
> - When an action in one service should *notify* another without waiting for a result
> - When your NFRs (1.3) require high throughput or decoupled scalability

---

## How to specify async communication: AsyncAPI

[AsyncAPI](https://www.asyncapi.com/) is the standard specification format for event-driven APIs — analogous to OpenAPI for REST. It describes:
- **Channels** (Kafka topics or RabbitMQ queues)
- **Operations** (which service publishes, which subscribes)
- **Message schemas** (the event payload structure)

---

## AsyncAPI Key Concepts

| Concept | Meaning | Analogy in REST/OpenAPI |
|---------|---------|------------------------|
| **Channel** | A named stream or queue (e.g., a Kafka topic `order.placed`) | Path/endpoint (e.g., `/orders`) |
| **Operation: publish** | This service **sends** messages to this channel | `POST /orders` (you write) |
| **Operation: subscribe** | This service **receives** messages from this channel | `GET /orders` with long-poll (you read) |
| **Message** | The event payload — what is inside one message | Request/response body |
| **Schema** | JSON Schema for the message fields | OpenAPI `components/schemas` |

---

## Mapping Your Analysis to AsyncAPI

| Analysis output | Maps to in AsyncAPI |
|-----------------|---------------------|
| Domain Event (DDD 2.2), e.g., `OrderPlaced` | Channel name, e.g., `order/placed` |
| Service that triggers the event | `publish` operation on that channel |
| Service that reacts to the event | `subscribe` operation on that channel |
| Event payload fields | `message.payload` schema |
| Bounded Context (DDD 2.5) | `info.title` — one AsyncAPI file per service |

> 💡 **Practical structure for this assignment:** create one AsyncAPI file per service that has async interactions. A service can appear as a publisher in its own spec and as a subscriber in another service's spec. Alternatively, maintain one shared spec per channel/topic.

---

## File and Folder Layout

```
docs/api-specs/
├── service-a.yaml              # Primary spec — REST (paths) + gRPC (x-grpc) + async (x-async-events)
├── service-b.yaml              # Same structure for Service B
├── service-a-async.yaml        # Optional: formal AsyncAPI YAML (for tooling / code-gen)
├── service-b-async.yaml        # Optional: formal AsyncAPI YAML for Service B
├── async-spec-guide.md         # This file
└── grpc-spec-guide.md
```

> 💡 For the assignment, filling in `x-async-events` in `service-*.yaml` is sufficient for documentation. Only add a formal AsyncAPI file if your implementation actually uses a message broker and you need schema validation or code generation.

---

## Checklist — Async Spec Complete?

- [ ] One AsyncAPI file per service that publishes or subscribes to events
- [ ] Every channel has a clear name following `domain/event-name` convention (e.g., `order/placed`)
- [ ] Every channel documents which service publishes and which subscribes
- [ ] Every message has a `payload` schema with all fields described
- [ ] `summary` on each operation explains the business purpose in plain language
- [ ] Async channels referenced in `architecture.md` Section 3 (Communication Matrix) with style "async/event"
- [ ] If using Kafka: note the topic name and broker address in `architecture.md` Section 2 (System Components)
