# 🚀 Hướng dẫn làm bài tập Microservices

[![GitHub Stars](https://img.shields.io/github/stars/hungdn1701/microservices-assignment-starter?style=social)](https://github.com/hungdn1701/microservices-assignment-starter/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/hungdn1701/microservices-assignment-starter?style=social)](https://github.com/hungdn1701/microservices-assignment-starter/forks)

> 📋 Đây là hướng dẫn từng bước cho sinh viên. Đọc kỹ trước khi bắt đầu.

---

## ⚡ Bắt đầu nhanh

### Bước 1 — Tạo tài khoản GitHub

Nếu chưa có tài khoản, đăng ký tại https://github.com/signup

---

### Bước 2 — Star ⭐ và Fork repo starter

1. Mở repo starter: https://github.com/hungdn1701/microservices-assignment-starter
2. Nhấn nút **⭐ Star** (góc trên bên phải trang)
3. Nhấn nút **Fork** → chọn tài khoản của bạn → **Create fork**

> 📌 Sau khi fork, bạn sẽ có bản copy tại:
> `https://github.com/<your-username>/microservices-assignment-starter`

---

### Bước 3 — Cài công cụ cần thiết

#### Git

| Hệ điều hành | Cách cài |
|---------------|----------|
| **Windows** | Tải tại https://git-scm.com/download/win → cài mặc định |
| **macOS** | Mở Terminal → gõ `git --version` (tự cài nếu chưa có) |
| **Linux** | `sudo apt install git` |

Kiểm tra:
```bash
git --version
# → git version 2.x.x là OK
```

#### Docker Desktop

Tải và cài tại https://docs.docker.com/get-docker/

Kiểm tra:
```bash
docker --version
# → Docker version 2x.x.x là OK

docker compose version
# → Docker Compose version v2.x.x là OK
```

> ⚠️ Trên Windows, đảm bảo Docker Desktop đang chạy (icon 🐳 trên taskbar).

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

## 📝 Quy trình làm bài

### Giai đoạn 1: Phân tích & Thiết kế

1. Đọc file `GETTING_STARTED.md` trong repo để hiểu cấu trúc dự án
2. Chọn **một** phương pháp phân tích:
   - **Cách 1 — SOA (Erl)**: Hoàn thành `docs/analysis-and-design.md`
   - **Cách 2 — Strategic DDD**: Hoàn thành `docs/analysis-and-design-ddd.md`
3. Xác định các service cần thiết

### Giai đoạn 2: Kiến trúc & API

1. Chọn patterns và hoàn thành `docs/architecture.md`
2. Thiết kế API trong `docs/api-specs/`

### Giai đoạn 3: Lập trình

1. Chọn tech stack cho mỗi service
2. Cập nhật Dockerfile
3. Implement `GET /health` cho mỗi service (làm đầu tiên!)
4. Implement business logic và API endpoints
5. Cấu hình Gateway routing
6. Xây dựng Frontend

### Giai đoạn 4: Hoàn thiện

1. Kiểm tra `docker compose up --build` chạy được
2. Cập nhật `README.md` với thông tin nhóm
3. Cập nhật `readme.md` của từng service

---

## 💻 Cách nộp bài

Trong quá trình làm bài, **commit thường xuyên** sau mỗi phần hoàn thành:

```bash
git add .
git commit -m "Hoàn thành phân tích và thiết kế"
git push
```

```bash
git add .
git commit -m "Implement service-a health endpoint"
git push
```

> ✅ Mỗi lần `push` = giảng viên thấy tiến độ của bạn.
>
> ⏰ **Deadline** = thời điểm commit cuối cùng được chấm.
>
> ❌ **KHÔNG** cần tạo Pull Request hay thông báo nộp bài thêm.

---

## ✅ Checklist trước khi nộp

- [ ] `README.md` đã cập nhật thông tin nhóm và mô tả service
- [ ] Tất cả services khởi động được: `docker compose up --build`
- [ ] Mỗi service có endpoint `GET /health` hoạt động
- [ ] `docs/analysis-and-design.md` (hoặc `analysis-and-design-ddd.md`) đã hoàn thành
- [ ] `docs/architecture.md` đã hoàn thành
- [ ] OpenAPI specs trong `docs/api-specs/` khớp với implementation
- [ ] Mỗi service có file `readme.md` riêng
- [ ] Code sạch, tổ chức tốt, theo convention của ngôn ngữ đã chọn

---

## 🎯 Mẹo quan trọng

| # | Mẹo | Tại sao |
|---|------|---------|
| 1 | Làm phân tích trước, code sau | Hiểu rõ domain → code đúng hướng |
| 2 | `GET /health` là endpoint đầu tiên | Xác nhận service chạy được trong Docker |
| 3 | Chạy `docker compose up --build` thường xuyên | Đừng đợi đến cuối mới test |
| 4 | Mỗi thành viên làm một service | Chia theo service, không chia theo layer |
| 5 | Commit nhỏ, commit thường xuyên | Dễ rollback, thể hiện tiến độ |
| 6 | Dùng service name, không dùng `localhost` | `http://service-a:5001` thay vì `http://localhost:5001` |
| 7 | Không hardcode password trong code | Dùng file `.env` cho cấu hình |
| 8 | Dùng AI tools để hỗ trợ | Xem `.ai/vibe-coding-guide.md` trong repo |

---

## ❓ Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `docker: command not found` | Chưa cài Docker Desktop | Cài tại https://docs.docker.com/get-docker/ |
| `Cannot connect to Docker daemon` | Docker Desktop chưa khởi động | Mở Docker Desktop, đợi icon 🐳 xuất hiện |
| `port is already in use` | Port đang bị ứng dụng khác chiếm | Tắt ứng dụng đó hoặc đổi port trong `docker-compose.yml` |
| Service A không gọi được Service B | Dùng `localhost` thay vì service name | Đổi thành `http://service-b:5002` |
| `git push` bị rejected | Có thay đổi trên remote chưa pull | `git pull --rebase` rồi `push` lại |

---

## 📚 Tài liệu tham khảo

- [Starter Template Repo](https://github.com/hungdn1701/microservices-assignment-starter)
- [GETTING_STARTED.md](https://github.com/hungdn1701/microservices-assignment-starter/blob/main/GETTING_STARTED.md) — Hướng dẫn chi tiết trong repo
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)

---

> 💡 Có thắc mắc? Liên hệ giảng viên qua email hoặc đặt câu hỏi trên GitHub Discussions của repo starter.
>
> **Good luck!** 💪🚀
