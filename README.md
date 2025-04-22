# 🆗 Hệ thống Microservices Y tế

Hệ thống quản lý y tế toàn diện được xây dựng với kiến trúc microservices, cung cấp dịch vụ an toàn và hiệu quả cho bệnh nhân, nhà cung cấp dịch vụ y tế và quản trị viên.

---

## 📝 Tổng quan Dự án

Hệ thống y tế này triển khai kiến trúc microservices hiện đại để cung cấp giải pháp toàn diện cho quản lý y tế. Hệ thống bao gồm các dịch vụ quản lý người dùng, hồ sơ y tế, lịch hẹn, dược phẩm, xét nghiệm, thanh toán, thông báo và chatbot AI hỗ trợ bệnh nhân.

### Tính năng chính

- **Truy cập an toàn dựa trên vai trò** cho bệnh nhân, bác sĩ, y tá, dược sĩ, kỹ thuật viên xét nghiệm và quản trị viên
- **Quản lý hồ sơ y tế điện tử** với lịch sử bệnh nhân toàn diện
- **Đặt lịch hẹn** với quản lý thời gian rảnh và nhắc nhở
- **Quản lý đơn thuốc** và kiểm soát kho dược phẩm
- **Xét nghiệm** đặt hàng, thu thập mẫu và quản lý kết quả
- **Thanh toán và xử lý yêu cầu bảo hiểm**
- **Thông báo thời gian thực** qua WebSocket và email/SMS
- **Trợ lý sức khỏe AI** hỗ trợ bệnh nhân 24/7
- **Chat bảo mật giữa bệnh nhân-bác sĩ** cho giao tiếp trực tiếp

---

## 📁 Kiến trúc Hệ thống

Hệ thống được xây dựng sử dụng kiến trúc microservices với các thành phần sau:

```
healthcare-microservices/
├── README.md                       # Tài liệu dự án
├── .env.example                    # Mẫu biến môi trường
├── docker-compose.yml              # Cấu hình điều phối container
├── docs/                           # Thư mục tài liệu
│   ├── architecture.md             # Chi tiết kiến trúc hệ thống
│   ├── analysis-and-design.md      # Tài liệu phân tích và thiết kế hệ thống
│   ├── assets/                     # Sơ đồ và tài sản trực quan
│   │   ├── images/                # Hình ảnh sơ đồ được tạo
│   │   └── puml/                  # File nguồn PlantUML
│   └── api-specs/                  # Đặc tả OpenAPI
├── scripts/                        # Script tiện ích
│   └── generate_diagrams.sh        # Script tạo sơ đồ từ PlantUML
├── services/                       # Các microservice
│   ├── user-service/               # Xác thực và quản lý người dùng
│   ├── medical-record-service/      # Quản lý hồ sơ y tế bệnh nhân
│   ├── appointment-service/         # Đặt lịch hẹn
│   ├── pharmacy-service/            # Quản lý đơn thuốc và dược phẩm
│   ├── laboratory-service/          # Xét nghiệm và kết quả
│   ├── billing-service/             # Thanh toán và yêu cầu bảo hiểm
│   ├── notification-service/        # Thông báo và cảnh báo
│   └── common-auth/                # Thư viện xác thực chung
└── api-gateway/                    # API Gateway định tuyến dịch vụ
```

### Mô tả các Dịch vụ

| Dịch vụ | Mô tả | Công nghệ |
|---------|-------------|------------------|
| API Gateway | Định tuyến yêu cầu, xử lý xác thực, giới hạn tốc độ | Node.js, Express |
| User Service | Quản lý người dùng, xác thực, hồ sơ | Django, DRF, PostgreSQL |
| Medical Record Service | Hồ sơ bệnh nhân, phiên khám, chẩn đoán | Django, DRF, PostgreSQL |
| Appointment Service | Lịch hẹn, thời gian rảnh của bác sĩ | Django, DRF, PostgreSQL |
| Pharmacy Service | Đơn thuốc, kho dược phẩm | Django, DRF, PostgreSQL |
| Laboratory Service | Yêu cầu xét nghiệm, thu thập mẫu, kết quả | Django, DRF, PostgreSQL |
| Billing Service | Hóa đơn, thanh toán, yêu cầu bảo hiểm | Django, DRF, PostgreSQL |
| Notification Service | Cảnh báo, nhắc nhở, cập nhật thời gian thực | Django, DRF, Channels, Celery |
| AI ChatBot Service | Trợ lý sức khỏe, chat bệnh nhân-bác sĩ | Django, DRF, Channels, OpenAI API |

---

## 🚀 Bắt đầu sử dụng

### Yêu cầu hệ thống

- Docker và Docker Compose
- Git

### Cài đặt

1. **Sao chép repository này**

   ```bash
   git clone <repository-url>
   cd healthcare-microservices
   ```

2. **Sao chép file môi trường**

   ```bash
   cp .env.example .env
   ```

3. **Chạy với Docker Compose**

   ```bash
   docker-compose up --build
   ```

### Truy cập các dịch vụ

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **Tài liệu API**: http://localhost:4000/api-docs
- **Tài liệu Swagger cho từng dịch vụ**:
  - User Service: http://localhost:8000/swagger/
  - Medical Record Service: http://localhost:8001/swagger/
  - Appointment Service: http://localhost:8002/swagger/
  - Billing Service: http://localhost:8003/swagger/
  - Pharmacy Service: http://localhost:8004/swagger/
  - Laboratory Service: http://localhost:8005/swagger/
  - Notification Service: http://localhost:8006/swagger/

---

## 📝 Tài liệu

- **Phân tích và Thiết kế Hệ thống**: Xem `docs/analysis-and-design.md` để biết chi tiết về phân tích và thiết kế hệ thống.
- **Kiến trúc**: Xem `docs/architecture.md` để biết chi tiết về kiến trúc hệ thống.
- **Đặc tả API**: Đặc tả OpenAPI có sẵn trong thư mục `docs/api-specs/`.
- **Sơ đồ**: Các sơ đồ trực quan có sẵn trong thư mục `docs/assets/images/`.

### Tạo Sơ đồ

Để tạo hoặc cập nhật sơ đồ từ các file nguồn PlantUML:

```bash
./scripts/generate_diagrams.sh
```

Để tạo một sơ đồ cụ thể:

```bash
./scripts/generate_diagrams.sh <tên-sơ-đồ>
```

---

## 👥 Thành viên Nhóm và Đóng góp

### Thành viên Nhóm

1. **Lê Đức Thắng-B21DCDT205**
2. **Nguyễn Vũ Duy Anh-B21DCVT004**
3. **Nguyễn Đức Tài-B21DCDT199**

## 👨‍🏫 Lời cảm ơn

Dự án này được phát triển cho bài tập lớn môn Phát triển phần mềm hướng dịch vụ của Thầy Đặng Ngọc Hùng
