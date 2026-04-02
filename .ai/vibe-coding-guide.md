# 🤖 Hướng dẫn Phát triển với AI (Vibe Coding)

> ⚠️ AI là công cụ hỗ trợ, không phải thay thế. Bạn cần **hiểu** code mà AI sinh ra và có khả năng **giải thích** các quyết định thiết kế.

---

## AI Coding Tools

| Tool | File cấu hình (auto-loaded) | Docs |
|------|----------------------------|------|
| GitHub Copilot | `.github/copilot-instructions.md` | [docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions) |
| Cursor | `.cursorrules` | [docs](https://docs.cursor.com/context/rules) |
| Claude Code | `CLAUDE.md` | [docs](https://docs.anthropic.com/en/docs/claude-code) |
| Windsurf | `.windsurfrules` | [docs](https://docs.codeium.com/windsurf) |
| ChatGPT / Claude / Gemini | Dùng trực tiếp | Web/API |
| v0, bolt.new, Lovable | Tạo UI nhanh | Web |

Tất cả các file cấu hình đều trỏ đến [`.ai/AGENTS.md`](AGENTS.md) — đây là **source of truth** cho mọi AI tool.

---

## Prompt Templates

Thư mục `.ai/prompts/` chứa các mẫu prompt sẵn dùng. Copy, thay `[PLACEHOLDER]`, paste vào AI tool:

| Prompt | Mục đích |
|--------|----------|
| [new-service.md](prompts/new-service.md) | Tạo microservice mới |
| [api-endpoint.md](prompts/api-endpoint.md) | Thêm API endpoint |
| [create-dockerfile.md](prompts/create-dockerfile.md) | Tạo Dockerfile |
| [debugging.md](prompts/debugging.md) | Debug lỗi |

---

## Best Practices

### ✅ Nên:
- Review code AI sinh ra trước khi commit
- Chia nhỏ yêu cầu — từng endpoint, từng feature
- Cung cấp context đầy đủ (error logs, file liên quan)
- Dùng AI để iterate: refactor, cải thiện code

### ❌ Không nên:
- Copy-paste code mà không hiểu
- Gửi passwords, API keys cho AI
- Tin tưởng tuyệt đối — AI có thể sai

---

## Đánh giá & Trình bày

Khi trình bày bài tập lớn, chuẩn bị:

1. **Demo**: `docker compose up --build` phải chạy được
2. **Giải thích kiến trúc**: Tại sao chia service như vậy?
3. **Giải thích code**: Cơ chế hoạt động của từng service
4. **Vai trò AI**: AI giúp gì? Bạn đã verify/modify như thế nào?
