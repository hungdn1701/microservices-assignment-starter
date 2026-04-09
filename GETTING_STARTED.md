# Getting Started — Starter Template Guide

> This file explains **how to use this starter template**. It is not part of your project deliverable.
> After completing setup, your project documentation lives in [`README.md`](README.md).

---

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) (includes Docker Compose)
- [Git](https://git-scm.com/)
- An AI coding tool (recommended): [GitHub Copilot](https://github.com/features/copilot), [Cursor](https://cursor.sh), or [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

---

## Quick Start

```bash
# 1. Fork this repository on GitHub
#    Go to https://github.com/hungdn1701/microservices-assignment-starter
#    Click "Fork" → create fork under your account or team organization

# 2. Clone YOUR fork (not the original)
git clone https://github.com/<your-username>/microservices-assignment-starter.git
cd microservices-assignment-starter

# 2. Initialize the project
bash scripts/init.sh
# Or manually:
cp .env.example .env

# 3. Build and run all services
docker compose up --build

# 4. Verify services are running
curl http://localhost:8080   # Gateway
curl http://localhost:5001   # Service A
curl http://localhost:5002   # Service B
curl http://localhost:3000   # Frontend
```

### Using Make (optional)

```bash
make help      # Show all available commands
make init      # Initialize project
make up        # Build and start all services
make down      # Stop all services
make logs      # View logs
make clean     # Remove everything
```

---

## Project Structure

```
microservices-assignment-starter/
├── README.md                       # Project overview (edit this)
├── GETTING_STARTED.md              # This file — starter template guide
├── .env.example                    # Environment variable template
├── docker-compose.yml              # Multi-container orchestration
├── Makefile                        # Common development commands
│
├── docs/                           # Documentation
│   ├── analysis-and-design.md      # Approach 1: Step-by-Step Action analysis & design
│   ├── analysis-and-design-ddd.md  # Approach 2: Domain-Driven Design analysis & design
│   ├── architecture.md             # Architecture patterns & deployment
│   ├── asset/                      # Images, diagrams, visual assets
│   └── api-specs/                  # OpenAPI 3.0 specifications
│       ├── service-a.yaml
│       └── service-b.yaml
│
├── frontend/                       # Frontend application
│   ├── Dockerfile
│   ├── readme.md
│   └── src/
│
├── gateway/                        # API Gateway
│   ├── Dockerfile
│   ├── readme.md
│   └── src/
│
├── services/                       # Backend microservices
│   ├── service-a/
│   │   ├── Dockerfile
│   │   ├── readme.md
│   │   └── src/
│   └── service-b/
│       ├── Dockerfile
│       ├── readme.md
│       └── src/
│
├── scripts/                        # Utility scripts
│   └── init.sh
│
└── .ai/                            # AI-assisted development
    ├── AGENTS.md                   # Agent instructions (source of truth)
    ├── vibe-coding-guide.md        # Vibe coding guide
    └── prompts/                    # Reusable prompt templates
```

---

## Recommended Workflow

> **Document flow:** Analysis & Design → Detailed Design (API specs + Architecture) → Implementation
>
> ```
> ┌──────────────────────────────────┐
> │  Phase 1: Analysis & Design      │  Choose ONE approach:
> │  (Part 1 + Part 2 + Part 3)     │  • Step-by-Step Action
> │                                  │  • Domain-Driven Design
> │  Output: service candidates,     │
> │  service contracts, service logic│
> └───────────────┬──────────────────┘
>                 │
>                 ▼
> ┌──────────────────────────────────┐
> │  Phase 2: Architecture Design    │  Patterns, tech stack,
> │  architecture.md + api-specs/    │  communication, deployment
> │                                  │
> │  Output: deployable system design│
> └───────────────┬──────────────────┘
>                 │
>                 ▼
> ┌──────────────────────────────────┐
> │  Phase 3: Implementation         │  Code services, gateway,
> │  services/ + gateway/ + frontend/│  frontend inside Docker
> └───────────────┬──────────────────┘
>                 │
>                 ▼
> ┌──────────────────────────────────┐
> │  Phase 4: Documentation          │  README, service readmes,
> │  & Finalization                  │  verify docker compose
> └──────────────────────────────────┘
> ```

### Phase 1: Analysis & Design
Complete **one** of the two analysis documents. Both produce the same deliverables (service candidates, service contracts, service logic) — they differ only in *how* you discover service boundaries.

> ⚠️ **Scope reminder:** Focus on **one business process** (e.g., "Customer places and receives an order"), not an entire system. A good scope is 5–15 process steps and 2–4 actors. This keeps the assignment manageable within 4–6 weeks.

- [ ] Read and understand this starter template
- [ ] Choose your business domain and **one** specific business process
- [ ] Choose **one** analysis approach and complete **all three Parts**:
  - **Approach 1 — Step-by-Step Action**: [`docs/analysis-and-design.md`](docs/analysis-and-design.md) — decompose process into actions, group actions into services
  - **Approach 2 — Domain-Driven Design**: [`docs/analysis-and-design-ddd.md`](docs/analysis-and-design-ddd.md) — discover domain events and bounded contexts, map to services
- [ ] Complete Part 3 (Service-Oriented Design) — this is the same in both approaches: define service contracts and internal logic

### Phase 2: Architecture & API Design
Use the service candidates and contracts from Phase 1 as input.

- [ ] Select architecture patterns and complete [`docs/architecture.md`](docs/architecture.md)
- [ ] Write full OpenAPI specs in [`docs/api-specs/`](docs/api-specs/) — these should match the contracts defined in Part 3

### Phase 3: Implementation
- [ ] Choose tech stack for each service
- [ ] Update Dockerfiles
- [ ] Implement `GET /health` in every service
- [ ] Implement business logic and API endpoints (following your OpenAPI specs)
- [ ] Configure Gateway routing
- [ ] Build frontend

### Phase 4: Documentation & Finalization
- [ ] Verify `docker compose up --build` works end-to-end
- [ ] Update [`README.md`](README.md) with your project details
- [ ] Update each service's `readme.md`

---

## Submission Checklist

> Use this checklist before submitting your assignment.

- [ ] `README.md` updated with team info and service descriptions
- [ ] All services start with `docker compose up --build`
- [ ] Every service has a working `GET /health` endpoint
- [ ] Analysis & Design completed (one of the two approaches):
  - [ ] [`docs/analysis-and-design.md`](docs/analysis-and-design.md) — **or** —
  - [ ] [`docs/analysis-and-design-ddd.md`](docs/analysis-and-design-ddd.md)
- [ ] [`docs/architecture.md`](docs/architecture.md) completed
- [ ] OpenAPI specs in `docs/api-specs/` match implementation
- [ ] Each service has its own `readme.md`
- [ ] Code is clean, organized, and follows chosen language conventions

---

## AI-Assisted Development (Vibe Coding)

This repo is pre-configured for AI-powered development:

| Tool | Config File |
|------|-------------|
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursorrules` |
| Claude Code | `CLAUDE.md` |

All config files point to [`.ai/AGENTS.md`](.ai/AGENTS.md) as the single source of truth.
Prompt templates: [`.ai/prompts/`](.ai/prompts/).

> Full guide: [`.ai/vibe-coding-guide.md`](.ai/vibe-coding-guide.md)

---

## Git Workflow

```
main
 └── feature/service-a-endpoints    ← each member works on a feature branch
 └── feature/gateway-routing
 └── feature/frontend-ui
```

1. Create a branch: `git checkout -b feature/<description>`
2. Commit often with meaningful messages
3. Push and open a Pull Request to `main`
4. Review as a team, then merge

---

## Development Guidelines

- **Health checks**: Every service MUST expose `GET /health` → `{"status": "ok"}`
- **Environment**: Use `.env` for configuration, never hardcode secrets
- **Networking**: Services communicate via Docker Compose DNS (use service names, not `localhost`)
- **API specs**: Keep OpenAPI specs in sync with implementation
- **Git**: Use branches, meaningful commit messages, commit often

---

## Template Author

This starter template was created by **Hung Dang**.
- Email: hungdn@ptit.edu.vn
- GitHub: [hungdn1701](https://github.com/hungdn1701)

Good luck! 💪🚀
