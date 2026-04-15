# System Architecture

> This document is completed **after** [Analysis and Design](analysis-and-design.md).
> Based on the Service Candidates and Non-Functional Requirements identified there, select appropriate architecture patterns and design the deployment architecture.

**References:**
1. *Service-Oriented Architecture: Analysis and Design for Services and Microservices* — Thomas Erl (2nd Edition)
2. *Microservices Patterns: With Examples in Java* — Chris Richardson
3. *Bài tập — Phát triển phần mềm hướng dịch vụ* — Hung Dang (available in Vietnamese)

---

## 1. Pattern Selection

Select patterns based on business/technical justifications from your analysis.

| Pattern | Selected? | Business/Technical Justification |
|---------|-----------|----------------------------------|
| API Gateway | ✅ Có | Cung cấp một điểm vào duy nhất (Single Entry Point) cho Web. Đảm nhận kiểm tra bảo mật (Auth JWT) và điều tuyến (Routing) trước khi chia nhánh vào network nội bộ. |
| Database per Service | ✅ Có | Khẳng định tính cốt lõi của Microservices. Mỗi Entity Service (Showtime, Seat, Payment) sỡ hữu schema Database độc lập, ngăn lỗi sập DB chéo (Single point of failure). |
| Shared Database | ❌ Không | Vi phạm nguyên tắc Loosely Coupled. Gây rủi ro deadlock tranh giành tài nguyên cực cao trong một ứng dụng đặt vé. |
| Saga | ✅ Có | Áp dụng trên `Ticketing Task Service` (Orchestrator). Nếu Payment service báo lỗi không trừ được tiền khách, sinh lệnh bù trừ (Compensating) sang `Seat Service` để **NHẢ LẠI GHẾ (Unlock Seat)**. |
| Event-driven / Message Queue | ✅ Có | Áp dụng cho module Gửi SMS/Email. (Dùng Redis/RabbitMQ). `Publish-Subscribe` giúp luồng Mua vé KHÔNG PHẢI CHỜ tiến trình gửi Email xong mới thành công, mà đẩy vào hàng đợi chạy bất đồng bộ (Async). |
| CQRS | ❌ Không | Cấu trúc rạp phim không có nhu cầu Write và Read chồng chéo lệch tông nhau quá căng tới mức phải phân tách tầng kho dữ liệu. Gây over-engineering. |
| Circuit Breaker | ❌ Không | Bỏ qua ở quy mô môn học để giảm bớt gánh nặng code Config quản lý dự án (Fault tolerance). |
| Service Registry / Discovery | ❌ Không | Ở quy mô cục bộ trên đồ án trường, ta định tuyến nội bộ thông qua tên DNS mặc định của Docker Compose Network. Không dùng Server Eureka. |

> Reference: *Microservices Patterns* — Chris Richardson, chapters on decomposition, data management, and communication patterns.

---

## 2. System Components

| Component     | Responsibility | Tech Stack      | Port  |
|---------------|----------------|-----------------|-------|
| **Frontend**  | Giao diện người dùng mua vé (Client UI)| React.js / Vue.js | 3000  |
| **Gateway**   | Cửa ngõ API duy nhất, gác cổng bảo mật | Spring Cloud Gateway| 8080  |
| **Showtime Service**| Dịch vụ quản lý phim, giờ phim | Spring Boot (Java) | 5001  |
| **Seat Service**| Dịch vụ giữ, lock, unlock ghế rạp | Spring Boot (Java) | 5002  |
| **Ticketing Task**| Nhạc trưởng điều phối luồng Mua vé | Spring Boot (Java) | 5003  |
| **Payment Service**| Mô phỏng tính tiền ngân hàng | Spring Boot (Java) | 5004  |
| **Notification Svc**| Phát hành thông điệp Email/SMS | Spring Boot (Java) | 5005  |
| **Databases**| Hệ lưu trữ biệt lập phân tán rẽ nhánh | MySQL (Docker Container) | 3306  |

---

## 3. Communication

### Inter-service Communication Matrix

Quy ước: 
*   **[REST]**: Gọi trực tiếp HTTP Đồng bộ (Synchronous). Đợi trả kết quả.
*   **[AMQP]**: Gửi sự kiện message Bất đồng bộ (Asynchronous) qua RabbitMQ/Kafka. Không cần chờ.

| From → To     | Showtime | Seat Service | Payment Svc | Ticketing Task | Notification Svc | 
|---------------|----------|--------------|-------------|----------------|------------------|
| **Frontend**  | (Chặn)   | (Chặn)       | (Chặn)      | (Chặn)         | (Chặn)           |
| **Gateway**   | [REST]   | [REST]       | (Chặn)      | [REST]         | (Chặn)           |
| **Ticketing Task**|      | [REST] Lock/Unlock| [REST] Process|         | [AMQP] Gửi Mail  |

> *Chặn (Deny)*: Đồng nghĩa với việc Không được phép. Ví dụ Frontend không được gọi thẳng các Service lẻ. Nằm phía sau Gateway là mạng lưới Private Net. Payment Service cũng bị che giấu khỏi Frontend và Gateway để bảo mật tuyết đối quy trình trừ tiền, chỉ mình Ticketing được đụng vào nó.

---

## 4. Architecture Diagram

> Mạng lưới sơ đồ Cấu trúc Vật lý cấp cao (Deployable Server Level). Place diagrams in `docs/asset/` and reference here.

```mermaid
graph TD
    U[Khách Mua Vé] -->|Truy cập qua Internet| FE[Frontend UI :3000]
    FE -->|HTTP Yêu Cầu REST| GW[API Gateway :8080]

    subgraph "Docker Bridge Internal Network"
        GW -->|Routers: /api/movies| SS[Showtime Service :5001]
        GW -->|Routers: /api/seats| ST[Seat Service :5002]
        GW -->|Routers: /api/ticketing| TS[Ticketing Task Service :5003]
        
        TS -->|1. REST /lock-seat| ST
        TS -->|2. REST /process-money| PS[Payment Service :5004]
        
        TS -.->|3. RabbitMQ Produce msg| MQ((Message Broker: RabbitMQ))
        MQ -.->|Consume msg| NS[Notification Service :5005]
        
        SS --> DB1[(MySQL: db_showtime)]
        ST --> DB2[(MySQL: db_seat)]
        PS --> DB3[(MySQL: db_payment)]
        TS -.-> DB4[(MySQL: db_tasklog - Optional)]
    end
```

---

## 5. Deployment

- All services are strictly containerized with individually managed `Dockerfile`.
- Tách biệt Networking và Routing thông qua thiết lập `docker-compose.yml`.
- Orchestrated via Docker Compose with standard single-click spin-up.
- Single command: `docker compose up --build -d`
