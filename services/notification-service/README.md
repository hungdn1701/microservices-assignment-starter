# Notification Service

Notification Service là một dịch vụ quản lý và gửi thông báo trong hệ thống y tế. Dịch vụ này hỗ trợ gửi thông báo qua email, SMS và có thể mở rộng để hỗ trợ các kênh khác.

## Tính năng

- Gửi thông báo qua email và SMS
- Lên lịch gửi thông báo
- Quản lý mẫu thông báo
- Xử lý sự kiện từ các dịch vụ khác
- Theo dõi trạng thái thông báo

## API Endpoints

### Thông báo

- `GET /api/notifications/`: Lấy danh sách thông báo
- `POST /api/notifications/`: Tạo thông báo mới
- `GET /api/notifications/{id}/`: Lấy thông tin chi tiết thông báo
- `PUT /api/notifications/{id}/`: Cập nhật thông báo
- `DELETE /api/notifications/{id}/`: Xóa thông báo
- `POST /api/notifications/send_email/`: Gửi thông báo qua email
- `POST /api/notifications/send_sms/`: Gửi thông báo qua SMS
- `POST /api/notifications/send_from_template/`: Gửi thông báo từ mẫu

### Mẫu thông báo

- `GET /api/notifications/templates/`: Lấy danh sách mẫu thông báo
- `POST /api/notifications/templates/`: Tạo mẫu thông báo mới
- `GET /api/notifications/templates/{id}/`: Lấy thông tin chi tiết mẫu thông báo
- `PUT /api/notifications/templates/{id}/`: Cập nhật mẫu thông báo
- `DELETE /api/notifications/templates/{id}/`: Xóa mẫu thông báo

### Lịch gửi thông báo

- `GET /api/notifications/schedules/`: Lấy danh sách lịch gửi thông báo
- `POST /api/notifications/schedules/`: Tạo lịch gửi thông báo mới
- `GET /api/notifications/schedules/{id}/`: Lấy thông tin chi tiết lịch gửi thông báo
- `PUT /api/notifications/schedules/{id}/`: Cập nhật lịch gửi thông báo
- `DELETE /api/notifications/schedules/{id}/`: Xóa lịch gửi thông báo
- `POST /api/notifications/schedules/schedule/`: Lên lịch gửi thông báo
- `POST /api/notifications/schedules/{id}/cancel/`: Hủy lịch gửi thông báo

### Xử lý sự kiện

- `POST /api/events`: Xử lý sự kiện từ các dịch vụ khác

## Tích hợp với các dịch vụ khác

Notification Service có thể nhận sự kiện từ các dịch vụ khác và tạo thông báo tương ứng. Các dịch vụ khác có thể gửi sự kiện đến endpoint `/api/events` với cấu trúc dữ liệu như sau:

```json
{
  "service": "SERVICE_NAME",
  "event_type": "EVENT_TYPE",
  "patient_id": 123,
  "doctor_id": 456,
  "other_fields": "..."
}
```

Trong đó:
- `service`: Tên dịch vụ gửi sự kiện (APPOINTMENT, MEDICAL_RECORD, BILLING, PHARMACY, LABORATORY)
- `event_type`: Loại sự kiện (CREATED, UPDATED, CANCELLED, ...)
- Các trường khác tùy thuộc vào loại sự kiện

### Ví dụ: Gửi sự kiện từ Appointment Service

```json
{
  "service": "APPOINTMENT",
  "event_type": "CREATED",
  "appointment_id": 123,
  "patient_id": 456,
  "doctor_id": 789,
  "appointment_date": "2023-11-15T10:00:00Z",
  "appointment_type": "CONSULTATION",
  "notes": "Khám tổng quát"
}
```

### Ví dụ: Gửi sự kiện từ Billing Service

```json
{
  "service": "BILLING",
  "event_type": "PAYMENT_DUE",
  "invoice_id": 123,
  "patient_id": 456,
  "amount": 500000,
  "due_date": "2023-11-20",
  "description": "Hóa đơn khám bệnh"
}
```

## Cấu hình

Notification Service có thể được cấu hình thông qua các biến môi trường sau:

- `EMAIL_HOST`: SMTP host cho gửi email
- `EMAIL_PORT`: SMTP port cho gửi email
- `EMAIL_HOST_USER`: SMTP username
- `EMAIL_HOST_PASSWORD`: SMTP password
- `EMAIL_USE_TLS`: Sử dụng TLS cho SMTP (true/false)
- `DEFAULT_FROM_EMAIL`: Địa chỉ email mặc định để gửi
- `SMS_PROVIDER`: Nhà cung cấp dịch vụ SMS (TWILIO, NEXMO, ...)
- `SMS_API_KEY`: API key cho dịch vụ SMS
- `SMS_API_SECRET`: API secret cho dịch vụ SMS
- `SMS_FROM_NUMBER`: Số điện thoại mặc định để gửi SMS

## Chạy dịch vụ

Notification Service có thể được chạy như một dịch vụ độc lập hoặc như một phần của hệ thống y tế.

### Chạy với Docker

```bash
docker-compose up -d notification-service
```

### Chạy trực tiếp

```bash
cd notification-service
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Tạo mẫu thông báo mặc định

Notification Service cung cấp một script để tạo các mẫu thông báo mặc định:

```bash
python manage.py create_default_templates
```

## Lên lịch gửi thông báo

Notification Service cung cấp các lệnh để lên lịch gửi thông báo:

```bash
python manage.py schedule_appointment_reminders
python manage.py schedule_followup_reminders
python manage.py schedule_payment_reminders
python manage.py schedule_medication_refill_reminders
python manage.py schedule_lab_test_reminders
```

Các lệnh này có thể được chạy định kỳ bằng cron job hoặc celery beat.
