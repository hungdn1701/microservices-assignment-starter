# 🚀 Microservices Assignment — Student Guide

[![GitHub Stars](https://img.shields.io/github/stars/hungdn1701/microservices-assignment-starter?style=social)](https://github.com/hungdn1701/microservices-assignment-starter/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/hungdn1701/microservices-assignment-starter?style=social)](https://github.com/hungdn1701/microservices-assignment-starter/forks)

> 📋 Step-by-step guide for students. Read this carefully before starting.

---

## ⚡ Quick Start

### Step 1 — Create a GitHub account

If you don't have an account yet, sign up at https://github.com/signup

---

### Step 2 — Star ⭐ and Fork the starter repo

1. Open the starter repo: https://github.com/hungdn1701/microservices-assignment-starter
2. Click the **⭐ Star** button (top-right corner of the page)
3. Click **Fork** → select your account → **Create fork**

> 📌 After forking, you will have a copy at:
> `https://github.com/<your-username>/microservices-assignment-starter`

---

### Step 3 — Install required tools

#### Git

| OS | How to install |
|-----|----------------|
| **Windows** | Download from https://git-scm.com/download/win → install with defaults |
| **macOS** | Open Terminal → type `git --version` (installs automatically if missing) |
| **Linux** | `sudo apt install git` |

Verify:
```bash
git --version
# → git version 2.x.x means it's installed
```

#### Docker Desktop

Download and install from https://docs.docker.com/get-docker/

Verify:
```bash
docker --version
# → Docker version 2x.x.x means it's installed

docker compose version
# → Docker Compose version v2.x.x means it's installed
```

> ⚠️ On Windows, make sure Docker Desktop is running (🐳 icon in the taskbar).

---

### Step 4 - Clone your fork locally

Open Terminal (or Git Bash on Windows):

```bash
git clone https://github.com/<your-username>/microservices-assignment-starter.git
cd microservices-assignment-starter
```

> Replace `<your-username>` with your actual GitHub username.

---

### Step 5 - Accept the assignment from GitHub Classroom

1. Open the assignment link from your instructor (format: `https://classroom.github.com/a/...`).
2. Click **Accept this assignment**.
3. If prompted, select your identifier from the **roster list**.
4. If this is a group assignment, choose your team (or create it if your instructor allows).
5. GitHub Classroom will create a dedicated repository for you/team:
   `https://github.com/<org-name>/<assignment-name>-<your-username>`
6. Clone that assignment repository:

```bash
git clone https://github.com/<org-name>/<assignment-name>-<your-username>.git
cd <assignment-name>-<your-username>
```

7. Copy all files from the starter folder (cloned in Step 4) into the assignment folder, excluding `.git`:

**Windows (PowerShell):**
```powershell
# Run inside your assignment folder
Copy-Item -Path ..\microservices-assignment-starter\* -Destination . -Recurse -Force -Exclude ".git"
```

**macOS / Linux:**
```bash
# Run inside your assignment folder
rsync -av --exclude='.git' ../microservices-assignment-starter/ .
```

8. Create your first commit:

```bash
git add .
git commit -m "Initial setup from starter template"
git push
```

> Your assignment repository now contains the full starter structure and is ready for development.
>
> If you cannot find your name in the roster, stop here and contact your instructor. Do not continue with a random roster entry.

---

## 📝 Development Workflow

### Phase 1: Analysis & Design

1. Read `GETTING_STARTED.md` in the repo to understand the project structure
2. Choose **one** analysis approach:
   - **Approach 1 — SOA (Erl)**: Complete `docs/analysis-and-design.md`
   - **Approach 2 — Strategic DDD**: Complete `docs/analysis-and-design-ddd.md`
3. Identify the services needed for your domain

### Phase 2: Architecture & API

1. Select patterns and complete `docs/architecture.md`
2. Design APIs in `docs/api-specs/`

### Phase 3: Implementation

1. Choose the tech stack for each service
2. Update each Dockerfile
3. Implement `GET /health` in every service (do this first!)
4. Implement business logic and API endpoints
5. Configure Gateway routing
6. Build the Frontend

### Phase 4: Finalization

1. Verify `docker compose up --build` runs successfully
2. Update `README.md` with your team information
3. Update each service's `readme.md`

---

## 💻 How to Submit

Throughout development, **commit frequently** after each completed part:

```bash
git add .
git commit -m "Complete analysis and design"
git push
```

```bash
git add .
git commit -m "Implement service-a health endpoint"
git push
```

> ✅ Every `push` = your instructor can see your progress.
>
> ⏰ **Deadline** = the timestamp of your last commit is what counts.
>
> ❌ **No** Pull Request or additional submission notification needed.

---

## ✅ Pre-submission Checklist

- [ ] `README.md` updated with team info and service descriptions
- [ ] All services start with: `docker compose up --build`
- [ ] Every service has a working `GET /health` endpoint
- [ ] `docs/analysis-and-design.md` (or `analysis-and-design-ddd.md`) completed
- [ ] `docs/architecture.md` completed
- [ ] OpenAPI specs in `docs/api-specs/` match implementation
- [ ] Each service has its own `readme.md`
- [ ] Code is clean, organized, and follows the chosen language conventions

---

## 🔍 How Your Submission Will Be Evaluated

> This section describes the exact steps your instructor follows when reviewing your submission. Use it as a final self-check before pushing.

### Step 1 — Review Analysis, Design, and Architecture (Documents)

The instructor reads your documentation to verify the thinking is sound and consistent end-to-end.

| What the instructor checks | Where to look | What "pass" looks like |
|----------------------------|---------------|------------------------|
| Business process is clearly scoped | `docs/analysis-and-design*.md` Part 1 | One concrete process, defined actors and scope |
| Service candidates are justified | Part 2 of your chosen approach | Each service traces back to entities/bounded contexts/actions — not arbitrary splits |
| NFRs in 1.3 explain pattern choices in `architecture.md` | `docs/architecture.md` Section 1 | "Derived from" column filled; NFR → pattern logic is coherent |
| API endpoints are consistent with service design | `docs/api-specs/*.yaml` and Part 3 | Every endpoint in the YAML matches a capability identified in Part 2 |
| Architecture diagram reflects all running components | `docs/architecture.md` Section 4 | Diagram shows gateway, services, databases — matches what actually runs |
| Documents are internally consistent | Cross-file | Service names, endpoint paths, and data fields are the same in analysis, architecture, and code |

### Step 2 — Review Source Code Against Design

The instructor verifies that the implementation matches what was designed.

| What the instructor checks | Where to look | What "pass" looks like |
|----------------------------|---------------|------------------------|
| Each service implements the endpoints declared in its API spec | `services/*/src/` vs `docs/api-specs/*.yaml` | All paths, methods, and response shapes match |
| Each service has `GET /health` → `{"status": "ok"}` | `services/*/src/` | Returns 200 + correct JSON |
| Services call each other using Docker Compose service names | `services/*/src/` | No `localhost` in inter-service calls |
| Secrets and config are in `.env`, not hardcoded | All source files | No passwords, tokens, or ports hardcoded in code |
| Each Dockerfile builds correctly | `services/*/Dockerfile`, `gateway/Dockerfile`, `frontend/Dockerfile` | No `ADD . .` without `.dockerignore`; no secrets baked in |
| Database schema / models match data described in analysis | `services/*/src/` | Entities and fields align with aggregates/entities identified in Part 2 |

### Step 3 — Live Demo: `docker compose down` → `up` → Run

The instructor does a clean cold-start to verify the system runs end-to-end without manual intervention.

```bash
# 1. Ensure a clean state
docker compose down --volumes --remove-orphans

# 2. Cold start — build everything from scratch
docker compose up --build

# 3. Wait for all services to report healthy, then verify:
curl http://localhost:8080          # Gateway
curl http://localhost:5001/health   # Service A → {"status": "ok"}
curl http://localhost:5002/health   # Service B → {"status": "ok"}
curl http://localhost:3000          # Frontend loads without errors
```

> ✅ **Pass criteria for the demo:**
> - All containers start without error logs on first `up --build`
> - Every `GET /health` returns `{"status": "ok"}` with HTTP 200
> - At least one end-to-end business flow (e.g., create → read → update) works through the Gateway
> - Frontend displays meaningful UI (not a blank page or error screen)
> - No manual steps required between `docker compose up --build` and the working demo

> ❌ **Automatic fail conditions:**
> - Any service fails to start (exits immediately, crash loop)
> - A service requires manual DB migration steps not scripted into the container startup
> - Inter-service calls fail because `localhost` was used instead of service names
> - `.env.example` is missing or `docker-compose.yml` references a variable with no default

---

## 🎯 Key Tips

| # | Tip | Why |
|---|-----|-----|
| 1 | Analysis first, code second | Clear domain understanding → fewer wrong turns |
| 2 | `GET /health` is your first endpoint | Confirms the service runs inside Docker |
| 3 | Run `docker compose up --build` frequently | Don't wait until the end to test |
| 4 | One service per team member | Split by service, not by layer |
| 5 | Small commits, commit frequently | Easy to roll back, shows progress to instructor |
| 6 | Use service names, not `localhost` | Use `http://service-a:5001` not `http://localhost:5001` |
| 7 | Never hardcode passwords in code | Use `.env` for all configuration |
| 8 | Use AI tools to assist | See `.ai/vibe-coding-guide.md` in the repo |

---

## ❓ Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `docker: command not found` | Docker Desktop not installed | Install from https://docs.docker.com/get-docker/ |
| `Cannot connect to Docker daemon` | Docker Desktop not running | Open Docker Desktop and wait for the 🐳 icon |
| `port is already in use` | Port occupied by another app | Stop that app or change the port in `docker-compose.yml` |
| Service A cannot call Service B | Using `localhost` instead of service name | Change to `http://service-b:5002` |
| `git push` rejected | Remote has unpulled changes | Run `git pull --rebase` then push again |

---

## 📚 References

- [Starter Template Repo](https://github.com/hungdn1701/microservices-assignment-starter)
- [GETTING_STARTED.md](https://github.com/hungdn1701/microservices-assignment-starter/blob/main/GETTING_STARTED.md) — Detailed project guide inside the repo
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)

---

> 💡 Questions? Contact your instructor via email or post on GitHub Discussions in the starter repo.
>
> **Good luck!** 💪🚀
