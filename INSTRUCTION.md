# Assignment Brief & Grading Policy — Service-Oriented Software Development (INT1448)

**Instructor:** Dr. Hung N. Dang (Đặng Ngọc Hùng) — hungdn@ptit.edu.vn  
**Faculty:** Information Technology 1 — Posts and Telecommunications Institute of Technology (PTIT)  
**Version:** 1.0.0 (2026-10-09) — see the repository tags for later versions

> ⚠️ **Official document — read-only.** This file is the assignment brief and grading policy issued by the instructor.
> Students and AI assistants must **not** edit or delete it. If copies differ, the
> [official version](https://github.com/hungdn1701/microservices-assignment-starter/blob/main/INSTRUCTION.md) applies.
> If something is unclear or seems wrong, ask the instructor.

---

## 1. Learning Objectives

By completing this project, each team member demonstrates that they can:

- Analyze **one business process** and derive service boundaries from it (Step-by-Step Action or Domain-Driven Design).
- Design **service contracts** (OpenAPI) and an architecture whose patterns are justified by requirements.
- Implement independently deployable services that own their data and collaborate over the network.
- Run the whole system with **Docker Compose** from a single command.
- **Explain and defend** their own design decisions and code — including code produced with AI assistance.

---

## 2. Teams & Repository

| Rule | Detail |
|------|--------|
| Team size | **1–3 students. Maximum 3 — no exceptions.** |
| Repository | Created **only** through the GitHub Classroom link announced by the instructor (private repo, starter files pre-loaded). Do not fork the public starter — your work would be public. |
| Accounts | Every member commits from **their own** GitHub account. Pair-programmed commits should credit the partner (e.g., a `Co-authored-by:` trailer). |
| Registration | Fill in the Team table and project pitch at the top of [`README.md`](README.md) in your first week. |

---

## 3. Milestones

The project is delivered in **three milestones**. Dates, and whether a milestone carries marks or feedback only,
are announced by the instructor for each class; milestones may be merged or adjusted to fit the class schedule.
The three outcomes — a proposal, a design with a running skeleton, and the final product — stay the same.

| Milestone | Deliverable | Where |
|-----------|-------------|-------|
| **M1 — Proposal** | Domain, the one business process, actors, scope, first service candidates, ownership plan | [`docs/proposal.md`](docs/proposal.md) |
| **M2 — Design & Walking Skeleton** | Analysis & design complete (one approach), architecture and OpenAPI specs; every component starts with `docker compose up --build`, answers `GET /health`, and **one request flows through the gateway to a service** | `docs/`, all components |
| **M3 — Final Product & Oral Defense** | Business process working end-to-end, README with **AI Disclosure** and **Contribution**, AI log | Whole repository |

Tip: mark each milestone with a git tag (`git tag m1 && git push origin m1`) so it is easy to find later.

---

## 4. Mandatory Technical Requirements

1. **Technology-agnostic** — any language/framework per service; services may use different stacks.
2. **Scope** — automate **one business process** (typically 5–15 steps, 2–4 actors), not an entire system.
3. **Design first** — complete **one** analysis approach ([Step-by-Step Action](docs/analysis-and-design.md) or [DDD](docs/analysis-and-design-ddd.md)), [`docs/architecture.md`](docs/architecture.md), and OpenAPI specs in [`docs/api-specs/`](docs/api-specs/). Keep the implementation consistent with the specs.
4. **Service autonomy** — each service owns its data (database per service; no shared tables).
5. **Gateway** — clients reach services only through the API gateway.
6. **Docker** — `docker compose up --build` starts the entire system from a clean clone, with no manual steps (migrations/seed data are scripted).
7. **Health checks** — every backend service and the gateway expose `GET /health` → `{"status": "ok"}`.
8. **Configuration** — via environment variables; `.env.example` lists every variable; no secrets in code. Services call each other by Compose service name, never `localhost`.

---

## 5. Suggested Domains

Pick **one business process** from a domain below **or propose your own** (original, well-motivated ideas score higher in criterion A1).

1. **Food delivery** — customer places an order and receives it.
2. **Course registration** — student registers for classes within capacity and prerequisites.
3. **Hotel / clinic booking** — customer books, pays a deposit, gets confirmed or waitlisted.
4. **Library / equipment lending** — borrow, reserve, return, fines.
5. **Event ticketing** — seat selection, payment, ticket issue, cancellation.

---

## 6. Grading Rubric (10 points)

The rubric is shared by all three of the instructor's project courses (Network Programming — INT1433, Mobile Application
Development — INT1449, Service-Oriented Software Development — INT1448). Only the course-specific sub-criteria differ.

| Part | Weight | Scored per |
|------|:------:|-----------|
| **A. Idea & Design** | **3.0** | Team |
| **B. Technical Product** | **3.0** | Team |
| **C. Individual Oral Defense** | **4.0** | **Individual** |

### A. Idea & Design — 3.0 (team)

| Criterion | Points | What earns full marks |
|-----------|:------:|-----------------------|
| **A1. Problem & Idea** | 1.0 | A real business process, clearly scoped; actors and goals identified; why a service-oriented solution fits; alternatives considered. Evidence: `docs/proposal.md`, README §2. |
| **A2. Analysis & Service Design** | 1.0 | One analysis approach completed; every service traces back to actions/entities or bounded contexts; contracts and service logic designed (Part 3). |
| **A3. Architecture & Contracts** | 1.0 | `docs/architecture.md`: patterns derived from NFRs, communication matrix, deployment diagram; OpenAPI specs complete and consistent with the analysis. |

### B. Technical Product — 3.0 (team)

| Criterion | Points | What earns full marks |
|-----------|:------:|-----------------------|
| **B1. Working System** | 1.5 | The business process works end-to-end through the gateway and frontend; services collaborate as designed; failures of a dependency are handled sensibly. |
| **B2. Design–Implementation Consistency** | 1.0 | Endpoints, payloads and data models match the OpenAPI specs and the analysis; each service owns its data. |
| **B3. Engineering Hygiene** | 0.5 | Clean cold start (`docker compose down -v && docker compose up --build`); `/health` everywhere; `.env` config; readable code; meaningful git history. |

### C. Individual Oral Defense — 4.0 (individual)

| Criterion | Points | What earns full marks |
|-----------|:------:|-----------------------|
| **C1. Ownership** | 1.5 | Explains the services/modules they claim in the Contribution table — line by line when asked — including AI-generated code. |
| **C2. Reasoning** | 1.5 | Justifies design decisions and trade-offs; answers "what if" questions about their design. |
| **C3. Live Change** | 1.0 | Makes a small change or locates a bug in their own code on the spot (or walks through how they would, if time is short). |

**Individual score = A + B (team) + C (individual)**, subject to the adjustments in §7 and §8.

---

## 7. AI Usage Policy

AI assistants (ChatGPT, Claude, Gemini, Copilot, Cursor, ...) are **allowed for every part** of the project —
ideation, design, code, tests and documentation. What is graded is **your understanding and your decisions**,
not who typed the code.

1. **Disclose.** The README **AI Disclosure** section and [`docs/ai-log.md`](docs/ai-log.md) are mandatory.
   If they are missing, the instructor will ask you to complete them before the oral defense.
2. **Own it.** You are responsible for every line in your repository. A part you cannot explain during the oral
   defense earns **no credit** — in B for the team and in C for you — even if it works.
3. **Be honest.** Significant AI use that is not disclosed, or a disclosure that contradicts the evidence, is
   academic dishonesty: the instructor may deduct up to **2.0 points** from A + B and handle the case under PTIT regulations.
4. **No fabrication.** Test results, logs, screenshots and benchmark numbers must come from actually running your system.
5. **No secrets.** Never paste passwords, API keys or other people's personal data into AI tools.

> Disclosing AI use never lowers your score. Hiding it does.

---

## 8. Contribution & Individual Assessment

- The README **Contribution** table lists, for each member: the modules/documents they own, their key PRs or commits,
  and an agreed contribution percentage. **Every member ticks the confirmation box.**
- Evidence the instructor checks: git history (commits from each member's own account, pull requests),
  `docs/ai-log.md` entries per member, and answers in the oral defense.
- Oral-defense questions target the parts each member **claims**.
- A member with no verifiable contribution (no commits/PRs and unable to explain the parts they claim) may receive a
  reduced share of A + B, down to 0, at the instructor's decision.

---

## 9. Oral Defense

- **Format:** about 15–20 minutes per team — roughly 5 minutes per member (adjusted per class). Every member answers
  individually; teammates may not answer for each other. Not every question type is asked to every member — the
  instructor picks what fits the time.
- **Short demo first (a few minutes, prepared in advance):** the system running from a fresh start, showing the main flow.
- **Questions are drawn from:** your proposal, analysis and design documents, the code you claim, and your `ai-log.md` entries.
- **Sample questions:**
  - Why is this a separate service rather than part of another one? Which analysis step produced it?
  - Which data does each service own? How do you keep data consistent across services in this process?
  - What happens to the process if one service is down or slow? Show where that is handled.
  - Why synchronous (or asynchronous) communication between these two services?
  - Which NFR led to this architecture pattern?
  - *(Live)* Add a field or endpoint end-to-end — spec, service, gateway — and call it.

---

## 10. Final Submission

- The final submission is the **last commit on `main` before the deadline**.
- Before the deadline, go through the **Submission Checklist** in [`GETTING_STARTED.md`](GETTING_STARTED.md#submission-checklist).
- Late submissions and resubmissions follow the policy announced by the instructor.
