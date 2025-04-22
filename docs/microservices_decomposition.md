# III. Phân rã hệ thống thành các microservices với Django

## Giới thiệu

Hệ thống Y tế được thiết kế theo kiến trúc microservices, cho phép phát triển, triển khai và mở rộng độc lập các thành phần khác nhau của hệ thống. Mỗi microservice đảm nhận một chức năng nghiệp vụ cụ thể và có thể hoạt động độc lập, đồng thời tích hợp liền mạch với các service khác thông qua API. Django, một framework Python mạnh mẽ, được chọn làm nền tảng chính cho việc phát triển các microservices này.

## Nguyên tắc phân rã

Việc phân rã hệ thống thành các microservices tuân theo các nguyên tắc sau:

1. **Tách biệt theo chức năng nghiệp vụ**: Mỗi microservice đại diện cho một lĩnh vực nghiệp vụ cụ thể và rõ ràng.
2. **Tính độc lập**: Mỗi microservice có thể được phát triển, triển khai và mở rộng độc lập.
3. **Sở hữu dữ liệu**: Mỗi microservice sở hữu và quản lý cơ sở dữ liệu riêng của mình.
4. **Giao tiếp qua API**: Các microservices giao tiếp với nhau thông qua API được định nghĩa rõ ràng.
5. **Khả năng mở rộng**: Mỗi microservice có thể được mở rộng độc lập dựa trên nhu cầu tài nguyên và tải.

## Cấu trúc microservices

Hệ thống Y tế được phân rã thành 8 microservices chính, mỗi service được xây dựng bằng Django và Django REST Framework:

### 1. User Service

**Mô tả**: Quản lý tất cả thông tin liên quan đến người dùng, xác thực và phân quyền.

**Thành phần chính**:
- **Models**: User, Profile (PatientProfile, DoctorProfile, NurseProfile, PharmacistProfile, LabTechProfile), Address, UserActivity
- **APIs**: Đăng ký, đăng nhập, quản lý hồ sơ, quản lý quyền
- **Database**: PostgreSQL riêng cho dữ liệu người dùng

**Công nghệ**:
- Django & Django REST Framework
- JWT cho xác thực
- PostgreSQL cho lưu trữ dữ liệu

**Mã nguồn**:
```
services/
└── user-service/
    ├── Dockerfile
    ├── requirements.txt
    ├── manage.py
    ├── user_service/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── users/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    ├── profiles/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    └── authentication/
        ├── __init__.py
        ├── backends.py
        ├── serializers.py
        ├── views.py
        ├── urls.py
        └── tests.py
```

### 2. Medical Record Service

**Mô tả**: Quản lý hồ sơ y tế của bệnh nhân, bao gồm lịch sử khám bệnh, chẩn đoán, và điều trị.

**Thành phần chính**:
- **Models**: MedicalRecord, Encounter, Diagnosis, Treatment, Allergy, Immunization, MedicalHistory, Medication, VitalSign
- **APIs**: CRUD cho hồ sơ y tế, tìm kiếm và truy vấn hồ sơ
- **Database**: PostgreSQL riêng cho dữ liệu hồ sơ y tế

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Redis cho caching

**Mã nguồn**:
```
services/
└── medical-record-service/
    ├── Dockerfile
    ├── requirements.txt
    ├── manage.py
    ├── medical_record_service/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── records/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    ├── encounters/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    └── diagnoses/
        ├── __init__.py
        ├── models.py
        ├── serializers.py
        ├── views.py
        ├── urls.py
        └── tests.py
```

### 3. Appointment Service

**Mô tả**: Quản lý lịch hẹn giữa bệnh nhân và bác sĩ.

**Thành phần chính**:
- **Models**: DoctorAvailability, TimeSlot, Appointment, AppointmentReason, AppointmentReminder
- **APIs**: Đặt lịch, hủy lịch, tìm kiếm lịch trống
- **Database**: PostgreSQL riêng cho dữ liệu lịch hẹn

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Celery cho xử lý tác vụ nền (nhắc nhở lịch hẹn)

**Mã nguồn**:
```
services/
└── appointment-service/
    ├── Dockerfile
    ├── requirements.txt
    ├── manage.py
    ├── appointment_service/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── availability/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    ├── appointments/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    └── reminders/
        ├── __init__.py
        ├── models.py
        ├── serializers.py
        ├── tasks.py
        ├── views.py
        ├── urls.py
        └── tests.py
```

### 4. Pharmacy Service

**Mô tả**: Quản lý thuốc, đơn thuốc, và cấp phát thuốc.

**Thành phần chính**:
- **Models**: Medication, Prescription, PrescriptionItem, Inventory, Dispensing, DispensingItem
- **APIs**: Kê đơn, xác minh đơn, cấp phát thuốc, quản lý tồn kho
- **Database**: PostgreSQL riêng cho dữ liệu dược phẩm

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Redis cho caching

**Mã nguồn**:
```
services/
└── pharmacy-service/
    ├── Dockerfile
    ├── requirements.txt
    ├── manage.py
    ├── pharmacy_service/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── medications/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    ├── prescriptions/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    └── inventory/
        ├── __init__.py
        ├── models.py
        ├── serializers.py
        ├── views.py
        ├── urls.py
        └── tests.py
```

### 5. Laboratory Service

**Mô tả**: Quản lý xét nghiệm, mẫu xét nghiệm, và kết quả xét nghiệm.

**Thành phần chính**:
- **Models**: TestType, LabTest, SampleCollection, TestResult, TestParameter, ParameterResult
- **APIs**: Yêu cầu xét nghiệm, ghi nhận kết quả, truy vấn kết quả
- **Database**: PostgreSQL riêng cho dữ liệu xét nghiệm

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Celery cho xử lý tác vụ nền

**Mã nguồn**:
```
services/
└── laboratory-service/
    ├── Dockerfile
    ├── requirements.txt
    ├── manage.py
    ├── laboratory_service/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── test_types/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    ├── lab_tests/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    └── results/
        ├── __init__.py
        ├── models.py
        ├── serializers.py
        ├── views.py
        ├── urls.py
        └── tests.py
```

### 6. Billing Service

**Mô tả**: Quản lý hóa đơn, thanh toán, và yêu cầu bảo hiểm.

**Thành phần chính**:
- **Models**: Invoice, InvoiceItem, Payment, InsuranceClaim, InsuranceProvider, PriceList
- **APIs**: Tạo hóa đơn, xử lý thanh toán, quản lý yêu cầu bảo hiểm
- **Database**: PostgreSQL riêng cho dữ liệu thanh toán

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Celery cho xử lý tác vụ nền (thanh toán, yêu cầu bảo hiểm)

**Mã nguồn**:
```
services/
└── billing-service/
    ├── Dockerfile
    ├── requirements.txt
    ├── manage.py
    ├── billing_service/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── invoices/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    ├── payments/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    └── insurance/
        ├── __init__.py
        ├── models.py
        ├── serializers.py
        ├── views.py
        ├── urls.py
        └── tests.py
```

### 7. Notification Service

**Mô tả**: Quản lý và gửi thông báo đến người dùng qua nhiều kênh khác nhau.

**Thành phần chính**:
- **Models**: NotificationTemplate, NotificationLog, NotificationPreference, NotificationQueue
- **APIs**: Gửi thông báo, quản lý mẫu thông báo, quản lý tùy chọn thông báo
- **Database**: PostgreSQL riêng cho dữ liệu thông báo

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Celery cho xử lý tác vụ nền (gửi thông báo)
- Redis cho message broker
- Django Channels cho WebSocket

**Mã nguồn**:
```
services/
└── notification-service/
    ├── Dockerfile
    ├── requirements.txt
    ├── manage.py
    ├── notification_service/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    │   └── asgi.py
    ├── templates/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    ├── notifications/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── tasks.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    └── websockets/
        ├── __init__.py
        ├── consumers.py
        ├── routing.py
        └── tests.py
```

### 8. AI ChatBot Service

**Mô tả**: Cung cấp trợ lý AI và giao tiếp trực tiếp giữa bệnh nhân và bác sĩ.

**Thành phần chính**:
- **Models**: Conversation, Message, AIInteraction, Attachment
- **APIs**: Tạo hội thoại, gửi tin nhắn, tương tác với AI
- **Database**: PostgreSQL riêng cho dữ liệu hội thoại

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Django Channels cho WebSocket
- OpenAI API cho tích hợp AI
- Redis cho message broker

**Mã nguồn**:
```
services/
└── chatbot-service/
    ├── Dockerfile
    ├── requirements.txt
    ├── manage.py
    ├── chatbot_service/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    │   └── asgi.py
    ├── conversations/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    ├── messages/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    ├── ai/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── serializers.py
    │   ├── services.py
    │   ├── views.py
    │   ├── urls.py
    │   └── tests.py
    └── websockets/
        ├── __init__.py
        ├── consumers.py
        ├── routing.py
        └── tests.py
```

## Thư viện chung (Common Libraries)

Để tránh lặp lại mã nguồn và đảm bảo tính nhất quán giữa các microservices, một số thư viện chung được phát triển:

### Common Auth Library

**Mô tả**: Cung cấp các chức năng xác thực và phân quyền chung cho tất cả các microservices.

**Thành phần chính**:
- JWT Authentication
- Permission classes
- User context

**Mã nguồn**:
```
services/
└── common-auth/
    ├── setup.py
    └── common_auth/
        ├── __init__.py
        ├── authentication.py
        ├── permissions.py
        └── utils.py
```

### Common Utils Library

**Mô tả**: Cung cấp các tiện ích chung cho tất cả các microservices.

**Thành phần chính**:
- Logging
- Error handling
- Date/time utilities
- Pagination

**Mã nguồn**:
```
services/
└── common-utils/
    ├── setup.py
    └── common_utils/
        ├── __init__.py
        ├── logging.py
        ├── errors.py
        ├── datetime.py
        └── pagination.py
```

## API Gateway

**Mô tả**: Đóng vai trò là điểm vào duy nhất cho tất cả các yêu cầu API, xử lý định tuyến, xác thực, và cân bằng tải.

**Thành phần chính**:
- Định tuyến yêu cầu đến microservices phù hợp
- Xác thực và phân quyền
- Rate limiting
- Caching
- Logging và monitoring

**Công nghệ**:
- Node.js & Express
- Redis cho caching và rate limiting
- JWT cho xác thực

**Mã nguồn**:
```
services/
└── api-gateway/
    ├── Dockerfile
    ├── package.json
    ├── server.js
    ├── src/
    │   ├── config/
    │   │   ├── index.js
    │   │   └── routes.js
    │   ├── middleware/
    │   │   ├── auth.js
    │   │   ├── rateLimit.js
    │   │   └── errorHandler.js
    │   ├── routes/
    │   │   ├── index.js
    │   │   ├── users.js
    │   │   ├── medical-records.js
    │   │   ├── appointments.js
    │   │   ├── pharmacy.js
    │   │   ├── laboratory.js
    │   │   ├── billing.js
    │   │   ├── notifications.js
    │   │   └── chatbot.js
    │   └── utils/
    │       ├── logger.js
    │       └── proxy.js
    └── test/
        └── routes.test.js
```

## Giao tiếp giữa các Microservices

Các microservices giao tiếp với nhau thông qua các cơ chế sau:

1. **REST API**: Giao tiếp đồng bộ giữa các services thông qua HTTP/HTTPS.
2. **Event-driven**: Giao tiếp bất đồng bộ thông qua Celery và Redis.
3. **WebSocket**: Giao tiếp thời gian thực cho các tính năng như thông báo và trò chuyện.

## Triển khai

Hệ thống được triển khai bằng Docker Compose, cho phép dễ dàng khởi động và quản lý tất cả các microservices cùng với các dịch vụ phụ trợ như cơ sở dữ liệu và message broker.

**Mã nguồn**:
```
docker-compose.yml
```

## Lợi ích của kiến trúc Microservices với Django

1. **Tính mô-đun hóa**: Mỗi microservice có thể được phát triển, triển khai và mở rộng độc lập.
2. **Khả năng mở rộng**: Các microservices có thể được mở rộng độc lập dựa trên nhu cầu tài nguyên.
3. **Khả năng chịu lỗi**: Sự cố trong một microservice không ảnh hưởng đến toàn bộ hệ thống.
4. **Đa dạng công nghệ**: Mỗi microservice có thể sử dụng công nghệ phù hợp nhất cho chức năng của nó.
5. **Phát triển song song**: Các nhóm khác nhau có thể làm việc trên các microservices khác nhau cùng một lúc.
6. **Tái sử dụng mã nguồn**: Các thư viện chung cho phép tái sử dụng mã nguồn giữa các microservices.

## Thách thức và Giải pháp

1. **Phức tạp trong triển khai**: Sử dụng Docker Compose để đơn giản hóa quá trình triển khai.
2. **Quản lý dữ liệu phân tán**: Mỗi service quản lý dữ liệu riêng, với các API rõ ràng để truy cập dữ liệu.
3. **Xác thực và phân quyền**: Sử dụng Common Auth Library để đảm bảo tính nhất quán.
4. **Theo dõi và gỡ lỗi**: Triển khai hệ thống logging và monitoring tập trung.
5. **Giao tiếp giữa các services**: Sử dụng kết hợp REST API và event-driven architecture để đảm bảo giao tiếp hiệu quả và đáng tin cậy.
6. **Tính nhất quán dữ liệu**: Áp dụng mô hình eventual consistency và transaction outbox pattern để đảm bảo tính nhất quán dữ liệu giữa các services.
7. **Quản lý phiên bản API**: Triển khai versioning cho tất cả các API để đảm bảo khả năng tương thích ngược.
8. **Bảo mật**: Áp dụng các biện pháp bảo mật nhiều lớp, bao gồm JWT, HTTPS, và kiểm soát truy cập dựa trên vai trò.

## Ví dụ về giao tiếp giữa các Microservices

### Ví dụ 1: Đặt lịch hẹn và thông báo

1. Bệnh nhân gửi yêu cầu đặt lịch hẹn thông qua API Gateway.
2. API Gateway chuyển tiếp yêu cầu đến Appointment Service.
3. Appointment Service xác thực yêu cầu, kiểm tra tính khả dụng, và tạo lịch hẹn mới.
4. Appointment Service gửi sự kiện "appointment_created" đến Notification Service thông qua Celery task.
5. Notification Service nhận sự kiện, tạo thông báo, và gửi đến bệnh nhân và bác sĩ.

```python
# Trong Appointment Service
from celery import shared_task

@shared_task
def notify_appointment_created(appointment_id):
    # Gửi thông báo đến Notification Service
    response = requests.post(
        f"{settings.NOTIFICATION_SERVICE_URL}/api/notifications/",
        json={
            "type": "APPOINTMENT_CREATED",
            "recipient_id": appointment.patient_id,
            "data": {
                "appointment_id": appointment_id,
                "doctor_name": appointment.doctor.full_name,
                "date": appointment.date.isoformat(),
                "time": appointment.time.isoformat()
            }
        },
        headers={"Authorization": f"Bearer {get_service_token()}"}
    )
    return response.status_code == 201

# Sau khi tạo lịch hẹn
appointment = Appointment.objects.create(...)
notify_appointment_created.delay(appointment.id)
```

### Ví dụ 2: Kê đơn thuốc và kiểm tra tương tác

1. Bác sĩ gửi yêu cầu kê đơn thuốc thông qua API Gateway.
2. API Gateway chuyển tiếp yêu cầu đến Pharmacy Service.
3. Pharmacy Service gọi Medical Record Service để lấy thông tin về thuốc hiện tại và dị ứng của bệnh nhân.
4. Pharmacy Service kiểm tra tương tác thuốc và dị ứng.
5. Nếu an toàn, Pharmacy Service tạo đơn thuốc mới và gửi thông báo đến Notification Service.

```python
# Trong Pharmacy Service
def create_prescription(request):
    # Lấy thông tin từ Medical Record Service
    response = requests.get(
        f"{settings.MEDICAL_RECORD_SERVICE_URL}/api/patients/{patient_id}/medications/",
        headers={"Authorization": f"Bearer {get_service_token()}"}
    )

    if response.status_code != 200:
        return Response({"error": "Failed to fetch patient medications"}, status=400)

    current_medications = response.json()

    # Kiểm tra tương tác thuốc
    interactions = check_drug_interactions(current_medications, new_medications)

    if interactions:
        return Response({"error": "Drug interactions detected", "interactions": interactions}, status=400)

    # Tạo đơn thuốc mới
    prescription = Prescription.objects.create(...)

    # Thông báo cho bệnh nhân
    notify_prescription_created.delay(prescription.id)

    return Response(PrescriptionSerializer(prescription).data, status=201)
```

## Kết luận

Việc phân rã hệ thống Y tế thành các microservices với Django mang lại nhiều lợi ích về tính mô-đun hóa, khả năng mở rộng, và khả năng chịu lỗi. Mỗi microservice được thiết kế để đảm nhận một chức năng nghiệp vụ cụ thể, với cơ sở dữ liệu riêng và API rõ ràng.

Django và Django REST Framework cung cấp nền tảng mạnh mẽ cho việc phát triển các microservices, với các tính năng như ORM, authentication, và serialization. Kết hợp với các công nghệ như Celery, Redis, và PostgreSQL, hệ thống có thể xử lý hiệu quả các yêu cầu phức tạp của một hệ thống y tế hiện đại.

Kiến trúc này không chỉ đáp ứng các yêu cầu hiện tại mà còn cho phép dễ dàng mở rộng và phát triển trong tương lai, đảm bảo hệ thống có thể thích ứng với các yêu cầu mới và công nghệ mới.