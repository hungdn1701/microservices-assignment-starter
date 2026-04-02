# Assignment Guide — For Instructors

> This document is a **template** for creating microservices assignments.
> Copy, customize the `[PLACEHOLDER]` values, and distribute to students.
> **Do not include this file in the student repo** — it is for instructor use only.

---

## 1. Assignment Information

| Field | Value |
|-------|-------|
| Course | `[Course Name — e.g., Service-Oriented Architecture]` |
| Semester | `[e.g., Fall 2026]` |
| Duration | `[e.g., 5 weeks]` |
| Team size | `[e.g., 3–4 members]` |
| Submission | `[e.g., GitHub repo link + demo video]` |
| Deadline | `[Date, Time]` |

---

## 2. Assignment Title & Description

### Title

`[e.g., Automating the University Library Loan Process Using Microservices]`

### Description

> Design and implement a service-oriented solution that automates the **`[business process name]`** using microservices architecture. Apply the analysis and design methodology from the course lectures, document your design decisions, and deploy the system using Docker Compose.

### Learning Outcomes

Upon completing this assignment, students will be able to:

1. Analyze a business process and identify service candidates using `[SOA/Erl methodology | Strategic DDD | either approach]`
2. Design RESTful APIs and document them using OpenAPI 3.0
3. Implement microservices that communicate through an API Gateway
4. Containerize and orchestrate services using Docker Compose
5. Collaborate as a team using Git branching workflow

---

## 3. Suggested Business Domains

> Pick one, or assign different domains to each team for variety.

| # | Domain | Process to Automate | Key Entities |
|---|--------|---------------------|--------------|
| 1 | University Library | Book loan & return | Books, Members, Loans |
| 2 | Food Delivery | Order placement & tracking | Restaurants, Orders, Riders |
| 3 | Student Enrollment | Course registration | Students, Courses, Enrollments |
| 4 | Clinic Appointment | Booking & medical records | Patients, Doctors, Appointments |
| 5 | Parking Management | Entry/exit & payment | Vehicles, Slots, Tickets |
| 6 | Event Ticketing | Ticket booking & check-in | Events, Tickets, Attendees |
| 7 | Inventory Management | Stock in/out & alerts | Products, Warehouses, Transactions |
| 8 | `[Add your own]` | | |

---

## 4. Requirements

### 4.1 Functional Requirements

- [ ] Minimum **2 backend microservices** (rename service-a and service-b to match your domain)
- [ ] **API Gateway** routing requests to appropriate services
- [ ] **Frontend** providing a user interface for the business process
- [ ] Every service exposes `GET /health` → `{"status": "ok"}`
- [ ] Services communicate via the gateway (not directly between services, unless justified)
- [ ] At least **`[e.g., 3]` CRUD endpoints** per service
- [ ] `[Add or remove as needed]`

### 4.2 Non-Functional Requirements

- [ ] The entire system starts with a single command: `docker compose up --build`
- [ ] Each service has its own database (no shared databases)
- [ ] Configuration via environment variables (`.env` file)
- [ ] OpenAPI 3.0 specs for all services in `docs/api-specs/`
- [ ] `[Add: e.g., response time < 2s, basic input validation, etc.]`

### 4.3 Documentation Requirements

- [ ] `README.md` — project overview, team info, architecture, setup instructions
- [ ] `docs/analysis-and-design.md` — completed analysis and design document
- [ ] `docs/architecture.md` — pattern selection with justification
- [ ] `docs/api-specs/*.yaml` — OpenAPI specifications
- [ ] Each service has its own `readme.md`

---

## 5. Timeline & Milestones

> Adjust to your course schedule. Below is a 5-week example.

| Week | Phase | Deliverable | Checkpoint |
|------|-------|-------------|------------|
| 1 | Analysis & Design | Completed `docs/analysis-and-design.md` | Submit for review |
| 2 | Architecture & API Design | Completed `docs/architecture.md` + OpenAPI specs | Submit for review |
| 3 | Implementation — Backend | Services with health endpoints + core APIs | Demo in class |
| 4 | Implementation — Frontend & Integration | Frontend + gateway routing + full flow | Demo in class |
| 5 | Finalization | Complete documentation, clean code, final submission | Final submission |

### Checkpoint Details

- **Week 1 checkpoint**: Instructor reviews analysis document, provides feedback before students proceed to design.
- **Week 2 checkpoint**: Instructor reviews architecture and API specs, ensures design is feasible.
- **Week 3–4 demo**: Quick live demo showing `docker compose up --build` and basic API calls.
- **Week 5 submission**: Final repo + README + all docs complete.

---

## 6. Grading Rubric

> Total: 100 points. Adjust weights as needed.

| # | Criterion | Points | Details |
|---|-----------|--------|---------|
| 1 | **Analysis & Design** | `[e.g., 25]` | Business process identification, service decomposition, candidate services, composition diagram |
| 2 | **Architecture & Patterns** | `[e.g., 15]` | Pattern selection with justification, architecture diagram, communication design |
| 3 | **API Design (OpenAPI)** | `[e.g., 10]` | Completeness, RESTful conventions, consistency between spec and implementation |
| 4 | **Implementation** | `[e.g., 25]` | Working services, health endpoints, CRUD operations, error handling, input validation |
| 5 | **Docker & Deployment** | `[e.g., 10]` | `docker compose up --build` works, proper Dockerfiles, networking |
| 6 | **Documentation** | `[e.g., 10]` | README quality, service readmes, code organization |
| 7 | **Teamwork & Git** | `[e.g., 5]` | Commit history, branching, contribution balance |
| | **Total** | **100** | |

### Grading Notes

- **A (90–100)**: All requirements met, clean design, well-documented, goes beyond minimum.
- **B (80–89)**: All core requirements met, minor gaps in documentation or design depth.
- **C (70–79)**: Most requirements met, some services incomplete or documentation lacking.
- **D (60–69)**: Partial implementation, significant gaps in design or deployment.
- **F (<60)**: Does not build, missing major components, or no documentation.

### Deduction Criteria

| Issue | Deduction |
|-------|-----------|
| `docker compose up --build` fails | -`[e.g., 20]` points |
| Missing `GET /health` on any service | -`[e.g., 5]` points per service |
| Hardcoded secrets (passwords, API keys in code) | -`[e.g., 10]` points |
| No OpenAPI specs | -`[e.g., 10]` points |
| Empty/template README (not customized) | -`[e.g., 5]` points |
| No Git commit history (single "final" commit) | -`[e.g., 5]` points |

---

## 7. Submission Instructions

> Paste this section into your LMS or assignment brief.

### How to Submit

1. Ensure your project runs with `docker compose up --build`
2. Verify all items in the **Submission Checklist** (see `GETTING_STARTED.md`)
3. Push all changes to your GitHub repository
4. Submit the following to `[LMS / email / form]`:
   - GitHub repository URL
   - `[Optional: demo video link (max 5 minutes)]`
   - `[Optional: team contribution summary]`

### Submission Checklist (for students)

> Already included in `GETTING_STARTED.md`. Students can use the checkboxes there.

---

## 8. Academic Integrity

> Customize to your institution's policy.

- You may use AI coding tools (GitHub Copilot, Cursor, Claude, etc.) — they are **encouraged** as part of the learning experience.
- You **must understand** all code in your repository. The instructor may ask you to **explain any part** of your code during a demo or oral examination.
- Copying another team's design document or code is **plagiarism**.
- If using external libraries or code snippets, **cite the source** in your README or code comments.
- Each team member must have meaningful Git commits showing their contribution.

---

## 9. Tips for Students

> Include in your assignment brief or as a separate handout.

### Getting Started
1. **Read the starter template first** — understand the project structure before writing code.
2. **Start with analysis, not code** — complete `docs/analysis-and-design.md` in Week 1.
3. **Fork the repo, don't download** — fork from the [original template](https://github.com/hungdn1701/microservices-assignment-starter) to keep the Git history.

### Development
4. **One service at a time** — get service-a working end-to-end before starting service-b.
5. **Health endpoint first** — implement `GET /health` as your first endpoint in every service.
6. **Docker early** — run `docker compose up --build` frequently, don't wait until the end.
7. **Use AI tools** — see `.ai/vibe-coding-guide.md` for how to use AI effectively.

### Teamwork
8. **Use Git branches** — each member works on a separate branch, merge via Pull Requests.
9. **Commit often** — small, meaningful commits. Not one big commit at the end.
10. **Divide by service, not by layer** — assign each member a service, not "frontend" vs "backend".

### Common Mistakes to Avoid
- Using `localhost` instead of Docker service names for inter-service calls
- Forgetting to update OpenAPI specs when changing endpoints
- Hardcoding database passwords in source code
- Waiting until the last day to test `docker compose up --build`
- Having one team member do all the work (visible in Git history)

---

## 10. Quick Reference for Instructor

### Verifying a Submission

```bash
# Clone student repo
git clone <student-repo-url>
cd <project-folder>

# Build and run
docker compose up --build

# Check health endpoints
curl http://localhost:8080/health   # Gateway
curl http://localhost:5001/health   # Service A
curl http://localhost:5002/health   # Service B
curl http://localhost:3000          # Frontend

# Check Git history
git log --oneline --all --graph
git shortlog -sn                   # Contribution per member
```

### Key Files to Review

| What to Check | File |
|---------------|------|
| Project overview & team | `README.md` |
| Analysis & design | `docs/analysis-and-design.md` |
| Architecture decisions | `docs/architecture.md` |
| API specifications | `docs/api-specs/*.yaml` |
| Docker orchestration | `docker-compose.yml` |
| Individual service docs | `services/*/readme.md` |
| Git contribution | `git shortlog -sn` |
