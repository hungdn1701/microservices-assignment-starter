# 🤖 AI-Assisted Development Guide (Vibe Coding)

> ⚠️ AI is a tool to assist you, not replace you. You must **understand** the code AI generates and be able to **explain** your design decisions.

---

## AI Coding Tools

| Tool | Config file (auto-loaded) | Docs |
|------|--------------------------|------|
| GitHub Copilot | `.github/copilot-instructions.md` | [docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions) |
| Cursor | `.cursorrules` | [docs](https://docs.cursor.com/context/rules) |
| Claude Code | `CLAUDE.md` | [docs](https://docs.anthropic.com/en/docs/claude-code) |
| ChatGPT / Claude / Gemini | Use directly | Web/API |
| v0, bolt.new, Lovable | Rapid UI generation | Web |

All config files point to [`.ai/AGENTS.md`](AGENTS.md) — the **source of truth** for all AI tools.

---

## Prompt Templates

The `.ai/prompts/` folder contains ready-to-use prompt templates. Copy, replace `[PLACEHOLDER]` values, and paste into your AI tool:

| Prompt | Purpose |
|--------|---------|
| [new-service.md](prompts/new-service.md) | Scaffold a new microservice |
| [api-endpoint.md](prompts/api-endpoint.md) | Add a new API endpoint |
| [create-dockerfile.md](prompts/create-dockerfile.md) | Generate a Dockerfile |
| [debugging.md](prompts/debugging.md) | Debug errors |

---

## Best Practices

### ✅ Do:
- Review AI-generated code before committing
- Break tasks into small requests — one endpoint, one feature at a time
- Provide full context (error logs, relevant files)
- Use AI to iterate: refactor and improve code

### ❌ Don't:
- Copy-paste code without understanding it
- Send passwords or API keys to AI tools
- Trust AI blindly — it can and does make mistakes

---

## Grading & Presentation

When presenting your project, be prepared to:

1. **Demo**: `docker compose up --build` must run without errors
2. **Explain the architecture**: Why did you decompose services this way?
3. **Explain the code**: How each service works internally
4. **AI's role**: What did AI help with? How did you verify and modify its output?
