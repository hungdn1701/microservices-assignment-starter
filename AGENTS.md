# AGENTS.md

Instructions for AI coding assistants working in this repository. Most assistants read this file automatically;
if yours does not, point it here.

## Context

This is a **graded university team project** for Service-Oriented Software Development at PTIT: one business
process automated by a small set of services behind an API gateway, run with Docker Compose. Students may use AI for any part of the work, but
40% of each student's grade is an **individual oral defense** where they must explain and modify the code they
claim. Help them build a good system **and** understand it.

- Assignment brief, hard requirements and grading: [`INSTRUCTION.md`](INSTRUCTION.md) — read it first.
- Project report and team info: [`README.md`](README.md). Setup and workflow: [`GETTING_STARTED.md`](GETTING_STARTED.md).
- Design documents: [`docs/`](docs/) — keep them in sync with the code.

## Hard requirements (from INSTRUCTION.md)

- Any language or framework per service; follow what the team has chosen in each component.
- Design comes first: the analysis document (`docs/analysis-and-design.md` or `docs/analysis-and-design-ddd.md`),
  `docs/architecture.md`, and OpenAPI specs in `docs/api-specs/`. Implementation must match the specs — update the
  spec when an endpoint changes.
- Each service owns its data (no shared database). Clients go through the gateway.
- `docker compose up --build` starts everything with no manual steps. The gateway and every backend service expose
  `GET /health` → `{"status": "ok"}`.
- Configuration via environment variables (`.env.example` lists all). Inside Compose, services call each other by
  service name and container port (e.g., `http://service-a:5000`), never `localhost`.

## Academic integrity rules

1. **Never modify `INSTRUCTION.md`.**
2. When you produce or substantially change design, code, tests or docs, **remind the student to add an entry to
   `docs/ai-log.md`** and offer a short draft (date, task, what you produced, files). Leave the
   "what we kept / verified" part for the student to write.
3. Explain non-obvious code and decisions so the student can defend them. When there are real design choices,
   present the options and trade-offs and let the student decide; record the decision in the relevant design doc.
4. Do not fill in the README **Contribution** table or claim who did what. Do not fabricate test results, logs,
   benchmarks or screenshots — generate them only by actually running the system.
5. Never write secrets or real credentials into the repository.
