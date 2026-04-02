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
