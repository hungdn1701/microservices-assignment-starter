# Working with AI Assistants

> You may use AI for **every** part of this project. You are graded on what **you understand and decide** —
> 40% of your grade is an individual oral defense ([`INSTRUCTION.md`](../INSTRUCTION.md) §6–§9).
> Use AI as a tutor, reviewer and pair-programmer — not as a ghostwriter you cannot explain.

---

## 1. Setup

Use any assistant you like — chat apps, IDE assistants, or coding agents. Tools change fast; this repo does not
depend on any particular one.

- [`AGENTS.md`](../AGENTS.md) describes the project and the rules for assistants. Most coding agents read it
  automatically (`CLAUDE.md` and `GEMINI.md` just import it). If yours does not, point it to `AGENTS.md`
  or paste the relevant parts.
- Give the assistant context instead of templates: the relevant design doc, the files involved, the exact error output.

## 2. A Workflow That Survives the Oral Defense

1. **Think first, then ask.** Sketch your own idea or design, then ask the AI to critique it and point out what you missed.
2. **Ask for options, decide yourself.** "Give me 2–3 approaches with trade-offs for …". Write the decision and the
   reason in the design doc — that reasoning is what you will be asked about.
3. **Work in small, verifiable steps.** One feature or component at a time. Read it, run it, test it, commit it.
4. **Make the AI explain.** "Explain this code as if to my examiner." "What breaks if …?" "Why not …?"
5. **Verify independently.** Run it, test edge cases, read the official docs. AI is confidently wrong more often
   than it seems — keep a note of when it was (README §8.3 asks for it).
6. **Log as you go.** Add an entry to [`docs/ai-log.md`](../docs/ai-log.md) right after each significant session.

## 3. Don'ts

- Don't commit code you have not read and cannot explain.
- Don't let AI write test results, logs, screenshots or the Contribution table.
- Don't paste secrets, passwords or other people's personal data into AI tools.
- Don't hand one teammate's part to AI and skip learning it — each member is examined on what they claim.

## 4. Prepare for the Oral Defense

Ask yourself — without looking at code or chat history:

- Can I explain every file and function I claim in the Contribution table?
- Can I redraw our architecture and the main sequence diagrams from memory?
- Can I justify each major decision, and name an alternative we rejected and why?
- Can I make a small change to my part live, and debug it if it fails?
- Which AI suggestions did we reject or fix, and why?

**Course-specific practice** — you should be able to answer:

- Why does each service exist? Which step of your analysis produced it?
- Which data does each service own, and how does the process stay consistent when several services change data?
- What happens if a service the process depends on is down or slow?
- Where does a request go, hop by hop, from the frontend to the database and back?

A good self-test: ask an AI assistant to act as a strict examiner and quiz you on your own repository.
