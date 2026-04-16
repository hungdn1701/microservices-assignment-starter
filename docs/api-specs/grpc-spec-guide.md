# API Specification — gRPC / Protocol Buffers

> This guide applies when you choose **gRPC** for inter-service communication.
> gRPC is a high-performance, binary RPC framework that uses **Protocol Buffers** (`.proto`) as its Interface Definition Language (IDL).
>
> **You do not need this guide** if all your services communicate via REST/HTTP only.

## Where to document gRPC

**Primary location: `service-a.yaml` (and `service-b.yaml`)**

Each service's YAML file contains an `x-grpc` extension block that documents the gRPC interface in the same place as the REST interface. This is the first thing you should fill in.

**Why not native OpenAPI?**
OpenAPI 3.0 is designed for HTTP/JSON REST APIs. It has no model for:
- The gRPC RPC method (`rpc CreateOrder(...) returns (...)`) — there is no HTTP path equivalent
- Protocol Buffer binary encoding — OpenAPI only describes JSON
- Streaming RPCs — OpenAPI has no bidirectional stream concept

So `x-grpc` is a custom extension (OpenAPI allows any `x-*` field). Validators and Swagger UI will ignore it, but humans and your documentation will benefit from having everything in one file.

**When to also create a `.proto` file:**
- When you need to **generate code** (client stubs / server skeletons) using `protoc` or `buf`
- When you need **contract testing** with tools like `grpcurl` or Buf CLI
- When your implementation actually runs gRPC and needs the formal IDL

In that case, extract the `x-grpc` block into a `.proto` file following the template below.

---

---

## When to use gRPC vs REST

| Criterion | Use REST (OpenAPI) | Use gRPC (.proto) |
|-----------|-------------------|-------------------|
| Client type | Browser, mobile, external API consumers | Internal service-to-service calls |
| Performance requirement | Standard | High-throughput, low-latency |
| Payload type | JSON (human-readable) | Binary (compact, fast) |
| Streaming needed | No | Yes (client/server/bidirectional) |
| Tooling maturity | Very high (Swagger UI, Postman) | Good (gRPCurl, Buf, Postman gRPC) |
| Typical use in this assignment | Gateway → Service, Frontend → Gateway | Service A ↔ Service B (internal) |

> 💡 **Common pattern for this assignment:** expose REST on the Gateway (for the browser/frontend), and use gRPC for internal service-to-service calls where latency matters.

---

## Protocol Buffers (.proto) File Structure

A `.proto` file is the single source of truth for a gRPC service — it defines the service contract, request/response message shapes, and RPC method signatures.

### Naming and File Location

The `x-grpc` block inside `service-*.yaml` is your primary spec. If you need to generate code, extract it to a `.proto` companion file:

```
docs/api-specs/
├── service-a.yaml          # Primary spec — REST (paths) + gRPC (x-grpc) + async (x-async-events)
├── service-b.yaml          # Same structure for Service B
├── service-a.proto         # Optional: formal .proto for code generation / tooling
├── service-b.proto         # Optional: formal .proto for Service B
├── grpc-spec-guide.md      # This file
└── ...
```

> 💡 For the assignment, filling in `x-grpc` in `service-*.yaml` is sufficient for documentation. Only add `.proto` if your implementation actually uses gRPC.

### Annotated Template

```protobuf
// service-a.proto
// gRPC specification for Service A — [Bounded Context / Domain name]
//
// Generated stubs: use `protoc` or `buf generate` to generate
// client/server code in your chosen language.
//
// References:
//   https://protobuf.dev/programming-guides/proto3/
//   https://grpc.io/docs/languages/

syntax = "proto3";

// Package name: use reverse-domain notation, lowercase
package com.example.servicea.v1;

// Go option (adjust for your language):
// option go_package = "github.com/your-org/your-repo/gen/servicea/v1;serviceav1";

// ─────────────────────────────────────────────
// Service Definition
// ─────────────────────────────────────────────

// OrderService handles the lifecycle of customer orders.
// Maps to: Bounded Context "Ordering" / Entity Service "order-service"
service OrderService {

  // CreateOrder — creates a new order.
  // Equivalent REST: POST /orders
  // Triggered by Command: PlaceOrder (DDD 2.3) or Action: SubmitOrder (Step-by-Step 2.6)
  rpc CreateOrder (CreateOrderRequest) returns (CreateOrderResponse);

  // GetOrder — retrieves an order by ID.
  // Equivalent REST: GET /orders/{id}
  rpc GetOrder (GetOrderRequest) returns (Order);

  // CancelOrder — cancels an existing order.
  // Equivalent REST: DELETE /orders/{id}
  rpc CancelOrder (CancelOrderRequest) returns (CancelOrderResponse);

  // StreamOrderStatus — server-side streaming: push status updates to the caller.
  // Use this when the caller needs real-time progress (e.g., order tracking).
  rpc StreamOrderStatus (GetOrderRequest) returns (stream OrderStatusUpdate);
}

// ─────────────────────────────────────────────
// Request / Response Messages
// ─────────────────────────────────────────────

message CreateOrderRequest {
  string customer_id = 1;          // UUID of the customer placing the order
  repeated OrderItem items = 2;    // List of items; must have at least 1
  string delivery_address = 3;     // Free-text delivery address
}

message CreateOrderResponse {
  string order_id = 1;             // Server-assigned UUID for the new order
  OrderStatus status = 2;          // Initial status (always PENDING on creation)
}

message GetOrderRequest {
  string order_id = 1;             // UUID of the order to retrieve
}

message CancelOrderRequest {
  string order_id = 1;
  string reason = 2;               // Optional cancellation reason
}

message CancelOrderResponse {
  bool success = 1;
  string message = 2;              // Human-readable confirmation or error detail
}

message OrderStatusUpdate {
  string order_id = 1;
  OrderStatus status = 2;
  string updated_at = 3;           // ISO-8601 timestamp
}

// ─────────────────────────────────────────────
// Shared / Nested Messages
// ─────────────────────────────────────────────

message Order {
  string order_id = 1;
  string customer_id = 2;
  repeated OrderItem items = 3;
  OrderStatus status = 4;
  string created_at = 5;           // ISO-8601 timestamp
  string delivery_address = 6;
}

message OrderItem {
  string product_id = 1;
  string product_name = 2;
  int32 quantity = 3;              // Must be > 0
  double unit_price = 4;           // In base currency unit (e.g., VND, USD)
}

// ─────────────────────────────────────────────
// Enumerations
// ─────────────────────────────────────────────

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;    // Default / unknown — proto3 requires a 0 value
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_CONFIRMED = 2;
  ORDER_STATUS_PREPARING = 3;
  ORDER_STATUS_DELIVERING = 4;
  ORDER_STATUS_DELIVERED = 5;
  ORDER_STATUS_CANCELLED = 6;
}
```

---

## Mapping DDD / Step-by-Step Analysis to .proto

| Analysis output | Maps to in .proto |
|-----------------|-------------------|
| Command (DDD 2.3) or Capability (Step-by-Step 2.6) | `rpc` method in `service` block |
| Request data (Command input) | `Request` message fields |
| Response data | `Response` or entity message fields |
| Aggregate / Entity (DDD 2.4) | Top-level `message` (e.g., `Order`) |
| Bounded Context / Service Candidate | One `.proto` file per service |
| Domain Event (DDD 2.2) — async | → Use AsyncAPI instead (see `async-spec-guide.md`) |

> ⚠️ gRPC is **synchronous request/response** (or streaming). For asynchronous event publishing (Domain Events), use a message broker and describe it with AsyncAPI — not `.proto`.

---

## Error Handling in gRPC

gRPC uses **status codes** (not HTTP 4xx/5xx). Document expected errors in comments on each `rpc`:

| gRPC Status Code | Equivalent HTTP | When to use |
|------------------|----------------|-------------|
| `OK` | 200 | Success |
| `INVALID_ARGUMENT` | 400 | Malformed request / validation failure |
| `NOT_FOUND` | 404 | Entity does not exist |
| `ALREADY_EXISTS` | 409 | Duplicate creation attempt |
| `PERMISSION_DENIED` | 403 | Auth check failed |
| `INTERNAL` | 500 | Unexpected server error |
| `UNAVAILABLE` | 503 | Service temporarily unreachable |

---

## Checklist — gRPC Spec Complete?

- [ ] One `.proto` file per service that exposes a gRPC interface
- [ ] Every `rpc` has a comment explaining: purpose, equivalent REST endpoint (if any), which analysis step it traces to
- [ ] Every `message` field has a comment for non-obvious fields
- [ ] Enum has a `_UNSPECIFIED = 0` value (proto3 requirement)
- [ ] Error status codes documented in comments on each `rpc`
- [ ] `.proto` file added to `docs/api-specs/` and referenced in `architecture.md` Section 2 (System Components)
