# Student Guide — Read This First

[![Stars](https://img.shields.io/github/stars/hungdn1701/microservices-assignment-starter?style=social)](https://github.com/hungdn1701/microservices-assignment-starter/stargazers)
[![Forks](https://img.shields.io/github/forks/hungdn1701/microservices-assignment-starter?style=social)](https://github.com/hungdn1701/microservices-assignment-starter/forks)

> **Course:** Service-Oriented Software Development (INT1448) · PTIT · Instructor: Dr. Hung N. Dang
>
> Follow this guide **in order** before you write any code. It takes about 30–60 minutes the first time.
> Rules and grading are in [`INSTRUCTION.md`](../INSTRUCTION.md); day-to-day development is in
> [`GETTING_STARTED.md`](../GETTING_STARTED.md).

---

## How the repositories fit together

```mermaid
flowchart LR
    S["Public starter<br/>hungdn1701/microservices-assignment-starter"] -->|"⭐ Star + Fork<br/>(every member)"| F["Your fork<br/>public — never put project work here"]
    S -->|"clone + push, keeping history<br/>(one member, once)"| T["Team repository<br/>PRIVATE, created by the LMS"]
    T -->|"clone<br/>(every member)"| L["Your computer"]
    S -.->|"git pull upstream main<br/>(when the starter is updated)"| T
```

- The **public starter** is the template, maintained by the instructor.
- **Your fork** is your bookmark of the starter. Leave it untouched.
- The **team repository** is where all your work goes. It is private and it is what gets graded.

---

## Step 1 — GitHub account

Use the GitHub account you **linked to your student ID on the LMS**, for the whole course, and commit and push only
with that account. The LMS uses it to recognise your commits and pull requests as your contribution.

---

## Step 2 — Install the tools

| Tool | Needed for | Install | Check |
|------|-----------|---------|-------|
| Git | everything | https://git-scm.com/downloads | `git --version` |
| Docker Desktop (includes Compose v2) | runs every service | https://docs.docker.com/get-docker/ | `docker compose version` |

> On Windows, start Docker Desktop and wait for the 🐳 icon before running `docker` commands; use Git Bash or
> PowerShell for the commands in this guide.

---

## Step 3 — Star and fork the starter (every member)

1. Open https://github.com/hungdn1701/microservices-assignment-starter
2. Click **⭐ Star**.
3. Click **Fork** → owner: your personal account → **Create fork**.

You now have `https://github.com/<your-username>/microservices-assignment-starter`. It is public: **do not commit project work to it**.
Use **Sync fork** on its page whenever you want to see the latest starter.

---

## Step 4 — Set up the team repository

1. **Create or join your team on the LMS** (max 3 members). When the team is created, the LMS creates an
   **empty private repository** for it in the course organization and sends each member a GitHub invitation.
2. **Every member accepts the invitation** — from the email GitHub sends, or at https://github.com/notifications
   (organization invitations also appear at `https://github.com/<course-org>`). Without accepting, you cannot
   see or push to the repository.
3. **One member, once,** copies the starter into the empty repository **with its history**:

```bash
git clone https://github.com/hungdn1701/microservices-assignment-starter.git <team-repo>
cd <team-repo>
git remote rename origin upstream                                  # the starter, for updates
git remote add origin https://github.com/<course-org>/<team-repo>.git
git push -u origin main
```

> Not comfortable with the command line? Do this step together with a teammate — it is only five commands, and
> everyone else simply clones the result in Step 5.

Do **not** add a README, license or any other file to the team repository before this step — the push needs it to be empty.

---

## Step 5 — Clone and run (every member)

```bash
git clone https://github.com/<course-org>/<team-repo>.git
cd <team-repo>
git remote add upstream https://github.com/hungdn1701/microservices-assignment-starter.git   # skip if you did Step 4 yourself
```

Then check that everything starts:

```bash
make init        # creates .env and checks Docker (or: cp .env.example .env)
docker compose config --quiet && echo "compose file OK"
```

The services are placeholders until your team implements them; once a component has code,
`make up-d && make smoke` checks every `/health` endpoint.

---

## Step 6 — First contribution

1. Create a branch: `git checkout -b docs/team-info`
2. Fill in the **Team** table and **Problem & Idea** in [`README.md`](../README.md).
3. Commit and push:

```bash
git add README.md
git commit -m "docs: add team info"
git push -u origin docs/team-info
```

4. Open a **Pull Request** to `main` on GitHub, ask a teammate to review it, then merge.

From now on, work the same way: **one branch per task → pull request → review → merge**.
Every member commits from their own linked account — your commits and pull requests are the evidence of your contribution.

---

## Step 7 — Getting starter updates

When the instructor announces a new starter version (the **Version** line at the top of `INSTRUCTION.md`):

```bash
git checkout main
git pull origin main
git pull upstream main     # merge the starter changes; resolve conflicts if any
git push origin main
```

Keep the `LICENSE` file and the "Based on …" line at the bottom of `README.md`.

---

## What to read next

| Order | Document | Why |
|:-----:|----------|-----|
| 1 | [`INSTRUCTION.md`](../INSTRUCTION.md) | Requirements, milestones, grading, AI policy, oral defense |
| 2 | [`GETTING_STARTED.md`](../GETTING_STARTED.md) | Running the project, workflow by milestone, submission checklist |
| 3 | [`docs/proposal.md`](proposal.md) | Your first deliverable (M1) |
| 4 | [`.ai/ai-guide.md`](../.ai/ai-guide.md) | Using AI assistants without failing the oral defense |
| 5 | [`docs/ai-log.md`](ai-log.md) | Where you record AI use — start from day one |

---

## Common Problems

| Problem | Cause | Fix |
|---------|-------|-----|
| `Permission denied` / `403` when pushing | Invitation not accepted, or no write access | Accept the invitation; if it persists, contact the instructor via the LMS |
| `git push` rejected later in the project | Teammates pushed before you | `git pull --rebase`, then push again |
| `Repository not found` | Wrong URL, or you have not accepted the invitation yet | Check the URL from the LMS; accept the invitation (email or https://github.com/notifications) |
| `! [rejected] main -> main (fetch first)` on the first push | The team repository is not empty (e.g., someone added a README) | Ask the instructor to reset it, or `git pull origin main --allow-unrelated-histories`, resolve, push |
| Your commits do not show up as yours on the LMS | Commits made with another GitHub account or an email not on your linked account | Use your linked account; check `git config user.email` |
| `Cannot connect to the Docker daemon` | Docker Desktop is not running | Start Docker Desktop and wait until it is ready |
| `port is already allocated` | Another program uses the port (e.g., 8080) | Stop that program, or change the port in `.env` |
| Project work pushed to your **public fork** by mistake | Wrong remote | Push it to the team repository, then delete the fork (Settings → Delete) and fork again; tell the instructor |

> Still stuck? Ask your team first, then the instructor through the LMS. Include the command you ran and the full
> error message.
