# Kiến trúc hệ thống

## Tổng quan

Hệ thống quản lý y tế theo kiến trúc microservices bao gồm các thành phần độc lập, mô đun hóa, cung cấp chức năng xác thực, quản lý hồ sơ y tế, đặt lịch hẹn, xử lý đơn thuốc, xét nghiệm, thanh toán và thông báo real-time.

## Các thành phần hệ thống

| Service Name           | Chức năng chính                                                  | Công nghệ                                  |
|------------------------|------------------------------------------------------------------|--------------------------------------------|
| API Gateway            | Xác thực JWT, phân quyền, định tuyến, rate limiting, logging     | Node.js, Express, http-proxy-middleware    |
| User Service           | Quản lý người dùng, phân quyền, hồ sơ, audit log                 | Django, DRF, PostgreSQL, JWT, Celery       |
| Medical Record Service | Quản lý hồ sơ y tế, phiên khám, chẩn đoán, điều trị              | Django, DRF, PostgreSQL, Celery            |
| Appointment Service    | Quản lý khung giờ bác sĩ, đặt lịch, quản lý cuộc hẹn             | Django, DRF, PostgreSQL, Celery            |
| Pharmacy Service       | Quản lý đơn thuốc, kê đơn, tồn kho, dispensation                  | Django, DRF, PostgreSQL, Celery            |
| Laboratory Service     | Quản lý yêu cầu xét nghiệm, lấy mẫu, kết quả, thông báo          | Django, DRF, PostgreSQL, Celery, Channels  |
| Billing Service        | Tạo hóa đơn, thanh toán, xử lý yêu cầu bảo hiểm                  | Django, DRF, PostgreSQL, Celery            |
| Notification Service   | Xử lý task bất đồng bộ, đẩy thông báo real-time qua WebSocket    | Django, DRF, PostgreSQL, Celery, Channels  |
| AI ChatBot Service     | Trợ lý AI sức khỏe và chat bảo mật giữa bệnh nhân-bác sĩ     | Django, DRF, PostgreSQL, Channels, OpenAI API |
| Frontend Service       | Giao diện Web/Mobile                                             | React, TypeScript                          |
| Common Auth Library    | Chia sẻ logic xác thực, phân quyền, health-check                 | Python package                             |

## Giao tiếp

- Khách hàng gọi API qua API Gateway (HTTP/HTTPS).
- API Gateway xác thực token, attach tiêu đề ngữ cảnh, proxy đến service tương ứng.
- Giao tiếp service-to-service qua REST HTTP nội bộ, truyền header `Authorization: Bearer <token>` và header ngữ cảnh (`X-User-ID`, `X-User-Role`, ...).
- Bất đồng bộ: Celery + Redis xử lý task (nhắc nhở, email, SMS).
- Real-time: Django Channels + WebSocket cho thông báo trực tiếp và chat.
- AI ChatBot Service gọi OpenAI API cho các tương tác AI và sử dụng WebSocket cho chat thời gian thực.
- Dữ liệu lưu vào PostgreSQL riêng cho mỗi service; Redis làm cache, broker Celery, layer cho Channels.

## Luồng dữ liệu

1. Frontend gửi yêu cầu đến API Gateway.
2. Gateway xác thực, attach ngữ cảnh, proxy tới service.
3. Service xử lý, đọc/ghi PostgreSQL hoặc đẩy task Celery vào Redis.
4. Celery worker thực thi task, Notification Service đẩy thông báo qua WebSocket.
5. Kết quả trả về Frontend.

**Luồng AI ChatBot**:
1. Người dùng gửi tin nhắn đến AI ChatBot Service thông qua API Gateway.
2. AI ChatBot Service xử lý nội dung và gửi yêu cầu đến OpenAI API.
3. Phản hồi từ OpenAI được xử lý và lưu vào cơ sở dữ liệu.
4. Phản hồi được gửi lại cho người dùng qua WebSocket.

**Luồng chat bệnh nhân-bác sĩ**:
1. Bệnh nhân hoặc bác sĩ gửi tin nhắn qua WebSocket.
2. AI ChatBot Service lưu tin nhắn vào cơ sở dữ liệu.
3. Tin nhắn được gửi đến người nhận qua WebSocket.
4. Notification Service gửi thông báo cho người nhận nếu họ không online.

**Phụ thuộc bên ngoài**:
- PostgreSQL: mỗi service có database riêng.
- Redis: cache, Celery broker, token blacklist, Channels layer.
- Docker Compose orchestrate các container.

## Sơ đồ kiến trúc

- Xem `docs/assets/architecture.puml` để tham khảo sơ đồ đồ họa.

```ascii
Clients ──> API Gateway ──┬─ User Service
                         ├─ Medical Record Service
                         ├─ Appointment Service
                         ├─ Pharmacy Service
                         ├─ Laboratory Service
                         ├─ Billing Service
                         ├─ Notification Service
                         └─ AI ChatBot Service ──> OpenAI API

Frontend Service (React) <─── WebSocket ───> AI ChatBot Service
```

## Khả năng mở rộng & Chịu lỗi

- **Horizontal Scaling**: Mỗi service stateless, có thể tăng instance độc lập.
- **Load Balancing**: API Gateway phân phối yêu cầu.
- **Resilience**: Retry, timeout, circuit breaker (có thể tích hợp OpenTelemetry, Resilience4j).
- **Health Checks**: Container tự động restart khi failure.
- **Quan sát**: Distributed tracing (Jaeger, OpenTelemetry), centralized logs (ELK/EFK).
- **CI/CD**: Pipeline build/test/deploy tự động (GitHub Actions, Jenkins…)

---