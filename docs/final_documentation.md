# HỆ THỐNG Y TẾ MICROSERVICES

## MỤC LỤC

- [CHAPTER 1: REQUIREMENTS OF E-COMMERCE](#chapter-1-requirements-of-e-commerce)
  - [1.1 Determine Requirements](#11-determine-requirements)
    - [1.1.1 Actors](#111-actors)
    - [1.1.2 Functions with respect to actors](#112-functions-with-respect-to-actors)
    - [1.1.3 Use case Diagrams](#113-use-case-diagrams)
  - [1.2 Analyze Requirements](#12-analyze-requirements)
    - [1.2.1 Decompose the system in microservices with Django](#121-decompose-the-system-in-microservices-with-django)
    - [1.2.2 Classes with attributes of service models (models)](#122-classes-with-attributes-of-service-models-models)
    - [1.2.3 Determine functions in services (views)](#123-determine-functions-in-services-views)
    - [1.2.4 Determine templates](#124-determine-templates)
    - [1.2.5 Determine REST API connecting services](#125-determine-rest-api-connecting-services)
  - [1.3 Conclusion](#13-conclusion)
- [CHAPTER 2: DESIGN E-COMMERCE SYSTEM WITH MICROSERVICES AND DJANGO](#chapter-2-design-e-commerce-system-with-microservices-and-django)
  - [2.1 Design services/components](#21-design-servicescomponents)
  - [2.2 Design classes and methods in component](#22-design-classes-and-methods-in-component)
  - [2.3 Design API](#23-design-api)
  - [2.4 Conclusion](#24-conclusion)

# CHAPTER 1: REQUIREMENTS OF E-COMMERCE

## 1.1 Determine Requirements

### 1.1.1 Actors

Hệ thống Y tế có các tác nhân (actors) chính sau:

1. **Bệnh nhân (Patient)**
   - Người sử dụng dịch vụ y tế
   - Đặt lịch hẹn, xem hồ sơ y tế, nhận thông báo

2. **Bác sĩ (Doctor)**
   - Chuyên gia y tế cung cấp dịch vụ khám và điều trị
   - Quản lý lịch làm việc, khám bệnh, kê đơn thuốc

3. **Y tá (Nurse)**
   - Hỗ trợ bác sĩ và chăm sóc bệnh nhân
   - Ghi nhận dấu hiệu sinh tồn, hỗ trợ thủ thuật

4. **Dược sĩ (Pharmacist)**
   - Quản lý thuốc và cấp phát thuốc
   - Kiểm tra tương tác thuốc, chuẩn bị đơn thuốc

5. **Kỹ thuật viên xét nghiệm (Lab Technician)**
   - Thực hiện các xét nghiệm y tế
   - Ghi nhận và báo cáo kết quả xét nghiệm

6. **Nhân viên thanh toán (Billing Staff)**
   - Quản lý hóa đơn và thanh toán
   - Xử lý yêu cầu bảo hiểm

7. **Quản trị viên hệ thống (System Administrator)**
   - Quản lý người dùng và quyền truy cập
   - Cấu hình và bảo trì hệ thống

8. **Nhà cung cấp bảo hiểm (Insurance Provider)**
   - Xử lý yêu cầu bảo hiểm
   - Phê duyệt hoặc từ chối bảo hiểm

### 1.1.2 Functions with respect to actors

#### Bệnh nhân (Patient)

| Chức năng | Mô tả |
|-----------|-------|
| Đăng ký tài khoản | Tạo tài khoản mới trong hệ thống |
| Đăng nhập | Xác thực và truy cập vào hệ thống |
| Cập nhật thông tin cá nhân | Cập nhật thông tin liên hệ, địa chỉ, v.v. |
| Đặt lịch hẹn | Đặt lịch hẹn với bác sĩ |
| Hủy/Đổi lịch hẹn | Hủy hoặc thay đổi lịch hẹn đã đặt |
| Xem lịch hẹn | Xem danh sách các lịch hẹn |
| Xem hồ sơ y tế | Truy cập hồ sơ y tế cá nhân |
| Xem kết quả xét nghiệm | Xem kết quả các xét nghiệm đã thực hiện |
| Xem đơn thuốc | Xem danh sách đơn thuốc đã kê |
| Thanh toán hóa đơn | Thanh toán các hóa đơn y tế |
| Gửi yêu cầu bảo hiểm | Gửi yêu cầu bồi thường bảo hiểm |
| Nhận thông báo | Nhận thông báo về lịch hẹn, kết quả xét nghiệm, v.v. |
| Tương tác với ChatBot AI | Trao đổi với trợ lý AI để được hỗ trợ |
| Chat với bác sĩ | Trao đổi trực tiếp với bác sĩ qua tin nhắn |

#### Bác sĩ (Doctor)

| Chức năng | Mô tả |
|-----------|-------|
| Đăng nhập | Xác thực và truy cập vào hệ thống |
| Cập nhật thông tin cá nhân | Cập nhật thông tin liên hệ, chuyên môn, v.v. |
| Quản lý lịch làm việc | Thiết lập và cập nhật lịch làm việc |
| Xem lịch hẹn | Xem danh sách các lịch hẹn với bệnh nhân |
| Xác nhận/Hủy lịch hẹn | Xác nhận hoặc hủy lịch hẹn với bệnh nhân |
| Xem hồ sơ bệnh nhân | Truy cập hồ sơ y tế của bệnh nhân |
| Tạo/Cập nhật hồ sơ khám | Ghi nhận thông tin khám bệnh |
| Chẩn đoán bệnh | Ghi nhận chẩn đoán bệnh |
| Kê đơn thuốc | Tạo đơn thuốc cho bệnh nhân |
| Yêu cầu xét nghiệm | Yêu cầu thực hiện xét nghiệm cho bệnh nhân |
| Xem kết quả xét nghiệm | Xem kết quả xét nghiệm của bệnh nhân |
| Gửi thông báo | Gửi thông báo đến bệnh nhân |
| Chat với bệnh nhân | Trao đổi trực tiếp với bệnh nhân qua tin nhắn |

#### Y tá (Nurse)

| Chức năng | Mô tả |
|-----------|-------|
| Đăng nhập | Xác thực và truy cập vào hệ thống |
| Cập nhật thông tin cá nhân | Cập nhật thông tin liên hệ, v.v. |
| Xem lịch làm việc | Xem lịch làm việc của mình |
| Xem danh sách bệnh nhân | Xem danh sách bệnh nhân cần chăm sóc |
| Ghi nhận dấu hiệu sinh tồn | Ghi nhận các dấu hiệu sinh tồn của bệnh nhân |
| Hỗ trợ thủ thuật | Ghi nhận thông tin hỗ trợ thủ thuật |
| Xem hồ sơ bệnh nhân | Truy cập hồ sơ y tế của bệnh nhân |
| Cập nhật hồ sơ chăm sóc | Cập nhật thông tin chăm sóc bệnh nhân |
| Quản lý thuốc | Quản lý việc cấp phát thuốc cho bệnh nhân |
| Gửi thông báo | Gửi thông báo đến bệnh nhân hoặc bác sĩ |

#### Dược sĩ (Pharmacist)

| Chức năng | Mô tả |
|-----------|-------|
| Đăng nhập | Xác thực và truy cập vào hệ thống |
| Cập nhật thông tin cá nhân | Cập nhật thông tin liên hệ, v.v. |
| Xem đơn thuốc | Xem danh sách đơn thuốc cần chuẩn bị |
| Kiểm tra tương tác thuốc | Kiểm tra tương tác giữa các loại thuốc |
| Chuẩn bị đơn thuốc | Chuẩn bị thuốc theo đơn |
| Cấp phát thuốc | Ghi nhận việc cấp phát thuốc cho bệnh nhân |
| Quản lý tồn kho thuốc | Quản lý số lượng thuốc trong kho |
| Cập nhật thông tin thuốc | Cập nhật thông tin về các loại thuốc |
| Gửi thông báo | Gửi thông báo đến bệnh nhân hoặc bác sĩ |

#### Kỹ thuật viên xét nghiệm (Lab Technician)

| Chức năng | Mô tả |
|-----------|-------|
| Đăng nhập | Xác thực và truy cập vào hệ thống |
| Cập nhật thông tin cá nhân | Cập nhật thông tin liên hệ, v.v. |
| Xem yêu cầu xét nghiệm | Xem danh sách yêu cầu xét nghiệm |
| Thu thập mẫu xét nghiệm | Ghi nhận việc thu thập mẫu xét nghiệm |
| Thực hiện xét nghiệm | Thực hiện các xét nghiệm y tế |
| Ghi nhận kết quả xét nghiệm | Ghi nhận kết quả xét nghiệm |
| Báo cáo kết quả | Gửi báo cáo kết quả xét nghiệm |
| Quản lý mẫu xét nghiệm | Quản lý các mẫu xét nghiệm |
| Gửi thông báo | Gửi thông báo đến bệnh nhân hoặc bác sĩ |

#### Nhân viên thanh toán (Billing Staff)

| Chức năng | Mô tả |
|-----------|-------|
| Đăng nhập | Xác thực và truy cập vào hệ thống |
| Cập nhật thông tin cá nhân | Cập nhật thông tin liên hệ, v.v. |
| Tạo hóa đơn | Tạo hóa đơn cho dịch vụ y tế |
| Cập nhật hóa đơn | Cập nhật thông tin hóa đơn |
| Xử lý thanh toán | Xử lý các giao dịch thanh toán |
| Gửi yêu cầu bảo hiểm | Gửi yêu cầu bồi thường bảo hiểm |
| Theo dõi yêu cầu bảo hiểm | Theo dõi trạng thái yêu cầu bảo hiểm |
| Tạo báo cáo tài chính | Tạo các báo cáo tài chính |
| Gửi thông báo | Gửi thông báo đến bệnh nhân hoặc nhà cung cấp bảo hiểm |

#### Quản trị viên hệ thống (System Administrator)

| Chức năng | Mô tả |
|-----------|-------|
| Đăng nhập | Xác thực và truy cập vào hệ thống |
| Quản lý người dùng | Tạo, cập nhật, vô hiệu hóa tài khoản người dùng |
| Phân quyền | Phân quyền truy cập cho người dùng |
| Cấu hình hệ thống | Cấu hình các thông số của hệ thống |
| Giám sát hệ thống | Giám sát hoạt động của hệ thống |
| Sao lưu dữ liệu | Thực hiện sao lưu dữ liệu |
| Khôi phục dữ liệu | Khôi phục dữ liệu từ bản sao lưu |
| Quản lý logs | Quản lý nhật ký hoạt động hệ thống |
| Cập nhật hệ thống | Cập nhật phiên bản hệ thống |

#### Nhà cung cấp bảo hiểm (Insurance Provider)

| Chức năng | Mô tả |
|-----------|-------|
| Đăng nhập | Xác thực và truy cập vào hệ thống |
| Xem yêu cầu bảo hiểm | Xem danh sách yêu cầu bồi thường bảo hiểm |
| Xem thông tin bệnh nhân | Xem thông tin bệnh nhân liên quan đến yêu cầu |
| Xem hồ sơ y tế | Xem hồ sơ y tế liên quan đến yêu cầu |
| Phê duyệt/Từ chối yêu cầu | Phê duyệt hoặc từ chối yêu cầu bảo hiểm |
| Gửi thông báo | Gửi thông báo đến bệnh nhân hoặc nhân viên thanh toán |
| Tạo báo cáo | Tạo báo cáo về các yêu cầu bảo hiểm |

### 1.1.3 Use case Diagrams

Dưới đây là mô tả các use case diagram chính trong hệ thống:

#### Use Case Diagram cho Bệnh nhân

![Use Case Diagram cho Bệnh nhân](assets/diagrams/images/patient_usecase.png)

Use case diagram này mô tả các tương tác chính của bệnh nhân với hệ thống, bao gồm:
- Đăng ký và đăng nhập
- Quản lý thông tin cá nhân
- Đặt và quản lý lịch hẹn
- Xem hồ sơ y tế và kết quả xét nghiệm
- Thanh toán hóa đơn và gửi yêu cầu bảo hiểm
- Tương tác với ChatBot AI và chat với bác sĩ

#### Use Case Diagram cho Bác sĩ

![Use Case Diagram cho Bác sĩ](assets/diagrams/images/doctor_usecase.png)

Use case diagram này mô tả các tương tác chính của bác sĩ với hệ thống, bao gồm:
- Đăng nhập và quản lý thông tin cá nhân
- Quản lý lịch làm việc và lịch hẹn
- Xem và cập nhật hồ sơ bệnh nhân
- Chẩn đoán bệnh và kê đơn thuốc
- Yêu cầu xét nghiệm và xem kết quả
- Chat với bệnh nhân

#### Use Case Diagram cho Dược sĩ

![Use Case Diagram cho Dược sĩ](assets/diagrams/images/pharmacist_usecase.png)

Use case diagram này mô tả các tương tác chính của dược sĩ với hệ thống, bao gồm:
- Đăng nhập và quản lý thông tin cá nhân
- Xem và xử lý đơn thuốc
- Kiểm tra tương tác thuốc
- Quản lý tồn kho thuốc
- Cấp phát thuốc cho bệnh nhân

#### Use Case Diagram cho Kỹ thuật viên xét nghiệm

![Use Case Diagram cho Kỹ thuật viên xét nghiệm](assets/diagrams/images/lab_tech_usecase.png)

Use case diagram này mô tả các tương tác chính của kỹ thuật viên xét nghiệm với hệ thống, bao gồm:
- Đăng nhập và quản lý thông tin cá nhân
- Xem và xử lý yêu cầu xét nghiệm
- Thu thập mẫu và thực hiện xét nghiệm
- Ghi nhận và báo cáo kết quả xét nghiệm

## 1.2 Analyze Requirements

### 1.2.1 Decompose the system in microservices with Django

Hệ thống Y tế được thiết kế theo kiến trúc microservices, cho phép phát triển, triển khai và mở rộng độc lập các thành phần khác nhau của hệ thống. Mỗi microservice đảm nhận một chức năng nghiệp vụ cụ thể và có thể hoạt động độc lập, đồng thời tích hợp liền mạch với các service khác thông qua API. Django, một framework Python mạnh mẽ, được chọn làm nền tảng chính cho việc phát triển các microservices này.

#### Nguyên tắc phân rã

Việc phân rã hệ thống thành các microservices tuân theo các nguyên tắc sau:

1. **Tách biệt theo chức năng nghiệp vụ**: Mỗi microservice đại diện cho một lĩnh vực nghiệp vụ cụ thể và rõ ràng.
2. **Tính độc lập**: Mỗi microservice có thể được phát triển, triển khai và mở rộng độc lập.
3. **Sở hữu dữ liệu**: Mỗi microservice sở hữu và quản lý cơ sở dữ liệu riêng của mình.
4. **Giao tiếp qua API**: Các microservices giao tiếp với nhau thông qua API được định nghĩa rõ ràng.
5. **Khả năng mở rộng**: Mỗi microservice có thể được mở rộng độc lập dựa trên nhu cầu tài nguyên và tải.

#### Cấu trúc microservices

Hệ thống Y tế được phân rã thành 8 microservices chính, mỗi service được xây dựng bằng Django và Django REST Framework:

##### 1. User Service

**Mô tả**: Quản lý tất cả thông tin liên quan đến người dùng, xác thực và phân quyền.

**Thành phần chính**:
- **Models**: User, Profile (PatientProfile, DoctorProfile, NurseProfile, PharmacistProfile, LabTechProfile), Address, UserActivity
- **APIs**: Đăng ký, đăng nhập, quản lý hồ sơ, quản lý quyền
- **Database**: PostgreSQL riêng cho dữ liệu người dùng

**Công nghệ**:
- Django & Django REST Framework
- JWT cho xác thực
- PostgreSQL cho lưu trữ dữ liệu

##### 2. Medical Record Service

**Mô tả**: Quản lý hồ sơ y tế của bệnh nhân, bao gồm lịch sử khám bệnh, chẩn đoán, và điều trị.

**Thành phần chính**:
- **Models**: MedicalRecord, Encounter, Diagnosis, Treatment, Allergy, Immunization, MedicalHistory, Medication, VitalSign
- **APIs**: CRUD cho hồ sơ y tế, tìm kiếm và truy vấn hồ sơ
- **Database**: PostgreSQL riêng cho dữ liệu hồ sơ y tế

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Redis cho caching

##### 3. Appointment Service

**Mô tả**: Quản lý lịch hẹn giữa bệnh nhân và bác sĩ.

**Thành phần chính**:
- **Models**: DoctorAvailability, TimeSlot, Appointment, AppointmentReason, AppointmentReminder
- **APIs**: Đặt lịch, hủy lịch, tìm kiếm lịch trống
- **Database**: PostgreSQL riêng cho dữ liệu lịch hẹn

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Celery cho xử lý tác vụ nền (nhắc nhở lịch hẹn)

##### 4. Pharmacy Service

**Mô tả**: Quản lý thuốc, đơn thuốc, và cấp phát thuốc.

**Thành phần chính**:
- **Models**: Medication, Prescription, PrescriptionItem, Inventory, Dispensing, DispensingItem
- **APIs**: Kê đơn, xác minh đơn, cấp phát thuốc, quản lý tồn kho
- **Database**: PostgreSQL riêng cho dữ liệu dược phẩm

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Redis cho caching

##### 5. Laboratory Service

**Mô tả**: Quản lý xét nghiệm, mẫu xét nghiệm, và kết quả xét nghiệm.

**Thành phần chính**:
- **Models**: TestType, LabTest, SampleCollection, TestResult, TestParameter, ParameterResult
- **APIs**: Yêu cầu xét nghiệm, ghi nhận kết quả, truy vấn kết quả
- **Database**: PostgreSQL riêng cho dữ liệu xét nghiệm

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Celery cho xử lý tác vụ nền

##### 6. Billing Service

**Mô tả**: Quản lý hóa đơn, thanh toán, và yêu cầu bảo hiểm.

**Thành phần chính**:
- **Models**: Invoice, InvoiceItem, Payment, InsuranceClaim, InsuranceProvider, PriceList
- **APIs**: Tạo hóa đơn, xử lý thanh toán, quản lý yêu cầu bảo hiểm
- **Database**: PostgreSQL riêng cho dữ liệu thanh toán

**Công nghệ**:
- Django & Django REST Framework
- PostgreSQL cho lưu trữ dữ liệu
- Celery cho xử lý tác vụ nền (thanh toán, yêu cầu bảo hiểm)

##### 7. Notification Service

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

##### 8. AI ChatBot Service

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

#### Thư viện chung (Common Libraries)

Để tránh lặp lại mã nguồn và đảm bảo tính nhất quán giữa các microservices, một số thư viện chung được phát triển:

##### Common Auth Library

**Mô tả**: Cung cấp các chức năng xác thực và phân quyền chung cho tất cả các microservices.

**Thành phần chính**:
- JWT Authentication
- Permission classes
- User context

##### Common Utils Library

**Mô tả**: Cung cấp các tiện ích chung cho tất cả các microservices.

**Thành phần chính**:
- Logging
- Error handling
- Date/time utilities
- Pagination

#### API Gateway

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

#### Giao tiếp giữa các Microservices

Các microservices giao tiếp với nhau thông qua các cơ chế sau:

1. **REST API**: Giao tiếp đồng bộ giữa các services thông qua HTTP/HTTPS.
2. **Event-driven**: Giao tiếp bất đồng bộ thông qua Celery và Redis.
3. **WebSocket**: Giao tiếp thời gian thực cho các tính năng như thông báo và trò chuyện.

### 1.2.2 Classes with attributes of service models (models)

Phần này mô tả chi tiết các lớp và thuộc tính của các models trong từng service.

#### User Service Models

##### User

```python
class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=[
        ('ADMIN', 'Administrator'),
        ('DOCTOR', 'Doctor'),
        ('NURSE', 'Nurse'),
        ('PATIENT', 'Patient'),
        ('PHARMACIST', 'Pharmacist'),
        ('LAB_TECH', 'Lab Technician'),
        ('INSURANCE', 'Insurance Provider')
    ])
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']
```

##### PatientProfile

```python
class PatientProfile(Profile):
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other')
    ])
    blood_type = models.CharField(max_length=10, choices=[
        ('A_POSITIVE', 'A+'),
        ('A_NEGATIVE', 'A-'),
        ('B_POSITIVE', 'B+'),
        ('B_NEGATIVE', 'B-'),
        ('AB_POSITIVE', 'AB+'),
        ('AB_NEGATIVE', 'AB-'),
        ('O_POSITIVE', 'O+'),
        ('O_NEGATIVE', 'O-')
    ], null=True, blank=True)
    height = models.FloatField(null=True, blank=True)  # in cm
    weight = models.FloatField(null=True, blank=True)  # in kg
    allergies = models.TextField(null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=200, null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, null=True, blank=True)
```

##### DoctorProfile

```python
class DoctorProfile(Profile):
    specialty = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50, unique=True)
    years_of_experience = models.PositiveIntegerField()
    education = models.TextField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
```

#### Medical Record Service Models

##### MedicalRecord

```python
class MedicalRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=[
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('ARCHIVED', 'Archived')
    ], default='ACTIVE')
    notes = models.TextField(null=True, blank=True)
```

##### Encounter

```python
class Encounter(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='encounters')
    doctor_id = models.UUIDField()
    encounter_date = models.DateTimeField()
    encounter_type = models.CharField(max_length=50, choices=[
        ('INITIAL_VISIT', 'Initial Visit'),
        ('FOLLOW_UP', 'Follow Up'),
        ('EMERGENCY', 'Emergency'),
        ('ROUTINE_CHECKUP', 'Routine Checkup'),
        ('SPECIALIST_CONSULTATION', 'Specialist Consultation'),
        ('TELEMEDICINE', 'Telemedicine')
    ])
    reason = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=[
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('NO_SHOW', 'No Show')
    ])
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

##### Diagnosis

```python
class Diagnosis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='diagnoses')
    diagnosis_code = models.CharField(max_length=20)  # ICD-10 code
    diagnosis_name = models.CharField(max_length=255)
    diagnosis_date = models.DateTimeField()
    diagnosed_by = models.UUIDField()  # Doctor ID
    severity = models.CharField(max_length=20, choices=[
        ('MILD', 'Mild'),
        ('MODERATE', 'Moderate'),
        ('SEVERE', 'Severe'),
        ('LIFE_THREATENING', 'Life Threatening')
    ], null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Appointment Service Models

##### DoctorAvailability

```python
class DoctorAvailability(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor_id = models.UUIDField()
    day_of_week = models.PositiveSmallIntegerField()  # 0=Monday, 6=Sunday
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    effective_from = models.DateField(null=True, blank=True)
    effective_to = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

##### Appointment

```python
class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.UUIDField()
    doctor_id = models.UUIDField()
    time_slot = models.OneToOneField(TimeSlot, on_delete=models.CASCADE, related_name='appointment')
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=[
        ('SCHEDULED', 'Scheduled'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
        ('NO_SHOW', 'No Show')
    ], default='SCHEDULED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_reason = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
```

#### Pharmacy Service Models

##### Medication

```python
class Medication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    generic_name = models.CharField(max_length=255)
    description = models.TextField()
    dosage_form = models.CharField(max_length=50, choices=[
        ('TABLET', 'Tablet'),
        ('CAPSULE', 'Capsule'),
        ('LIQUID', 'Liquid'),
        ('INJECTION', 'Injection'),
        ('CREAM', 'Cream'),
        ('OINTMENT', 'Ointment'),
        ('PATCH', 'Patch'),
        ('INHALER', 'Inhaler'),
        ('OTHER', 'Other')
    ])
    strength = models.CharField(max_length=50)  # e.g., "500mg", "10mg/ml"
    manufacturer = models.CharField(max_length=255)
    requires_prescription = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

##### Prescription

```python
class Prescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.UUIDField()
    doctor_id = models.UUIDField()
    encounter_id = models.UUIDField(null=True, blank=True)  # Optional link to encounter
    prescription_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
        ('DISPENSED', 'Dispensed'),
        ('CANCELLED', 'Cancelled')
    ], default='PENDING')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expiry_date = models.DateField()
    is_refillable = models.BooleanField(default=False)
    refills_remaining = models.PositiveSmallIntegerField(default=0)
```

#### Laboratory Service Models

##### LabTest

```python
class LabTest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.UUIDField()
    doctor_id = models.UUIDField()  # Ordering doctor
    test_type = models.ForeignKey(TestType, on_delete=models.PROTECT, related_name='lab_tests')
    ordered_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[
        ('ORDERED', 'Ordered'),
        ('SAMPLE_COLLECTED', 'Sample Collected'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled')
    ], default='ORDERED')
    priority = models.CharField(max_length=20, choices=[
        ('ROUTINE', 'Routine'),
        ('URGENT', 'Urgent'),
        ('STAT', 'STAT')
    ], default='ROUTINE')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

##### TestResult

```python
class TestResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lab_test = models.OneToOneField(LabTest, on_delete=models.CASCADE, related_name='result')
    result_date = models.DateTimeField()
    performed_by = models.UUIDField()  # Lab technician ID
    verified_by = models.UUIDField(null=True, blank=True)  # Doctor or lab supervisor ID
    interpretation = models.TextField(null=True, blank=True)
    is_abnormal = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Billing Service Models

##### Invoice

```python
class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.UUIDField()
    invoice_number = models.CharField(max_length=50, unique=True)
    invoice_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('DRAFT', 'Draft'),
        ('ISSUED', 'Issued'),
        ('PAID', 'Paid'),
        ('PARTIALLY_PAID', 'Partially Paid'),
        ('OVERDUE', 'Overdue'),
        ('CANCELLED', 'Cancelled')
    ], default='DRAFT')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

##### Payment

```python
class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    payment_date = models.DateTimeField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=[
        ('CASH', 'Cash'),
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('INSURANCE', 'Insurance'),
        ('OTHER', 'Other')
    ])
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded')
    ], default='PENDING')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Notification Service Models

##### NotificationTemplate

```python
class NotificationTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=[
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push Notification'),
        ('IN_APP', 'In-App Notification')
    ])
    subject = models.CharField(max_length=255, null=True, blank=True)  # For email
    content = models.TextField()
    variables = models.JSONField(default=list)  # List of variables used in template
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

##### NotificationLog

```python
class NotificationLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_id = models.UUIDField()
    template = models.ForeignKey(NotificationTemplate, on_delete=models.PROTECT, related_name='logs')
    type = models.CharField(max_length=20, choices=[
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push Notification'),
        ('IN_APP', 'In-App Notification')
    ])
    content = models.TextField()  # Rendered content
    data = models.JSONField(null=True, blank=True)  # Data used for rendering
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('READ', 'Read'),
        ('FAILED', 'Failed')
    ], default='PENDING')
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### AI ChatBot Service Models

##### Conversation

```python
class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, null=True, blank=True)
    type = models.CharField(max_length=20, choices=[
        ('AI_ASSISTANT', 'AI Assistant'),
        ('DOCTOR_PATIENT', 'Doctor-Patient Chat')
    ])
    status = models.CharField(max_length=20, choices=[
        ('ACTIVE', 'Active'),
        ('ARCHIVED', 'Archived'),
        ('DELETED', 'Deleted')
    ], default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
```

##### Message

```python
class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender_id = models.UUIDField()
    sender_type = models.CharField(max_length=20, choices=[
        ('USER', 'User'),
        ('AI', 'AI Assistant'),
        ('SYSTEM', 'System')
    ])
    content = models.TextField()
    content_type = models.CharField(max_length=20, choices=[
        ('TEXT', 'Text'),
        ('IMAGE', 'Image'),
        ('FILE', 'File'),
        ('AUDIO', 'Audio')
    ], default='TEXT')
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
```

### 1.2.3 Determine functions in services (views)

Phần này mô tả chi tiết các chức năng (functions) trong các views của từng service.

#### User Service Views

##### UserViewSet

```python
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['email', 'first_name', 'last_name']
    filterset_fields = ['role', 'is_active']

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdmin()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrOwner()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        # List all users (admin) or just the current user (non-admin)
        if not request.user.is_staff and not request.user.role == 'ADMIN':
            self.queryset = User.objects.filter(id=request.user.id)
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        # Retrieve user details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new user (admin only)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update user details (admin or owner)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        # Soft delete user (admin only)
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def me(self, request):
        # Get current user's details
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        # Change user's password
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'old_password': ['Wrong password.']}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'status': 'password set'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

##### AuthView

```python
class AuthView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=LoginSerializer)
    def post(self, request):
        # Login user and return JWT token
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)

            # Log user activity
            UserActivity.objects.create(
                user=user,
                activity_type='LOGIN',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    @swagger_auto_schema(request_body=RefreshTokenSerializer)
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        # Refresh JWT token
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            refresh = RefreshToken(serializer.validated_data['refresh'])
            return Response({
                'access': str(refresh.access_token)
            })
        except TokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        # Logout user
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()

            # Log user activity if authenticated
            if request.user.is_authenticated:
                UserActivity.objects.create(
                    user=request.user,
                    activity_type='LOGOUT',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
```

#### Medical Record Service Views

##### MedicalRecordViewSet

```python
class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated, HasMedicalRecordAccess]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient_id', 'status']

    def get_queryset(self):
        # Filter medical records based on user role
        user = self.request.user
        if user.role == 'ADMIN':
            return MedicalRecord.objects.all()
        elif user.role == 'DOCTOR':
            # Doctors can see medical records of patients they have encounters with
            return MedicalRecord.objects.filter(encounters__doctor_id=user.id).distinct()
        elif user.role == 'PATIENT':
            # Patients can only see their own medical records
            return MedicalRecord.objects.filter(patient_id=user.id)
        return MedicalRecord.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # Retrieve medical record details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new medical record
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update medical record
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def encounters(self, request, pk=None):
        # Get medical record's encounters
        medical_record = self.get_object()
        encounters = medical_record.get_encounters()
        serializer = EncounterSerializer(encounters, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def allergies(self, request, pk=None):
        # Get medical record's allergies
        medical_record = self.get_object()
        allergies = medical_record.get_allergies()
        serializer = AllergySerializer(allergies, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def immunizations(self, request, pk=None):
        # Get medical record's immunizations
        medical_record = self.get_object()
        immunizations = medical_record.get_immunizations()
        serializer = ImmunizationSerializer(immunizations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def medications(self, request, pk=None):
        # Get medical record's medications
        medical_record = self.get_object()
        medications = medical_record.get_medications()
        serializer = MedicationSerializer(medications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def lab_tests(self, request, pk=None):
        # Get medical record's lab tests
        medical_record = self.get_object()
        lab_tests = medical_record.get_lab_tests()
        serializer = LabTestSerializer(lab_tests, many=True)
        return Response(serializer.data)
```

#### Appointment Service Views

##### DoctorAvailabilityViewSet

```python
class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = DoctorAvailability.objects.all()
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['doctor_id', 'day_of_week', 'is_active']

    def get_queryset(self):
        # Filter availabilities based on user role
        user = self.request.user
        if user.role == 'ADMIN':
            return DoctorAvailability.objects.all()
        elif user.role == 'DOCTOR':
            # Doctors can see their own availabilities
            return DoctorAvailability.objects.filter(doctor_id=user.id)
        elif user.role == 'PATIENT':
            # Patients can see all active doctor availabilities
            return DoctorAvailability.objects.filter(is_active=True)
        return DoctorAvailability.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # Retrieve availability details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new availability
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update availability
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_doctor(self, request):
        # Get availabilities for a specific doctor
        doctor_id = request.query_params.get('doctor_id')
        if not doctor_id:
            return Response({'error': 'doctor_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        availabilities = DoctorAvailability.objects.filter(doctor_id=doctor_id, is_active=True)
        serializer = self.get_serializer(availabilities, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def time_slots(self, request, pk=None):
        # Generate time slots for a specific date based on this availability
        availability = self.get_object()
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'date is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)

        slots = availability.generate_time_slots(date)
        serializer = TimeSlotSerializer(slots, many=True)
        return Response(serializer.data)
```

##### AppointmentViewSet

```python
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, HasAppointmentAccess]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient_id', 'doctor_id', 'appointment_date', 'status']

    def get_queryset(self):
        # Filter appointments based on user role
        user = self.request.user
        if user.role == 'ADMIN':
            return Appointment.objects.all()
        elif user.role == 'DOCTOR':
            # Doctors can see appointments they are involved in
            return Appointment.objects.filter(doctor_id=user.id)
        elif user.role == 'PATIENT':
            # Patients can see their own appointments
            return Appointment.objects.filter(patient_id=user.id)
        return Appointment.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # Retrieve appointment details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new appointment
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Check if the time slot is available
        time_slot_id = serializer.validated_data.get('time_slot').id
        time_slot = TimeSlot.objects.get(id=time_slot_id)

        if not time_slot.is_available():
            return Response({'error': 'Time slot is not available'}, status=status.HTTP_400_BAD_REQUEST)

        # Book the time slot
        time_slot.book()

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        # Create appointment reason if provided
        reason_data = request.data.get('reason')
        if reason_data:
            reason_data['appointment'] = serializer.instance.id
            reason_serializer = AppointmentReasonSerializer(data=reason_data)
            if reason_serializer.is_valid():
                reason_serializer.save()

        # Schedule reminders
        appointment = serializer.instance
        self._schedule_reminders(appointment)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update appointment
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        # Cancel appointment
        appointment = self.get_object()
        reason = request.data.get('reason')

        if appointment.cancel(reason):
            return Response({'status': 'appointment cancelled'}, status=status.HTTP_200_OK)
        return Response({'error': 'Cannot cancel appointment'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        # Reschedule appointment
        appointment = self.get_object()
        time_slot_id = request.data.get('time_slot_id')

        if not time_slot_id:
            return Response({'error': 'time_slot_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_slot = TimeSlot.objects.get(id=time_slot_id)
        except TimeSlot.DoesNotExist:
            return Response({'error': 'Time slot not found'}, status=status.HTTP_404_NOT_FOUND)

        if appointment.reschedule(new_slot):
            # Update reminders
            self._update_reminders(appointment)

            return Response({'status': 'appointment rescheduled'}, status=status.HTTP_200_OK)
        return Response({'error': 'Cannot reschedule appointment'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        # Mark appointment as completed
        appointment = self.get_object()

        if appointment.complete():
            return Response({'status': 'appointment completed'}, status=status.HTTP_200_OK)
        return Response({'error': 'Cannot complete appointment'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def no_show(self, request, pk=None):
        # Mark appointment as no-show
        appointment = self.get_object()

        if appointment.no_show():
            return Response({'status': 'appointment marked as no-show'}, status=status.HTTP_200_OK)
        return Response({'error': 'Cannot mark appointment as no-show'}, status=status.HTTP_400_BAD_REQUEST)

    def _schedule_reminders(self, appointment):
        # Schedule reminders for the appointment
        # 1 day before
        reminder_date = appointment.appointment_date - timedelta(days=1)
        reminder_time = datetime.combine(reminder_date, time(hour=10, minute=0))
        AppointmentReminder.objects.create(
            appointment=appointment,
            reminder_type='EMAIL',
            scheduled_time=reminder_time
        )

        # 1 hour before
        reminder_datetime = datetime.combine(appointment.appointment_date, appointment.start_time) - timedelta(hours=1)
        AppointmentReminder.objects.create(
            appointment=appointment,
            reminder_type='SMS',
            scheduled_time=reminder_datetime
        )

    def _update_reminders(self, appointment):
        # Update existing reminders for the appointment
        appointment.reminders.all().delete()
        self._schedule_reminders(appointment)
```

### 1.2.4 Determine templates

Phần này mô tả các templates sử dụng trong hệ thống. Với kiến trúc microservices, các templates chủ yếu được sử dụng cho email, SMS, và thông báo.

#### Email Templates

##### User Registration Email

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Healthcare System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4285f4;
            color: white;
            padding: 10px 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
            background-color: #f9f9f9;
        }
        .button {
            display: inline-block;
            background-color: #4285f4;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Healthcare System</h1>
        </div>
        <div class="content">
            <p>Hello {{ user.first_name }},</p>
            <p>Thank you for registering with our Healthcare System. Your account has been created successfully.</p>
            <p>Here are your account details:</p>
            <ul>
                <li><strong>Email:</strong> {{ user.email }}</li>
                <li><strong>Role:</strong> {{ user.role }}</li>
            </ul>
            <p>Please click the button below to verify your email address and activate your account:</p>
            <a href="{{ verification_url }}" class="button">Verify Email</a>
            <p>If you did not create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ current_year }} Healthcare System. All rights reserved.</p>
            <p>123 Medical Center Drive, Healthcare City</p>
        </div>
    </div>
</body>
</html>
```

##### Appointment Confirmation Email

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Appointment Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4285f4;
            color: white;
            padding: 10px 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
            background-color: #f9f9f9;
        }
        .appointment-details {
            background-color: white;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border-left: 4px solid #4285f4;
        }
        .button {
            display: inline-block;
            background-color: #4285f4;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Appointment Confirmation</h1>
        </div>
        <div class="content">
            <p>Hello {{ patient.first_name }},</p>
            <p>Your appointment has been confirmed. Here are the details:</p>
            <div class="appointment-details">
                <p><strong>Doctor:</strong> Dr. {{ doctor.first_name }} {{ doctor.last_name }}</p>
                <p><strong>Date:</strong> {{ appointment.appointment_date|date:"l, F j, Y" }}</p>
                <p><strong>Time:</strong> {{ appointment.start_time|time:"g:i A" }} - {{ appointment.end_time|time:"g:i A" }}</p>
                <p><strong>Location:</strong> Main Medical Center, Room {{ doctor.room_number }}</p>
                {% if appointment.reason %}
                <p><strong>Reason:</strong> {{ appointment.reason.reason }}</p>
                {% endif %}
            </div>
            <p>Please arrive 15 minutes before your scheduled appointment time to complete any necessary paperwork.</p>
            <p>If you need to reschedule or cancel your appointment, please click the button below:</p>
            <a href="{{ manage_appointment_url }}" class="button">Manage Appointment</a>
        </div>
        <div class="footer">
            <p>&copy; {{ current_year }} Healthcare System. All rights reserved.</p>
            <p>123 Medical Center Drive, Healthcare City</p>
            <p>Phone: (123) 456-7890</p>
        </div>
    </div>
</body>
</html>
```

#### SMS Templates

##### Appointment Reminder SMS

```
Reminder: You have an appointment with Dr. {{ doctor.last_name }} tomorrow at {{ appointment.start_time|time:"g:i A" }}. Reply Y to confirm or call (123) 456-7890 to reschedule.
```

##### Prescription Ready SMS

```
Your prescription is ready for pickup at the pharmacy. Prescription #{{ prescription.id }}. The pharmacy is open from 8:00 AM to 6:00 PM.
```

#### Notification Templates

##### In-App Appointment Notification

```json
{
  "title": "Upcoming Appointment",
  "message": "You have an appointment with Dr. {{ doctor.last_name }} on {{ appointment.appointment_date|date:"F j" }} at {{ appointment.start_time|time:"g:i A" }}.",
  "action_url": "/appointments/{{ appointment.id }}",
  "icon": "calendar"
}
```

##### In-App Lab Results Notification

```json
{
  "title": "Lab Results Available",
  "message": "Your {{ lab_test.test_type }} results are now available.",
  "action_url": "/medical-records/lab-tests/{{ lab_test.id }}",
  "icon": "lab"
}
```

### 1.2.5 Determine REST API connecting services

Phần này mô tả các REST API được sử dụng để kết nối các microservices với nhau.

#### User Service API

##### Authentication API

```yaml
openapi: 3.0.0
info:
  title: User Service Authentication API
  version: 1.0.0
  description: API for user authentication and authorization
paths:
  /api/auth/login:
    post:
      summary: Login user
      description: Authenticate user and return JWT token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
              required:
                - email
                - password
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  refresh:
                    type: string
                  access:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
        '401':
          description: Invalid credentials

  /api/auth/refresh:
    post:
      summary: Refresh token
      description: Refresh JWT token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                refresh:
                  type: string
              required:
                - refresh
      responses:
        '200':
          description: Token refreshed
          content:
            application/json:
              schema:
                type: object
                properties:
                  access:
                    type: string
        '401':
          description: Invalid token

  /api/auth/logout:
    post:
      summary: Logout user
      description: Logout user and blacklist refresh token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                refresh:
                  type: string
              required:
                - refresh
      responses:
        '205':
          description: Logout successful
        '400':
          description: Invalid request

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        first_name:
          type: string
        last_name:
          type: string
        role:
          type: string
          enum: [ADMIN, DOCTOR, NURSE, PATIENT, PHARMACIST, LAB_TECH, INSURANCE]
```

##### User API

```yaml
openapi: 3.0.0
info:
  title: User Service API
  version: 1.0.0
  description: API for user management
paths:
  /api/users:
    get:
      summary: List users
      description: Get a list of users
      parameters:
        - name: role
          in: query
          schema:
            type: string
        - name: is_active
          in: query
          schema:
            type: boolean
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: Create user
      description: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /api/users/{id}:
    get:
      summary: Get user
      description: Get user details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: User details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found
    put:
      summary: Update user
      description: Update user details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdate'
      responses:
        '200':
          description: User updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found
    delete:
      summary: Delete user
      description: Soft delete user
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: User deleted
        '404':
          description: User not found

  /api/users/me:
    get:
      summary: Get current user
      description: Get current user details
      responses:
        '200':
          description: Current user details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /api/users/change-password:
    post:
      summary: Change password
      description: Change user's password
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                old_password:
                  type: string
                  format: password
                new_password:
                  type: string
                  format: password
              required:
                - old_password
                - new_password
      responses:
        '200':
          description: Password changed
        '400':
          description: Invalid request

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        first_name:
          type: string
        last_name:
          type: string
        role:
          type: string
          enum: [ADMIN, DOCTOR, NURSE, PATIENT, PHARMACIST, LAB_TECH, INSURANCE]
        is_active:
          type: boolean
        date_joined:
          type: string
          format: date-time
        last_login:
          type: string
          format: date-time

    UserCreate:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
        first_name:
          type: string
        last_name:
          type: string
        role:
          type: string
          enum: [ADMIN, DOCTOR, NURSE, PATIENT, PHARMACIST, LAB_TECH, INSURANCE]
      required:
        - email
        - password
        - first_name
        - last_name
        - role

    UserUpdate:
      type: object
      properties:
        email:
          type: string
          format: email
        first_name:
          type: string
        last_name:
          type: string
        is_active:
          type: boolean
```

#### Medical Record Service API

```yaml
openapi: 3.0.0
info:
  title: Medical Record Service API
  version: 1.0.0
  description: API for medical record management
paths:
  /api/medical-records:
    get:
      summary: List medical records
      description: Get a list of medical records
      parameters:
        - name: patient_id
          in: query
          schema:
            type: string
            format: uuid
        - name: status
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of medical records
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/MedicalRecord'
    post:
      summary: Create medical record
      description: Create a new medical record
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MedicalRecordCreate'
      responses:
        '201':
          description: Medical record created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MedicalRecord'

  /api/medical-records/{id}:
    get:
      summary: Get medical record
      description: Get medical record details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Medical record details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MedicalRecord'
        '404':
          description: Medical record not found
    put:
      summary: Update medical record
      description: Update medical record details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MedicalRecordUpdate'
      responses:
        '200':
          description: Medical record updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MedicalRecord'
        '404':
          description: Medical record not found

  /api/medical-records/{id}/encounters:
    get:
      summary: Get medical record encounters
      description: Get encounters for a medical record
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of encounters
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Encounter'

  /api/medical-records/{id}/allergies:
    get:
      summary: Get medical record allergies
      description: Get allergies for a medical record
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of allergies
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Allergy'

  /api/medical-records/{id}/medications:
    get:
      summary: Get medical record medications
      description: Get medications for a medical record
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of medications
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Medication'

components:
  schemas:
    MedicalRecord:
      type: object
      properties:
        id:
          type: string
          format: uuid
        patient_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [ACTIVE, INACTIVE, ARCHIVED]
        notes:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    MedicalRecordCreate:
      type: object
      properties:
        patient_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [ACTIVE, INACTIVE, ARCHIVED]
        notes:
          type: string
      required:
        - patient_id

    MedicalRecordUpdate:
      type: object
      properties:
        status:
          type: string
          enum: [ACTIVE, INACTIVE, ARCHIVED]
        notes:
          type: string

    Encounter:
      type: object
      properties:
        id:
          type: string
          format: uuid
        medical_record:
          type: string
          format: uuid
        doctor_id:
          type: string
          format: uuid
        encounter_date:
          type: string
          format: date-time
        encounter_type:
          type: string
        reason:
          type: string
        status:
          type: string
        notes:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Allergy:
      type: object
      properties:
        id:
          type: string
          format: uuid
        medical_record:
          type: string
          format: uuid
        allergen:
          type: string
        reaction:
          type: string
        severity:
          type: string
        diagnosed_date:
          type: string
          format: date
        notes:
          type: string

    Medication:
      type: object
      properties:
        id:
          type: string
          format: uuid
        medical_record:
          type: string
          format: uuid
        name:
          type: string
        dosage:
          type: string
        frequency:
          type: string
        prescribed_by:
          type: string
          format: uuid
        prescribed_date:
          type: string
          format: date
        start_date:
          type: string
          format: date
        end_date:
          type: string
          format: date
        is_current:
          type: boolean
        notes:
          type: string
```

#### Appointment Service API

```yaml
openapi: 3.0.0
info:
  title: Appointment Service API
  version: 1.0.0
  description: API for appointment management
paths:
  /api/appointments:
    get:
      summary: List appointments
      description: Get a list of appointments
      parameters:
        - name: patient_id
          in: query
          schema:
            type: string
            format: uuid
        - name: doctor_id
          in: query
          schema:
            type: string
            format: uuid
        - name: appointment_date
          in: query
          schema:
            type: string
            format: date
        - name: status
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of appointments
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Appointment'
    post:
      summary: Create appointment
      description: Create a new appointment
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AppointmentCreate'
      responses:
        '201':
          description: Appointment created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Appointment'

  /api/appointments/{id}:
    get:
      summary: Get appointment
      description: Get appointment details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Appointment details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Appointment'
        '404':
          description: Appointment not found
    put:
      summary: Update appointment
      description: Update appointment details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AppointmentUpdate'
      responses:
        '200':
          description: Appointment updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Appointment'
        '404':
          description: Appointment not found

  /api/appointments/{id}/cancel:
    post:
      summary: Cancel appointment
      description: Cancel an appointment
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                reason:
                  type: string
      responses:
        '200':
          description: Appointment cancelled
        '400':
          description: Cannot cancel appointment
        '404':
          description: Appointment not found

  /api/appointments/{id}/reschedule:
    post:
      summary: Reschedule appointment
      description: Reschedule an appointment
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                time_slot_id:
                  type: string
                  format: uuid
              required:
                - time_slot_id
      responses:
        '200':
          description: Appointment rescheduled
        '400':
          description: Cannot reschedule appointment
        '404':
          description: Appointment not found

  /api/doctor-availability:
    get:
      summary: List doctor availabilities
      description: Get a list of doctor availabilities
      parameters:
        - name: doctor_id
          in: query
          schema:
            type: string
            format: uuid
        - name: day_of_week
          in: query
          schema:
            type: integer
        - name: is_active
          in: query
          schema:
            type: boolean
      responses:
        '200':
          description: List of doctor availabilities
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/DoctorAvailability'

  /api/doctor-availability/by-doctor:
    get:
      summary: Get doctor availabilities by doctor
      description: Get availabilities for a specific doctor
      parameters:
        - name: doctor_id
          in: query
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of doctor availabilities
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/DoctorAvailability'
        '400':
          description: doctor_id is required

  /api/doctor-availability/{id}/time-slots:
    get:
      summary: Get time slots for availability
      description: Generate time slots for a specific date based on this availability
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: date
          in: query
          required: true
          schema:
            type: string
            format: date
      responses:
        '200':
          description: List of time slots
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/TimeSlot'
        '400':
          description: date is required or invalid date format

components:
  schemas:
    Appointment:
      type: object
      properties:
        id:
          type: string
          format: uuid
        patient_id:
          type: string
          format: uuid
        doctor_id:
          type: string
          format: uuid
        time_slot:
          type: string
          format: uuid
        appointment_date:
          type: string
          format: date
        start_time:
          type: string
          format: time
        end_time:
          type: string
          format: time
        status:
          type: string
          enum: [SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW]
        cancelled_reason:
          type: string
        notes:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        reason:
          $ref: '#/components/schemas/AppointmentReason'

    AppointmentCreate:
      type: object
      properties:
        patient_id:
          type: string
          format: uuid
        doctor_id:
          type: string
          format: uuid
        time_slot:
          type: string
          format: uuid
        appointment_date:
          type: string
          format: date
        start_time:
          type: string
          format: time
        end_time:
          type: string
          format: time
        notes:
          type: string
        reason:
          $ref: '#/components/schemas/AppointmentReasonCreate'
      required:
        - patient_id
        - doctor_id
        - time_slot
        - appointment_date
        - start_time
        - end_time

    AppointmentUpdate:
      type: object
      properties:
        status:
          type: string
          enum: [SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW]
        notes:
          type: string

    AppointmentReason:
      type: object
      properties:
        id:
          type: string
          format: uuid
        appointment:
          type: string
          format: uuid
        reason:
          type: string
        is_first_visit:
          type: boolean
        symptoms:
          type: string
        duration:
          type: string

    AppointmentReasonCreate:
      type: object
      properties:
        reason:
          type: string
        is_first_visit:
          type: boolean
        symptoms:
          type: string
        duration:
          type: string
      required:
        - reason

    DoctorAvailability:
      type: object
      properties:
        id:
          type: string
          format: uuid
        doctor_id:
          type: string
          format: uuid
        day_of_week:
          type: integer
        start_time:
          type: string
          format: time
        end_time:
          type: string
          format: time
        is_active:
          type: boolean
        effective_from:
          type: string
          format: date
        effective_to:
          type: string
          format: date
        notes:
          type: string

    TimeSlot:
      type: object
      properties:
        id:
          type: string
          format: uuid
        doctor_id:
          type: string
          format: uuid
        date:
          type: string
          format: date
        start_time:
          type: string
          format: time
        end_time:
          type: string
          format: time
        status:
          type: string
          enum: [AVAILABLE, BOOKED, BLOCKED]
```

### 1.3 Conclusion

Trong chương này, chúng ta đã xác định các yêu cầu của hệ thống Y tế, bao gồm các tác nhân, chức năng, và use case. Chúng ta cũng đã phân tích các yêu cầu này và phân rã hệ thống thành các microservices với Django.

Các microservices được thiết kế để đảm nhận các chức năng nghiệp vụ cụ thể, với các models, views, templates, và API được định nghĩa rõ ràng. Mỗi microservice có cơ sở dữ liệu riêng và giao tiếp với các service khác thông qua REST API.

Kiến trúc này cho phép hệ thống có tính mô-đun hóa cao, dễ dàng mở rộng và bảo trì. Các microservices có thể được phát triển, triển khai và mở rộng độc lập, giúp tăng tính linh hoạt và khả năng chịu lỗi của hệ thống.

Trong chương tiếp theo, chúng ta sẽ đi sâu hơn vào việc thiết kế chi tiết các services/components, các lớp và phương thức, cũng như các API của hệ thống.

# CHAPTER 2: DESIGN E-COMMERCE SYSTEM WITH MICROSERVICES AND DJANGO

## 2.1 Design services/components

Trong phần này, chúng ta sẽ thiết kế chi tiết các services/components của hệ thống Y tế dựa trên kiến trúc microservices đã được xác định ở chương trước.

### 2.1.1 User Service

#### Tổng quan

User Service là service quản lý tất cả thông tin liên quan đến người dùng, xác thực và phân quyền. Service này cung cấp các API cho phép đăng ký, đăng nhập, quản lý hồ sơ cá nhân, và phân quyền người dùng.

#### Cấu trúc thư mục

```
user-service/
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

#### Các thành phần chính

1. **users**: Quản lý thông tin người dùng cơ bản
2. **profiles**: Quản lý thông tin hồ sơ chi tiết của người dùng (bệnh nhân, bác sĩ, y tá, etc.)
3. **authentication**: Xử lý xác thực và phân quyền

#### Các endpoints chính

- `/api/auth/login`: Đăng nhập và trả về JWT token
- `/api/auth/refresh`: Làm mới JWT token
- `/api/auth/logout`: Đăng xuất và vô hiệu hóa token
- `/api/users`: Quản lý người dùng (CRUD)
- `/api/users/me`: Lấy thông tin người dùng hiện tại
- `/api/users/change-password`: Đổi mật khẩu
- `/api/profiles/patients`: Quản lý hồ sơ bệnh nhân
- `/api/profiles/doctors`: Quản lý hồ sơ bác sĩ

### 2.1.2 Medical Record Service

#### Tổng quan

Medical Record Service quản lý hồ sơ y tế của bệnh nhân, bao gồm lịch sử khám bệnh, chẩn đoán, và điều trị. Service này cung cấp các API cho phép tạo, đọc, cập nhật và xóa hồ sơ y tế, cũng như tìm kiếm và truy vấn hồ sơ.

#### Cấu trúc thư mục

```
medical-record-service/
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
├── diagnoses/
│   ├── __init__.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── tests.py
└── treatments/
    ├── __init__.py
    ├── models.py
    ├── serializers.py
    ├── views.py
    ├── urls.py
    └── tests.py
```

#### Các thành phần chính

1. **records**: Quản lý hồ sơ y tế cơ bản
2. **encounters**: Quản lý các lần khám bệnh
3. **diagnoses**: Quản lý các chẩn đoán
4. **treatments**: Quản lý các phương pháp điều trị

#### Các endpoints chính

- `/api/medical-records`: Quản lý hồ sơ y tế (CRUD)
- `/api/medical-records/{id}/encounters`: Quản lý các lần khám bệnh của hồ sơ
- `/api/medical-records/{id}/allergies`: Quản lý các dị ứng của bệnh nhân
- `/api/medical-records/{id}/immunizations`: Quản lý các mũi tiêm chủng
- `/api/medical-records/{id}/medications`: Quản lý các thuốc đang sử dụng
- `/api/encounters/{id}/diagnoses`: Quản lý các chẩn đoán của lần khám
- `/api/encounters/{id}/vital-signs`: Quản lý các dấu hiệu sinh tồn
- `/api/diagnoses/{id}/treatments`: Quản lý các phương pháp điều trị cho chẩn đoán

### 2.1.3 Appointment Service

#### Tổng quan

Appointment Service quản lý lịch hẹn giữa bệnh nhân và bác sĩ. Service này cung cấp các API cho phép đặt lịch, hủy lịch, tìm kiếm lịch trống, và quản lý lịch làm việc của bác sĩ.

#### Cấu trúc thư mục

```
appointment-service/
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

#### Các thành phần chính

1. **availability**: Quản lý lịch làm việc của bác sĩ
2. **appointments**: Quản lý các lịch hẹn
3. **reminders**: Quản lý các nhắc nhở lịch hẹn

#### Các endpoints chính

- `/api/doctor-availability`: Quản lý lịch làm việc của bác sĩ (CRUD)
- `/api/doctor-availability/by-doctor`: Lấy lịch làm việc của một bác sĩ cụ thể
- `/api/doctor-availability/{id}/time-slots`: Tạo các khoảng thời gian cho lịch làm việc
- `/api/appointments`: Quản lý lịch hẹn (CRUD)
- `/api/appointments/{id}/cancel`: Hủy lịch hẹn
- `/api/appointments/{id}/reschedule`: Đổi lịch hẹn
- `/api/appointments/{id}/complete`: Đánh dấu lịch hẹn đã hoàn thành
- `/api/appointments/{id}/no-show`: Đánh dấu bệnh nhân không đến

### 2.1.4 Pharmacy Service

#### Tổng quan

Pharmacy Service quản lý thuốc, đơn thuốc, và cấp phát thuốc. Service này cung cấp các API cho phép kê đơn, xác minh đơn, cấp phát thuốc, và quản lý tồn kho thuốc.

#### Cấu trúc thư mục

```
pharmacy-service/
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

#### Các thành phần chính

1. **medications**: Quản lý thông tin thuốc
2. **prescriptions**: Quản lý đơn thuốc
3. **inventory**: Quản lý tồn kho thuốc

#### Các endpoints chính

- `/api/medications`: Quản lý thuốc (CRUD)
- `/api/medications/search`: Tìm kiếm thuốc
- `/api/medications/interactions`: Kiểm tra tương tác thuốc
- `/api/prescriptions`: Quản lý đơn thuốc (CRUD)
- `/api/prescriptions/{id}/verify`: Xác minh đơn thuốc
- `/api/prescriptions/{id}/dispense`: Cấp phát thuốc
- `/api/inventory`: Quản lý tồn kho thuốc
- `/api/inventory/low-stock`: Danh sách thuốc sắp hết

### 2.1.5 Laboratory Service

#### Tổng quan

Laboratory Service quản lý xét nghiệm, mẫu xét nghiệm, và kết quả xét nghiệm. Service này cung cấp các API cho phép yêu cầu xét nghiệm, ghi nhận kết quả, và truy vấn kết quả xét nghiệm.

#### Cấu trúc thư mục

```
laboratory-service/
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

#### Các thành phần chính

1. **test_types**: Quản lý các loại xét nghiệm
2. **lab_tests**: Quản lý các yêu cầu xét nghiệm
3. **results**: Quản lý kết quả xét nghiệm

#### Các endpoints chính

- `/api/test-types`: Quản lý các loại xét nghiệm (CRUD)
- `/api/lab-tests`: Quản lý các yêu cầu xét nghiệm (CRUD)
- `/api/lab-tests/{id}/collect-sample`: Ghi nhận việc thu thập mẫu
- `/api/lab-tests/{id}/process`: Xử lý xét nghiệm
- `/api/lab-tests/{id}/results`: Quản lý kết quả xét nghiệm
- `/api/lab-tests/by-patient/{patient_id}`: Lấy các xét nghiệm của bệnh nhân
- `/api/results`: Quản lý kết quả xét nghiệm (CRUD)
- `/api/results/{id}/verify`: Xác minh kết quả xét nghiệm

### 2.1.6 Billing Service

#### Tổng quan

Billing Service quản lý hóa đơn, thanh toán, và yêu cầu bảo hiểm. Service này cung cấp các API cho phép tạo hóa đơn, xử lý thanh toán, và quản lý yêu cầu bảo hiểm.

#### Cấu trúc thư mục

```
billing-service/
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

#### Các thành phần chính

1. **invoices**: Quản lý hóa đơn
2. **payments**: Quản lý thanh toán
3. **insurance**: Quản lý yêu cầu bảo hiểm

#### Các endpoints chính

- `/api/invoices`: Quản lý hóa đơn (CRUD)
- `/api/invoices/{id}/items`: Quản lý các mục trong hóa đơn
- `/api/invoices/by-patient/{patient_id}`: Lấy hóa đơn của bệnh nhân
- `/api/payments`: Quản lý thanh toán (CRUD)
- `/api/payments/process`: Xử lý thanh toán
- `/api/insurance-claims`: Quản lý yêu cầu bảo hiểm (CRUD)
- `/api/insurance-claims/{id}/submit`: Gửi yêu cầu bảo hiểm
- `/api/insurance-claims/{id}/status`: Cập nhật trạng thái yêu cầu bảo hiểm

### 2.1.7 Notification Service

#### Tổng quan

Notification Service quản lý và gửi thông báo đến người dùng qua nhiều kênh khác nhau (email, SMS, push notification, in-app notification). Service này cung cấp các API cho phép gửi thông báo, quản lý mẫu thông báo, và quản lý tùy chọn thông báo.

#### Cấu trúc thư mục

```
notification-service/
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

#### Các thành phần chính

1. **templates**: Quản lý mẫu thông báo
2. **notifications**: Quản lý thông báo
3. **websockets**: Xử lý thông báo thời gian thực

#### Các endpoints chính

- `/api/notification-templates`: Quản lý mẫu thông báo (CRUD)
- `/api/notifications`: Gửi và quản lý thông báo
- `/api/notifications/send`: Gửi thông báo
- `/api/notifications/by-recipient/{recipient_id}`: Lấy thông báo của người dùng
- `/api/notifications/{id}/mark-as-read`: Đánh dấu thông báo đã đọc
- `/api/notification-preferences`: Quản lý tùy chọn thông báo
- `/ws/notifications`: Kết nối WebSocket cho thông báo thời gian thực

### 2.1.8 AI ChatBot Service

#### Tổng quan

AI ChatBot Service cung cấp trợ lý AI và giao tiếp trực tiếp giữa bệnh nhân và bác sĩ. Service này cung cấp các API cho phép tạo hội thoại, gửi tin nhắn, và tương tác với AI.

#### Cấu trúc thư mục

```
chatbot-service/
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

#### Các thành phần chính

1. **conversations**: Quản lý hội thoại
2. **messages**: Quản lý tin nhắn
3. **ai**: Tích hợp với OpenAI API
4. **websockets**: Xử lý giao tiếp thời gian thực

#### Các endpoints chính

- `/api/conversations`: Quản lý hội thoại (CRUD)
- `/api/conversations/{id}/messages`: Quản lý tin nhắn trong hội thoại
- `/api/conversations/by-user/{user_id}`: Lấy hội thoại của người dùng
- `/api/messages`: Quản lý tin nhắn (CRUD)
- `/api/messages/send`: Gửi tin nhắn
- `/api/ai/chat`: Tương tác với AI
- `/api/ai/health-check`: Kiểm tra sức khỏe dựa trên triệu chứng
- `/ws/chat`: Kết nối WebSocket cho trò chuyện thời gian thực

### 2.1.9 API Gateway

#### Tổng quan

API Gateway đóng vai trò là điểm vào duy nhất cho tất cả các yêu cầu API, xử lý định tuyến, xác thực, và cân bằng tải. Gateway này định tuyến các yêu cầu đến các microservices phù hợp và xử lý các vấn đề chéo như xác thực, ghi nhật ký, và giới hạn tốc độ.

#### Cấu trúc thư mục

```
api-gateway/
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

#### Các thành phần chính

1. **config**: Cấu hình cho API Gateway
2. **middleware**: Các middleware cho xác thực, giới hạn tốc độ, và xử lý lỗi
3. **routes**: Định tuyến các yêu cầu đến các microservices
4. **utils**: Các tiện ích cho ghi nhật ký và proxy

#### Các endpoints chính

- `/api/users/*`: Định tuyến đến User Service
- `/api/auth/*`: Định tuyến đến User Service (authentication)
- `/api/medical-records/*`: Định tuyến đến Medical Record Service
- `/api/appointments/*`: Định tuyến đến Appointment Service
- `/api/medications/*`: Định tuyến đến Pharmacy Service
- `/api/prescriptions/*`: Định tuyến đến Pharmacy Service
- `/api/lab-tests/*`: Định tuyến đến Laboratory Service
- `/api/invoices/*`: Định tuyến đến Billing Service
- `/api/notifications/*`: Định tuyến đến Notification Service
- `/api/conversations/*`: Định tuyến đến AI ChatBot Service
- `/api/ai/*`: Định tuyến đến AI ChatBot Service

## 2.2 Design classes and methods in component

Trong phần này, chúng ta sẽ thiết kế chi tiết các lớp và phương thức trong các component của hệ thống.

### 2.2.1 User Service Classes

#### UserManager

```python
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')

        return self.create_user(email, password, **extra_fields)
```

#### UserSerializer

```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
```

#### PatientProfileSerializer

```python
class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    age = serializers.SerializerMethodField()
    bmi = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'user_id', 'date_of_birth', 'gender', 'blood_type', 'height', 'weight',
                 'allergies', 'emergency_contact_name', 'emergency_contact_phone', 'age', 'bmi',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_age(self, obj):
        return obj.calculate_age()

    def get_bmi(self, obj):
        return obj.calculate_bmi()
```

#### JWTAuthentication

```python
class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        try:
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                return None
        except ValueError:
            return None

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            return (user, token)
        except (jwt.DecodeError, User.DoesNotExist):
            return None
```

### 2.2.2 Medical Record Service Classes

#### MedicalRecordSerializer

```python
class MedicalRecordSerializer(serializers.ModelSerializer):
    encounters_count = serializers.SerializerMethodField()

    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient_id', 'status', 'notes', 'created_at', 'updated_at', 'encounters_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'encounters_count']

    def get_encounters_count(self, obj):
        return obj.encounters.count()
```

#### EncounterSerializer

```python
class EncounterSerializer(serializers.ModelSerializer):
    diagnoses_count = serializers.SerializerMethodField()

    class Meta:
        model = Encounter
        fields = ['id', 'medical_record', 'doctor_id', 'encounter_date', 'encounter_type',
                 'reason', 'status', 'notes', 'created_at', 'updated_at', 'diagnoses_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'diagnoses_count']

    def get_diagnoses_count(self, obj):
        return obj.diagnoses.count()
```

#### DiagnosisSerializer

```python
class DiagnosisSerializer(serializers.ModelSerializer):
    treatments_count = serializers.SerializerMethodField()

    class Meta:
        model = Diagnosis
        fields = ['id', 'encounter', 'diagnosis_code', 'diagnosis_name', 'diagnosis_date',
                 'diagnosed_by', 'severity', 'notes', 'created_at', 'updated_at', 'treatments_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'treatments_count']

    def get_treatments_count(self, obj):
        return obj.treatments.count()
```

#### MedicalRecordService

```python
class MedicalRecordService:
    @staticmethod
    def get_patient_medical_history(patient_id):
        """Get complete medical history for a patient"""
        try:
            medical_record = MedicalRecord.objects.get(patient_id=patient_id)

            # Get encounters
            encounters = medical_record.get_encounters()

            # Get diagnoses for each encounter
            diagnoses = []
            for encounter in encounters:
                diagnoses.extend(encounter.get_diagnoses())

            # Get treatments for each diagnosis
            treatments = []
            for diagnosis in diagnoses:
                treatments.extend(diagnosis.get_treatments())

            # Get medications
            medications = medical_record.get_medications()

            # Get allergies
            allergies = medical_record.get_allergies()

            # Get immunizations
            immunizations = medical_record.get_immunizations()

            # Get lab tests
            lab_tests = medical_record.get_lab_tests()

            return {
                'medical_record': medical_record,
                'encounters': encounters,
                'diagnoses': diagnoses,
                'treatments': treatments,
                'medications': medications,
                'allergies': allergies,
                'immunizations': immunizations,
                'lab_tests': lab_tests
            }
        except MedicalRecord.DoesNotExist:
            return None
```

### 2.2.3 Appointment Service Classes

#### DoctorAvailabilityService

```python
class DoctorAvailabilityService:
    @staticmethod
    def get_available_slots(doctor_id, date):
        """Get available time slots for a doctor on a specific date"""
        # Get doctor's availability for the day of week
        day_of_week = date.weekday()  # 0=Monday, 6=Sunday
        availabilities = DoctorAvailability.objects.filter(
            doctor_id=doctor_id,
            day_of_week=day_of_week,
            is_active=True
        )

        # Check if there are any schedule exceptions for this date
        exceptions = DoctorScheduleException.objects.filter(
            doctor_id=doctor_id,
            exception_date=date,
            status='APPROVED'
        )

        # Generate time slots based on availabilities
        all_slots = []
        for availability in availabilities:
            if availability.is_available(date):
                slots = availability.generate_time_slots(date)
                all_slots.extend(slots)

        # Filter out slots that overlap with exceptions
        available_slots = []
        for slot in all_slots:
            is_available = True
            for exception in exceptions:
                if exception.affects_slot(slot):
                    is_available = False
                    break
            if is_available:
                available_slots.append(slot)

        # Filter out slots that are already booked
        available_slots = [slot for slot in available_slots if slot.is_available()]

        return available_slots
```

#### AppointmentSerializer

```python
class AppointmentSerializer(serializers.ModelSerializer):
    reason = AppointmentReasonSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patient_id', 'doctor_id', 'time_slot', 'appointment_date', 'start_time',
                 'end_time', 'status', 'cancelled_reason', 'notes', 'created_at', 'updated_at', 'reason']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Create appointment
        appointment = Appointment.objects.create(**validated_data)

        # Create medical record encounter if it doesn't exist
        if appointment.status != 'CANCELLED':
            try:
                medical_record = MedicalRecord.objects.get(patient_id=appointment.patient_id)

                # Create encounter for this appointment
                encounter_date = datetime.combine(appointment.appointment_date, appointment.start_time)
                Encounter.objects.create(
                    medical_record=medical_record,
                    doctor_id=appointment.doctor_id,
                    encounter_date=encounter_date,
                    encounter_type='SCHEDULED',
                    reason=f"Scheduled appointment",
                    status='SCHEDULED'
                )
            except MedicalRecord.DoesNotExist:
                # Medical record doesn't exist yet, will be created when patient visits
                pass

        return appointment
```

#### AppointmentReminderService

```python
class AppointmentReminderService:
    @staticmethod
    def send_reminder(reminder_id):
        """Send a reminder for an appointment"""
        try:
            reminder = AppointmentReminder.objects.get(id=reminder_id)
            appointment = reminder.appointment

            # Get patient and doctor information from User Service
            patient_data = requests.get(
                f"{settings.USER_SERVICE_URL}/api/users/{appointment.patient_id}/",
                headers={"Authorization": f"Bearer {get_service_token()}"}
            ).json()

            doctor_data = requests.get(
                f"{settings.USER_SERVICE_URL}/api/users/{appointment.doctor_id}/",
                headers={"Authorization": f"Bearer {get_service_token()}"}
            ).json()

            # Prepare reminder data
            reminder_data = {
                "recipient_id": appointment.patient_id,
                "type": reminder.reminder_type,
                "data": {
                    "appointment_id": str(appointment.id),
                    "appointment_date": appointment.appointment_date.isoformat(),
                    "start_time": appointment.start_time.isoformat(),
                    "end_time": appointment.end_time.isoformat(),
                    "doctor_name": f"Dr. {doctor_data['first_name']} {doctor_data['last_name']}",
                    "patient_name": f"{patient_data['first_name']} {patient_data['last_name']}"
                }
            }

            # Send reminder via Notification Service
            response = requests.post(
                f"{settings.NOTIFICATION_SERVICE_URL}/api/notifications/send/",
                json=reminder_data,
                headers={"Authorization": f"Bearer {get_service_token()}"}
            )

            if response.status_code == 200:
                reminder.mark_as_sent()
                return True
            else:
                reminder.mark_as_failed(response.text)
                return False
        except AppointmentReminder.DoesNotExist:
            return False
        except Exception as e:
            # Log the error
            logger.error(f"Error sending reminder {reminder_id}: {str(e)}")
            return False
```

### 2.2.4 Pharmacy Service Classes

#### MedicationSerializer

```python
class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['id', 'name', 'generic_name', 'description', 'dosage_form', 'strength',
                 'manufacturer', 'requires_prescription', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

#### PrescriptionSerializer

```python
class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True, read_only=True)

    class Meta:
        model = Prescription
        fields = ['id', 'patient_id', 'doctor_id', 'encounter_id', 'prescription_date',
                 'status', 'notes', 'created_at', 'updated_at', 'expiry_date',
                 'is_refillable', 'refills_remaining', 'items']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

#### PrescriptionItemSerializer

```python
class PrescriptionItemSerializer(serializers.ModelSerializer):
    medication_details = MedicationSerializer(source='medication', read_only=True)

    class Meta:
        model = PrescriptionItem
        fields = ['id', 'prescription', 'medication', 'medication_details', 'dosage',
                 'frequency', 'duration', 'quantity', 'instructions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

#### DrugInteractionService

```python
class DrugInteractionService:
    @staticmethod
    def check_interactions(medications):
        """Check for interactions between medications"""
        interactions = []

        # Check all pairs of medications for interactions
        for i in range(len(medications)):
            for j in range(i+1, len(medications)):
                med1 = medications[i]
                med2 = medications[j]

                # Check for known interactions in the database
                interaction = DrugInteraction.objects.filter(
                    (Q(medication1=med1) & Q(medication2=med2)) |
                    (Q(medication1=med2) & Q(medication2=med1))
                ).first()

                if interaction:
                    interactions.append({
                        'medication1': MedicationSerializer(med1).data,
                        'medication2': MedicationSerializer(med2).data,
                        'severity': interaction.severity,
                        'description': interaction.description
                    })

        return interactions

    @staticmethod
    def check_prescription_interactions(prescription):
        """Check for interactions in a prescription"""
        # Get all medications in the prescription
        prescription_items = PrescriptionItem.objects.filter(prescription=prescription)
        medications = [item.medication for item in prescription_items]

        # Get patient's current medications from Medical Record Service
        try:
            response = requests.get(
                f"{settings.MEDICAL_RECORD_SERVICE_URL}/api/medical-records/by-patient/{prescription.patient_id}/medications/",
                headers={"Authorization": f"Bearer {get_service_token()}"}
            )

            if response.status_code == 200:
                current_medications_data = response.json()

                # Get medication objects for current medications
                current_medication_ids = [med['id'] for med in current_medications_data]
                current_medications = Medication.objects.filter(id__in=current_medication_ids)

                # Combine with prescription medications
                all_medications = list(medications) + list(current_medications)

                # Check for interactions
                return DrugInteractionService.check_interactions(all_medications)
            else:
                # If we can't get current medications, just check prescription medications
                return DrugInteractionService.check_interactions(medications)
        except Exception as e:
            # Log the error
            logger.error(f"Error checking interactions: {str(e)}")
            # Just check prescription medications
            return DrugInteractionService.check_interactions(medications)
```

#### InventoryService

```python
class InventoryService:
    @staticmethod
    def check_stock(medication_id, quantity_needed):
        """Check if there is enough stock for a medication"""
        try:
            inventory = Inventory.objects.get(medication_id=medication_id)
            return inventory.quantity >= quantity_needed
        except Inventory.DoesNotExist:
            return False

    @staticmethod
    def update_stock(medication_id, quantity_change):
        """Update stock for a medication"""
        try:
            inventory = Inventory.objects.get(medication_id=medication_id)
            inventory.quantity += quantity_change
            inventory.save()

            # Check if stock is low and create notification if needed
            if inventory.quantity <= inventory.reorder_level:
                # Create notification for low stock
                notification_data = {
                    "recipient_id": None,  # Will be sent to all pharmacists
                    "type": "IN_APP",
                    "data": {
                        "medication_id": str(medication_id),
                        "medication_name": inventory.medication.name,
                        "current_quantity": inventory.quantity,
                        "reorder_level": inventory.reorder_level
                    }
                }

                # Send notification via Notification Service
                requests.post(
                    f"{settings.NOTIFICATION_SERVICE_URL}/api/notifications/send/",
                    json=notification_data,
                    headers={"Authorization": f"Bearer {get_service_token()}"}
                )

            return True
        except Inventory.DoesNotExist:
            return False
```

### 2.2.5 Laboratory Service Classes

#### TestTypeSerializer

```python
class TestTypeSerializer(serializers.ModelSerializer):
    parameters_count = serializers.SerializerMethodField()

    class Meta:
        model = TestType
        fields = ['id', 'name', 'description', 'category', 'price', 'preparation_instructions',
                 'result_turnaround_time', 'is_active', 'created_at', 'updated_at', 'parameters_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'parameters_count']

    def get_parameters_count(self, obj):
        return obj.parameters.count()
```

#### LabTestSerializer

```python
class LabTestSerializer(serializers.ModelSerializer):
    test_type_details = TestTypeSerializer(source='test_type', read_only=True)
    result = TestResultSerializer(read_only=True)

    class Meta:
        model = LabTest
        fields = ['id', 'patient_id', 'doctor_id', 'test_type', 'test_type_details',
                 'ordered_date', 'status', 'priority', 'notes', 'created_at', 'updated_at', 'result']
        read_only_fields = ['id', 'created_at', 'updated_at', 'result']
```

#### TestResultSerializer

```python
class TestResultSerializer(serializers.ModelSerializer):
    parameter_results = ParameterResultSerializer(many=True, read_only=True)

    class Meta:
        model = TestResult
        fields = ['id', 'lab_test', 'result_date', 'performed_by', 'verified_by',
                 'interpretation', 'is_abnormal', 'notes', 'created_at', 'updated_at', 'parameter_results']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

#### LabTestService

```python
class LabTestService:
    @staticmethod
    def order_test(patient_id, doctor_id, test_type_id, priority='ROUTINE', notes=None):
        """Order a new lab test"""
        try:
            test_type = TestType.objects.get(id=test_type_id)

            # Create the lab test
            lab_test = LabTest.objects.create(
                patient_id=patient_id,
                doctor_id=doctor_id,
                test_type=test_type,
                ordered_date=timezone.now(),
                status='ORDERED',
                priority=priority,
                notes=notes
            )

            # Create parameter results for each parameter in the test type
            parameters = TestParameter.objects.filter(test_type=test_type)

            # Notify patient about the ordered test
            notification_data = {
                "recipient_id": patient_id,
                "type": "IN_APP",
                "data": {
                    "lab_test_id": str(lab_test.id),
                    "test_type": test_type.name,
                    "ordered_date": lab_test.ordered_date.isoformat()
                }
            }

            # Send notification via Notification Service
            requests.post(
                f"{settings.NOTIFICATION_SERVICE_URL}/api/notifications/send/",
                json=notification_data,
                headers={"Authorization": f"Bearer {get_service_token()}"}
            )

            return lab_test
        except TestType.DoesNotExist:
            return None

    @staticmethod
    def record_result(lab_test_id, performed_by, parameter_results, interpretation=None, notes=None):
        """Record results for a lab test"""
        try:
            lab_test = LabTest.objects.get(id=lab_test_id)

            # Check if test is in a valid state for recording results
            if lab_test.status not in ['ORDERED', 'SAMPLE_COLLECTED', 'IN_PROGRESS']:
                return None

            # Create test result
            result = TestResult.objects.create(
                lab_test=lab_test,
                result_date=timezone.now(),
                performed_by=performed_by,
                interpretation=interpretation,
                notes=notes
            )

            # Create parameter results
            is_abnormal = False
            for param_result in parameter_results:
                parameter = TestParameter.objects.get(id=param_result['parameter_id'])
                value = param_result['value']

                # Check if result is abnormal
                param_is_abnormal = False
                if parameter.reference_range:
                    # Simple check for numeric values
                    try:
                        numeric_value = float(value)
                        ref_range = parameter.reference_range.split('-')
                        if len(ref_range) == 2:
                            min_val = float(ref_range[0])
                            max_val = float(ref_range[1])
                            if numeric_value < min_val or numeric_value > max_val:
                                param_is_abnormal = True
                    except (ValueError, IndexError):
                        # Not a numeric value or reference range not in expected format
                        pass

                ParameterResult.objects.create(
                    result=result,
                    parameter=parameter,
                    value=value,
                    is_abnormal=param_is_abnormal
                )

                if param_is_abnormal:
                    is_abnormal = True

            # Update result abnormal flag
            result.is_abnormal = is_abnormal
            result.save()

            # Update lab test status
            lab_test.status = 'COMPLETED'
            lab_test.save()

            # Notify patient and doctor about the completed test
            notification_data = {
                "recipient_id": lab_test.patient_id,
                "type": "IN_APP",
                "data": {
                    "lab_test_id": str(lab_test.id),
                    "test_type": lab_test.test_type.name,
                    "result_date": result.result_date.isoformat(),
                    "is_abnormal": is_abnormal
                }
            }

            # Send notification via Notification Service
            requests.post(
                f"{settings.NOTIFICATION_SERVICE_URL}/api/notifications/send/",
                json=notification_data,
                headers={"Authorization": f"Bearer {get_service_token()}"}
            )

            # Also notify doctor
            notification_data["recipient_id"] = lab_test.doctor_id
            requests.post(
                f"{settings.NOTIFICATION_SERVICE_URL}/api/notifications/send/",
                json=notification_data,
                headers={"Authorization": f"Bearer {get_service_token()}"}
            )

            return result
        except (LabTest.DoesNotExist, TestParameter.DoesNotExist):
            return None
```

### 2.2.6 Billing Service Classes

#### InvoiceSerializer

```python
class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    insurance_coverage = serializers.SerializerMethodField()
    patient_responsibility = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = ['id', 'patient_id', 'invoice_number', 'invoice_date', 'due_date',
                 'status', 'notes', 'created_at', 'updated_at', 'items',
                 'total_amount', 'insurance_coverage', 'patient_responsibility']
        read_only_fields = ['id', 'invoice_number', 'created_at', 'updated_at',
                          'total_amount', 'insurance_coverage', 'patient_responsibility']

    def get_total_amount(self, obj):
        return obj.calculate_total()

    def get_insurance_coverage(self, obj):
        return obj.calculate_insurance_coverage()

    def get_patient_responsibility(self, obj):
        return obj.calculate_patient_responsibility()
```

#### PaymentSerializer

```python
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'invoice', 'payment_date', 'amount', 'payment_method',
                 'transaction_id', 'status', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

#### InsuranceClaimSerializer

```python
class InsuranceClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceClaim
        fields = ['id', 'invoice', 'claim_number', 'submission_date', 'status',
                 'amount_claimed', 'amount_approved', 'rejection_reason',
                 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'claim_number', 'created_at', 'updated_at']
```

#### BillingService

```python
class BillingService:
    @staticmethod
    def generate_invoice(patient_id, items, due_date=None, notes=None):
        """Generate an invoice for a patient"""
        # Generate invoice number
        invoice_number = f"INV-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        # Set due date if not provided
        if not due_date:
            due_date = timezone.now().date() + timedelta(days=30)

        # Create invoice
        invoice = Invoice.objects.create(
            patient_id=patient_id,
            invoice_number=invoice_number,
            invoice_date=timezone.now().date(),
            due_date=due_date,
            status='PENDING',
            notes=notes
        )

        # Create invoice items
        for item in items:
            InvoiceItem.objects.create(
                invoice=invoice,
                description=item['description'],
                service_code=item.get('service_code'),
                quantity=item.get('quantity', 1),
                unit_price=item['unit_price'],
                discount=item.get('discount', 0),
                tax=item.get('tax', 0)
            )

        # Notify patient about the new invoice
        notification_data = {
            "recipient_id": patient_id,
            "type": "IN_APP",
            "data": {
                "invoice_id": str(invoice.id),
                "invoice_number": invoice.invoice_number,
                "invoice_date": invoice.invoice_date.isoformat(),
                "due_date": invoice.due_date.isoformat(),
                "total_amount": str(invoice.calculate_total())
            }
        }

        # Send notification via Notification Service
        requests.post(
            f"{settings.NOTIFICATION_SERVICE_URL}/api/notifications/send/",
            json=notification_data,
            headers={"Authorization": f"Bearer {get_service_token()}"}
        )

        return invoice

    @staticmethod
    def process_payment(invoice_id, amount, payment_method, transaction_id=None, notes=None):
        """Process a payment for an invoice"""
        try:
            invoice = Invoice.objects.get(id=invoice_id)

            # Create payment
            payment = Payment.objects.create(
                invoice=invoice,
                payment_date=timezone.now().date(),
                amount=amount,
                payment_method=payment_method,
                transaction_id=transaction_id,
                status='COMPLETED',
                notes=notes
            )

            # Update invoice status
            total_paid = Payment.objects.filter(invoice=invoice, status='COMPLETED').aggregate(Sum('amount'))['amount__sum'] or 0
            total_amount = invoice.calculate_total()

            if total_paid >= total_amount:
                invoice.status = 'PAID'
            elif total_paid > 0:
                invoice.status = 'PARTIALLY_PAID'
            invoice.save()

            # Notify patient about the payment
            notification_data = {
                "recipient_id": invoice.patient_id,
                "type": "IN_APP",
                "data": {
                    "invoice_id": str(invoice.id),
                    "invoice_number": invoice.invoice_number,
                    "payment_id": str(payment.id),
                    "payment_date": payment.payment_date.isoformat(),
                    "amount": str(payment.amount),
                    "payment_method": payment.payment_method,
                    "invoice_status": invoice.status
                }
            }

            # Send notification via Notification Service
            requests.post(
                f"{settings.NOTIFICATION_SERVICE_URL}/api/notifications/send/",
                json=notification_data,
                headers={"Authorization": f"Bearer {get_service_token()}"}
            )

            return payment
        except Invoice.DoesNotExist:
            return None

    @staticmethod
    def submit_insurance_claim(invoice_id, amount_claimed, notes=None):
        """Submit an insurance claim for an invoice"""
        try:
            invoice = Invoice.objects.get(id=invoice_id)

            # Generate claim number
            claim_number = f"CLM-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

            # Create insurance claim
            claim = InsuranceClaim.objects.create(
                invoice=invoice,
                claim_number=claim_number,
                submission_date=timezone.now().date(),
                status='SUBMITTED',
                amount_claimed=amount_claimed,
                notes=notes
            )

            # Update invoice status
            invoice.status = 'INSURANCE_PENDING'
            invoice.save()

            # Notify patient about the insurance claim
            notification_data = {
                "recipient_id": invoice.patient_id,
                "type": "IN_APP",
                "data": {
                    "invoice_id": str(invoice.id),
                    "invoice_number": invoice.invoice_number,
                    "claim_id": str(claim.id),
                    "claim_number": claim.claim_number,
                    "submission_date": claim.submission_date.isoformat(),
                    "amount_claimed": str(claim.amount_claimed),
                    "status": claim.status
                }
            }

            # Send notification via Notification Service
            requests.post(
                f"{settings.NOTIFICATION_SERVICE_URL}/api/notifications/send/",
                json=notification_data,
                headers={"Authorization": f"Bearer {get_service_token()}"}
            )

            return claim
        except Invoice.DoesNotExist:
            return None
```

### 2.2.7 Notification Service Classes

#### NotificationTemplateSerializer

```python
class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = ['id', 'name', 'type', 'subject', 'content', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

#### NotificationSerializer

```python
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'recipient_id', 'type', 'title', 'message', 'data',
                 'is_read', 'read_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

#### NotificationService

```python
class NotificationService:
    @staticmethod
    def send_notification(recipient_id, notification_type, data, template_name=None):
        """Send a notification to a recipient"""
        # Get template if provided
        template = None
        if template_name:
            try:
                template = NotificationTemplate.objects.get(name=template_name, type=notification_type, is_active=True)
            except NotificationTemplate.DoesNotExist:
                # Log warning but continue with default template
                logger.warning(f"Template {template_name} not found, using default")

        # If no specific template provided, get default for this type
        if not template:
            try:
                template = NotificationTemplate.objects.get(name=f"default_{notification_type.lower()}", type=notification_type, is_active=True)
            except NotificationTemplate.DoesNotExist:
                # No template found, will use raw data
                pass

        # Prepare notification content
        title = data.get('title', '')
        message = data.get('message', '')

        # If template exists, render it with the data
        if template:
            # Simple template rendering
            title = template.subject
            message = template.content

            # Replace placeholders in the template
            for key, value in data.items():
                title = title.replace(f"{{{{{key}}}}}", str(value))
                message = message.replace(f"{{{{{key}}}}}", str(value))

        # Create notification record
        notification = Notification.objects.create(
            recipient_id=recipient_id,
            type=notification_type,
            title=title,
            message=message,
            data=data
        )

        # Send notification based on type
        if notification_type == 'EMAIL':
            NotificationService._send_email(notification)
        elif notification_type == 'SMS':
            NotificationService._send_sms(notification)
        elif notification_type == 'PUSH':
            NotificationService._send_push(notification)
        elif notification_type == 'IN_APP':
            NotificationService._send_in_app(notification)

        return notification

    @staticmethod
    def _send_email(notification):
        """Send email notification"""
        try:
            # Get recipient email from User Service
            response = requests.get(
                f"{settings.USER_SERVICE_URL}/api/users/{notification.recipient_id}/",
                headers={"Authorization": f"Bearer {get_service_token()}"}
            )

            if response.status_code == 200:
                user_data = response.json()
                recipient_email = user_data.get('email')

                if recipient_email:
                    # Send email using Django's email backend
                    send_mail(
                        subject=notification.title,
                        message=notification.message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[recipient_email],
                        html_message=notification.message,  # Assuming message is HTML
                        fail_silently=False
                    )

                    # Mark notification as sent
                    notification.status = 'SENT'
                    notification.save()
                    return True

            # If we get here, something went wrong
            notification.status = 'FAILED'
            notification.error_message = "Failed to send email"
            notification.save()
            return False
        except Exception as e:
            # Log the error
            logger.error(f"Error sending email notification {notification.id}: {str(e)}")
            notification.status = 'FAILED'
            notification.error_message = str(e)
            notification.save()
            return False

    @staticmethod
    def _send_sms(notification):
        """Send SMS notification"""
        try:
            # Get recipient phone from User Service
            response = requests.get(
                f"{settings.USER_SERVICE_URL}/api/profiles/patients/{notification.recipient_id}/",
                headers={"Authorization": f"Bearer {get_service_token()}"}
            )

            if response.status_code == 200:
                profile_data = response.json()
                phone_number = profile_data.get('phone_number')

                if phone_number:
                    # Send SMS using Twilio or similar service
                    # This is a placeholder for the actual SMS sending code
                    # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                    # message = client.messages.create(
                    #     body=notification.message,
                    #     from_=settings.TWILIO_PHONE_NUMBER,
                    #     to=phone_number
                    # )

                    # Mark notification as sent
                    notification.status = 'SENT'
                    notification.save()
                    return True

            # If we get here, something went wrong
            notification.status = 'FAILED'
            notification.error_message = "Failed to send SMS"
            notification.save()
            return False
        except Exception as e:
            # Log the error
            logger.error(f"Error sending SMS notification {notification.id}: {str(e)}")
            notification.status = 'FAILED'
            notification.error_message = str(e)
            notification.save()
            return False

    @staticmethod
    def _send_in_app(notification):
        """Send in-app notification"""
        try:
            # For in-app notifications, we just need to save the notification
            # and it will be retrieved by the client application
            notification.status = 'SENT'
            notification.save()

            # Broadcast to WebSocket if recipient is online
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notifications_{notification.recipient_id}",
                {
                    "type": "notification.message",
                    "notification": {
                        "id": str(notification.id),
                        "type": notification.type,
                        "title": notification.title,
                        "message": notification.message,
                        "data": notification.data,
                        "created_at": notification.created_at.isoformat()
                    }
                }
            )

            return True
        except Exception as e:
            # Log the error
            logger.error(f"Error sending in-app notification {notification.id}: {str(e)}")
            notification.status = 'FAILED'
            notification.error_message = str(e)
            notification.save()
            return False
```

### 2.2.8 AI ChatBot Service Classes

#### ConversationSerializer

```python
class ConversationSerializer(serializers.ModelSerializer):
    messages_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'user_id', 'title', 'conversation_type', 'status',
                 'created_at', 'updated_at', 'messages_count', 'last_message']
        read_only_fields = ['id', 'created_at', 'updated_at', 'messages_count', 'last_message']

    def get_messages_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return {
                'content': last_message.content[:100] + '...' if len(last_message.content) > 100 else last_message.content,
                'sender_type': last_message.sender_type,
                'created_at': last_message.created_at.isoformat()
            }
        return None
```

#### MessageSerializer

```python
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'content', 'sender_type', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

#### OpenAIService

```python
class OpenAIService:
    @staticmethod
    def generate_response(conversation_id, user_message):
        """Generate a response using OpenAI API"""
        try:
            # Get conversation and previous messages
            conversation = Conversation.objects.get(id=conversation_id)
            previous_messages = Message.objects.filter(conversation=conversation).order_by('created_at')

            # Prepare conversation history for OpenAI
            messages = []

            # Add system message based on conversation type
            if conversation.conversation_type == 'HEALTH_ASSISTANT':
                messages.append({
                    "role": "system",
                    "content": "You are a helpful healthcare assistant. You can provide general health information and advice, but you should clarify that you are not a doctor and cannot provide medical diagnosis or treatment. For serious health concerns, always advise users to consult with a healthcare professional."
                })
            elif conversation.conversation_type == 'DOCTOR_PATIENT':
                messages.append({
                    "role": "system",
                    "content": "You are facilitating a conversation between a doctor and a patient. Be respectful and professional. Help clarify medical terms if needed."
                })
            else:  # Default
                messages.append({
                    "role": "system",
                    "content": "You are a helpful assistant in a healthcare system."
                })

            # Add conversation history (up to 10 most recent messages)
            for message in previous_messages.order_by('-created_at')[:10][::-1]:
                role = "assistant" if message.sender_type == "AI" else "user"
                messages.append({"role": role, "content": message.content})

            # Add the current user message
            messages.append({"role": "user", "content": user_message})

            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model="gpt-4",  # or another appropriate model
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )

            # Extract and return the response
            ai_response = response.choices[0].message.content.strip()

            # Save user message
            Message.objects.create(
                conversation=conversation,
                content=user_message,
                sender_type="USER"
            )

            # Save AI response
            ai_message = Message.objects.create(
                conversation=conversation,
                content=ai_response,
                sender_type="AI"
            )

            # Update conversation
            conversation.updated_at = timezone.now()
            conversation.save()

            return ai_message
        except Conversation.DoesNotExist:
            return None
        except Exception as e:
            # Log the error
            logger.error(f"Error generating OpenAI response: {str(e)}")
            return None

    @staticmethod
    def health_check(symptoms):
        """Analyze symptoms and provide health information"""
        try:
            # Prepare message for OpenAI
            messages = [
                {
                    "role": "system",
                    "content": "You are a healthcare assistant. Analyze the symptoms provided and give general information about possible conditions. Always include a disclaimer that this is not a medical diagnosis and the user should consult a healthcare professional for proper evaluation."
                },
                {
                    "role": "user",
                    "content": f"I'm experiencing the following symptoms: {symptoms}. What could these symptoms indicate?"
                }
            ]

            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model="gpt-4",  # or another appropriate model
                messages=messages,
                max_tokens=800,
                temperature=0.3
            )

            # Extract and return the response
            return response.choices[0].message.content.strip()
        except Exception as e:
            # Log the error
            logger.error(f"Error in health check: {str(e)}")
            return "I'm sorry, I couldn't analyze your symptoms at this time. Please try again later or consult with a healthcare professional."
```

#### NotificationConsumer

```python
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get user from scope
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        # Join user-specific notification group
        self.notification_group_name = f"notifications_{self.user.id}"
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave notification group
        if hasattr(self, "notification_group_name"):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )

    async def notification_message(self, event):
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            "type": "notification",
            "notification": event["notification"]
        }))
```

#### ChatConsumer

```python
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get user and conversation from scope
        self.user = self.scope["user"]
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]

        if not self.user.is_authenticated:
            await self.close()
            return

        # Check if user has access to this conversation
        try:
            conversation = await database_sync_to_async(Conversation.objects.get)(
                id=self.conversation_id
            )

            if conversation.user_id != str(self.user.id) and not self.user.is_staff:
                await self.close()
                return

            # Join conversation-specific group
            self.chat_group_name = f"chat_{self.conversation_id}"
            await self.channel_layer.group_add(
                self.chat_group_name,
                self.channel_name
            )

            await self.accept()
        except Conversation.DoesNotExist:
            await self.close()

    async def disconnect(self, close_code):
        # Leave chat group
        if hasattr(self, "chat_group_name"):
            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # Receive message from WebSocket
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type")

        if message_type == "chat_message":
            content = text_data_json.get("message")

            # Save message to database
            message = await database_sync_to_async(Message.objects.create)(
                conversation_id=self.conversation_id,
                content=content,
                sender_type="USER" if not self.user.is_staff else "DOCTOR"
            )

            # Send message to chat group
            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    "type": "chat_message",
                    "message": {
                        "id": str(message.id),
                        "content": message.content,
                        "sender_type": message.sender_type,
                        "created_at": message.created_at.isoformat()
                    }
                }
            )

            # If this is a patient-AI conversation, generate AI response
            conversation = await database_sync_to_async(Conversation.objects.get)(
                id=self.conversation_id
            )

            if conversation.conversation_type == "HEALTH_ASSISTANT":
                # Generate AI response (in a non-blocking way)
                asyncio.create_task(self.generate_ai_response(content))

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"]
        }))

    async def generate_ai_response(self, user_message):
        # Generate AI response using OpenAI service
        ai_message = await database_sync_to_async(OpenAIService.generate_response)(
            self.conversation_id, user_message
        )

        if ai_message:
            # Send AI response to chat group
            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    "type": "chat_message",
                    "message": {
                        "id": str(ai_message.id),
                        "content": ai_message.content,
                        "sender_type": ai_message.sender_type,
                        "created_at": ai_message.created_at.isoformat()
                    }
                }
            )
```

## 2.3 Design API

Trong phần này, chúng ta sẽ thiết kế chi tiết các API của hệ thống, bao gồm các endpoints, phương thức, tham số, và phản hồi.

### 2.3.1 User Service API

#### Authentication API

##### Login

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Description**: Đăng nhập và trả về JWT token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "PATIENT",
      "is_active": true,
      "date_joined": "2023-01-01T12:00:00Z",
      "last_login": "2023-06-15T08:30:00Z"
    }
  }
  ```

##### Refresh Token

- **URL**: `/api/auth/refresh`
- **Method**: `POST`
- **Description**: Làm mới JWT token
- **Request Body**:
  ```json
  {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
  ```
- **Response**:
  ```json
  {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
  ```

##### Logout

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Description**: Đăng xuất và vô hiệu hóa token
- **Request Body**:
  ```json
  {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
  ```
- **Response**: `205 Reset Content`

#### User API

##### List Users

- **URL**: `/api/users`
- **Method**: `GET`
- **Description**: Lấy danh sách người dùng
- **Parameters**:
  - `role` (query, optional): Lọc theo vai trò
  - `is_active` (query, optional): Lọc theo trạng thái hoạt động
  - `search` (query, optional): Tìm kiếm theo email, tên, họ
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "PATIENT",
      "is_active": true,
      "date_joined": "2023-01-01T12:00:00Z",
      "last_login": "2023-06-15T08:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "doctor@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "DOCTOR",
      "is_active": true,
      "date_joined": "2023-01-02T10:00:00Z",
      "last_login": "2023-06-14T09:15:00Z"
    }
  ]
  ```

##### Create User

- **URL**: `/api/users`
- **Method**: `POST`
- **Description**: Tạo người dùng mới
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "securepassword",
    "first_name": "Alice",
    "last_name": "Johnson",
    "role": "NURSE"
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "email": "newuser@example.com",
    "first_name": "Alice",
    "last_name": "Johnson",
    "role": "NURSE",
    "is_active": true,
    "date_joined": "2023-06-16T14:30:00Z",
    "last_login": null
  }
  ```

##### Get User

- **URL**: `/api/users/{id}`
- **Method**: `GET`
- **Description**: Lấy thông tin người dùng
- **Parameters**:
  - `id` (path): ID của người dùng
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "PATIENT",
    "is_active": true,
    "date_joined": "2023-01-01T12:00:00Z",
    "last_login": "2023-06-15T08:30:00Z"
  }
  ```

##### Update User

- **URL**: `/api/users/{id}`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin người dùng
- **Parameters**:
  - `id` (path): ID của người dùng
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Smith",
    "email": "johnsmith@example.com",
    "is_active": true
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "johnsmith@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "role": "PATIENT",
    "is_active": true,
    "date_joined": "2023-01-01T12:00:00Z",
    "last_login": "2023-06-15T08:30:00Z"
  }
  ```

##### Delete User

- **URL**: `/api/users/{id}`
- **Method**: `DELETE`
- **Description**: Xóa người dùng (soft delete)
- **Parameters**:
  - `id` (path): ID của người dùng
- **Response**: `204 No Content`

##### Get Current User

- **URL**: `/api/users/me`
- **Method**: `GET`
- **Description**: Lấy thông tin người dùng hiện tại
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "PATIENT",
    "is_active": true,
    "date_joined": "2023-01-01T12:00:00Z",
    "last_login": "2023-06-15T08:30:00Z"
  }
  ```

##### Change Password

- **URL**: `/api/users/change-password`
- **Method**: `POST`
- **Description**: Đổi mật khẩu
- **Request Body**:
  ```json
  {
    "old_password": "currentpassword",
    "new_password": "newpassword"
  }
  ```
- **Response**:
  ```json
  {
    "status": "password set"
  }
  ```

#### Patient Profile API

##### List Patient Profiles

- **URL**: `/api/profiles/patients`
- **Method**: `GET`
- **Description**: Lấy danh sách hồ sơ bệnh nhân
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "patient@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "PATIENT"
      },
      "date_of_birth": "1980-05-15",
      "gender": "MALE",
      "blood_type": "A+",
      "height": 175,
      "weight": 70,
      "allergies": "Penicillin",
      "emergency_contact_name": "Jane Doe",
      "emergency_contact_phone": "+1234567890",
      "age": 43,
      "bmi": 22.9,
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-06-15T08:30:00Z"
    }
  ]
  ```

##### Create Patient Profile

- **URL**: `/api/profiles/patients`
- **Method**: `POST`
- **Description**: Tạo hồ sơ bệnh nhân mới
- **Request Body**:
  ```json
  {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "date_of_birth": "1980-05-15",
    "gender": "MALE",
    "blood_type": "A+",
    "height": 175,
    "weight": 70,
    "allergies": "Penicillin",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+1234567890"
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "patient@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "PATIENT"
    },
    "date_of_birth": "1980-05-15",
    "gender": "MALE",
    "blood_type": "A+",
    "height": 175,
    "weight": 70,
    "allergies": "Penicillin",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+1234567890",
    "age": 43,
    "bmi": 22.9,
    "created_at": "2023-06-16T14:30:00Z",
    "updated_at": "2023-06-16T14:30:00Z"
  }
  ```

##### Get Patient Profile

- **URL**: `/api/profiles/patients/{id}`
- **Method**: `GET`
- **Description**: Lấy thông tin hồ sơ bệnh nhân
- **Parameters**:
  - `id` (path): ID của hồ sơ bệnh nhân
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "patient@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "PATIENT"
    },
    "date_of_birth": "1980-05-15",
    "gender": "MALE",
    "blood_type": "A+",
    "height": 175,
    "weight": 70,
    "allergies": "Penicillin",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+1234567890",
    "age": 43,
    "bmi": 22.9,
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-06-15T08:30:00Z"
  }
  ```

##### Update Patient Profile

- **URL**: `/api/profiles/patients/{id}`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin hồ sơ bệnh nhân
- **Parameters**:
  - `id` (path): ID của hồ sơ bệnh nhân
- **Request Body**:
  ```json
  {
    "height": 176,
    "weight": 72,
    "allergies": "Penicillin, Peanuts",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+1234567890"
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "patient@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "PATIENT"
    },
    "date_of_birth": "1980-05-15",
    "gender": "MALE",
    "blood_type": "A+",
    "height": 176,
    "weight": 72,
    "allergies": "Penicillin, Peanuts",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+1234567890",
    "age": 43,
    "bmi": 23.2,
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-06-16T15:45:00Z"
  }
  ```

### 2.3.2 Medical Record Service API

#### Medical Record API

##### List Medical Records

- **URL**: `/api/medical-records`
- **Method**: `GET`
- **Description**: Lấy danh sách hồ sơ y tế
- **Parameters**:
  - `patient_id` (query, optional): Lọc theo ID bệnh nhân
  - `status` (query, optional): Lọc theo trạng thái
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "patient_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "ACTIVE",
      "notes": "Patient has a history of hypertension",
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-06-15T08:30:00Z",
      "encounters_count": 5
    }
  ]
  ```

##### Create Medical Record

- **URL**: `/api/medical-records`
- **Method**: `POST`
- **Description**: Tạo hồ sơ y tế mới
- **Request Body**:
  ```json
  {
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ACTIVE",
    "notes": "Patient has a history of hypertension"
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ACTIVE",
    "notes": "Patient has a history of hypertension",
    "created_at": "2023-06-16T14:30:00Z",
    "updated_at": "2023-06-16T14:30:00Z",
    "encounters_count": 0
  }
  ```

##### Get Medical Record

- **URL**: `/api/medical-records/{id}`
- **Method**: `GET`
- **Description**: Lấy thông tin hồ sơ y tế
- **Parameters**:
  - `id` (path): ID của hồ sơ y tế
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ACTIVE",
    "notes": "Patient has a history of hypertension",
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-06-15T08:30:00Z",
    "encounters_count": 5
  }
  ```

##### Update Medical Record

- **URL**: `/api/medical-records/{id}`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin hồ sơ y tế
- **Parameters**:
  - `id` (path): ID của hồ sơ y tế
- **Request Body**:
  ```json
  {
    "status": "ACTIVE",
    "notes": "Patient has a history of hypertension and diabetes"
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ACTIVE",
    "notes": "Patient has a history of hypertension and diabetes",
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-06-16T15:45:00Z",
    "encounters_count": 5
  }
  ```

##### Get Medical Record Encounters

- **URL**: `/api/medical-records/{id}/encounters`
- **Method**: `GET`
- **Description**: Lấy danh sách các lần khám của hồ sơ y tế
- **Parameters**:
  - `id` (path): ID của hồ sơ y tế
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "medical_record": "550e8400-e29b-41d4-a716-446655440020",
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "encounter_date": "2023-06-01T10:00:00Z",
      "encounter_type": "OFFICE_VISIT",
      "reason": "Annual check-up",
      "status": "COMPLETED",
      "notes": "Patient is in good health",
      "created_at": "2023-06-01T10:00:00Z",
      "updated_at": "2023-06-01T11:30:00Z",
      "diagnoses_count": 1
    }
  ]
  ```

##### Get Medical Record Allergies

- **URL**: `/api/medical-records/{id}/allergies`
- **Method**: `GET`
- **Description**: Lấy danh sách các dị ứng của hồ sơ y tế
- **Parameters**:
  - `id` (path): ID của hồ sơ y tế
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "medical_record": "550e8400-e29b-41d4-a716-446655440020",
      "allergen": "Penicillin",
      "reaction": "Rash",
      "severity": "MODERATE",
      "diagnosed_date": "2020-05-15",
      "notes": "Avoid all penicillin-based antibiotics"
    }
  ]
  ```

##### Get Medical Record Medications

- **URL**: `/api/medical-records/{id}/medications`
- **Method**: `GET`
- **Description**: Lấy danh sách các thuốc của hồ sơ y tế
- **Parameters**:
  - `id` (path): ID của hồ sơ y tế
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "medical_record": "550e8400-e29b-41d4-a716-446655440020",
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "prescribed_by": "550e8400-e29b-41d4-a716-446655440001",
      "prescribed_date": "2023-06-01",
      "start_date": "2023-06-02",
      "end_date": "2023-12-01",
      "is_current": true,
      "notes": "Take in the morning with food"
    }
  ]
  ```

#### Encounter API

##### List Encounters

- **URL**: `/api/encounters`
- **Method**: `GET`
- **Description**: Lấy danh sách các lần khám
- **Parameters**:
  - `medical_record` (query, optional): Lọc theo ID hồ sơ y tế
  - `doctor_id` (query, optional): Lọc theo ID bác sĩ
  - `status` (query, optional): Lọc theo trạng thái
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "medical_record": "550e8400-e29b-41d4-a716-446655440020",
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "encounter_date": "2023-06-01T10:00:00Z",
      "encounter_type": "OFFICE_VISIT",
      "reason": "Annual check-up",
      "status": "COMPLETED",
      "notes": "Patient is in good health",
      "created_at": "2023-06-01T10:00:00Z",
      "updated_at": "2023-06-01T11:30:00Z",
      "diagnoses_count": 1
    }
  ]
  ```

##### Create Encounter

- **URL**: `/api/encounters`
- **Method**: `POST`
- **Description**: Tạo lần khám mới
- **Request Body**:
  ```json
  {
    "medical_record": "550e8400-e29b-41d4-a716-446655440020",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "encounter_date": "2023-06-15T10:00:00Z",
    "encounter_type": "OFFICE_VISIT",
    "reason": "Follow-up",
    "status": "SCHEDULED",
    "notes": "Follow-up for hypertension"
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440031",
    "medical_record": "550e8400-e29b-41d4-a716-446655440020",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "encounter_date": "2023-06-15T10:00:00Z",
    "encounter_type": "OFFICE_VISIT",
    "reason": "Follow-up",
    "status": "SCHEDULED",
    "notes": "Follow-up for hypertension",
    "created_at": "2023-06-10T14:30:00Z",
    "updated_at": "2023-06-10T14:30:00Z",
    "diagnoses_count": 0
  }
  ```

##### Get Encounter

- **URL**: `/api/encounters/{id}`
- **Method**: `GET`
- **Description**: Lấy thông tin lần khám
- **Parameters**:
  - `id` (path): ID của lần khám
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440030",
    "medical_record": "550e8400-e29b-41d4-a716-446655440020",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "encounter_date": "2023-06-01T10:00:00Z",
    "encounter_type": "OFFICE_VISIT",
    "reason": "Annual check-up",
    "status": "COMPLETED",
    "notes": "Patient is in good health",
    "created_at": "2023-06-01T10:00:00Z",
    "updated_at": "2023-06-01T11:30:00Z",
    "diagnoses_count": 1
  }
  ```

##### Update Encounter

- **URL**: `/api/encounters/{id}`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin lần khám
- **Parameters**:
  - `id` (path): ID của lần khám
- **Request Body**:
  ```json
  {
    "status": "COMPLETED",
    "notes": "Patient's blood pressure is now under control"
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440031",
    "medical_record": "550e8400-e29b-41d4-a716-446655440020",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "encounter_date": "2023-06-15T10:00:00Z",
    "encounter_type": "OFFICE_VISIT",
    "reason": "Follow-up",
    "status": "COMPLETED",
    "notes": "Patient's blood pressure is now under control",
    "created_at": "2023-06-10T14:30:00Z",
    "updated_at": "2023-06-15T11:45:00Z",
    "diagnoses_count": 0
  }
  ```

##### Get Encounter Diagnoses

- **URL**: `/api/encounters/{id}/diagnoses`
- **Method**: `GET`
- **Description**: Lấy danh sách các chẩn đoán của lần khám
- **Parameters**:
  - `id` (path): ID của lần khám
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440060",
      "encounter": "550e8400-e29b-41d4-a716-446655440030",
      "diagnosis_code": "I10",
      "diagnosis_name": "Essential (primary) hypertension",
      "diagnosis_date": "2023-06-01",
      "diagnosed_by": "550e8400-e29b-41d4-a716-446655440001",
      "severity": "MODERATE",
      "notes": "Blood pressure is 140/90 mmHg",
      "created_at": "2023-06-01T11:00:00Z",
      "updated_at": "2023-06-01T11:00:00Z",
      "treatments_count": 1
    }
  ]
  ```

##### Get Encounter Vital Signs

- **URL**: `/api/encounters/{id}/vital-signs`
- **Method**: `GET`
- **Description**: Lấy danh sách các dấu hiệu sinh tồn của lần khám
- **Parameters**:
  - `id` (path): ID của lần khám
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440070",
      "encounter": "550e8400-e29b-41d4-a716-446655440030",
      "vital_type": "BLOOD_PRESSURE",
      "value": "140/90",
      "unit": "mmHg",
      "recorded_at": "2023-06-01T10:15:00Z",
      "recorded_by": "550e8400-e29b-41d4-a716-446655440003",
      "notes": "Measured in right arm, sitting position"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440071",
      "encounter": "550e8400-e29b-41d4-a716-446655440030",
      "vital_type": "HEART_RATE",
      "value": "78",
      "unit": "bpm",
      "recorded_at": "2023-06-01T10:15:00Z",
      "recorded_by": "550e8400-e29b-41d4-a716-446655440003",
      "notes": "Regular rhythm"
    }
  ]
  ```

### 2.3.3 Appointment Service API

#### Doctor Availability API

##### List Doctor Availabilities

- **URL**: `/api/doctor-availability`
- **Method**: `GET`
- **Description**: Lấy danh sách lịch làm việc của bác sĩ
- **Parameters**:
  - `doctor_id` (query, optional): Lọc theo ID bác sĩ
  - `day_of_week` (query, optional): Lọc theo ngày trong tuần (0-6, 0 là thứ hai)
  - `is_active` (query, optional): Lọc theo trạng thái hoạt động
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440080",
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "day_of_week": 1,
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "is_active": true,
      "effective_from": "2023-01-01",
      "effective_to": null,
      "notes": "Regular office hours"
    }
  ]
  ```

##### Create Doctor Availability

- **URL**: `/api/doctor-availability`
- **Method**: `POST`
- **Description**: Tạo lịch làm việc mới cho bác sĩ
- **Request Body**:
  ```json
  {
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "day_of_week": 2,
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "is_active": true,
    "effective_from": "2023-01-01",
    "effective_to": null,
    "notes": "Regular office hours"
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440081",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "day_of_week": 2,
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "is_active": true,
    "effective_from": "2023-01-01",
    "effective_to": null,
    "notes": "Regular office hours"
  }
  ```

##### Get Doctor Availability

- **URL**: `/api/doctor-availability/{id}`
- **Method**: `GET`
- **Description**: Lấy thông tin lịch làm việc của bác sĩ
- **Parameters**:
  - `id` (path): ID của lịch làm việc
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440080",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "day_of_week": 1,
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "is_active": true,
    "effective_from": "2023-01-01",
    "effective_to": null,
    "notes": "Regular office hours"
  }
  ```

##### Update Doctor Availability

- **URL**: `/api/doctor-availability/{id}`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin lịch làm việc của bác sĩ
- **Parameters**:
  - `id` (path): ID của lịch làm việc
- **Request Body**:
  ```json
  {
    "start_time": "10:00:00",
    "end_time": "18:00:00",
    "is_active": true,
    "notes": "Updated office hours"
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440080",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "day_of_week": 1,
    "start_time": "10:00:00",
    "end_time": "18:00:00",
    "is_active": true,
    "effective_from": "2023-01-01",
    "effective_to": null,
    "notes": "Updated office hours"
  }
  ```

##### Get Doctor Availabilities by Doctor

- **URL**: `/api/doctor-availability/by-doctor`
- **Method**: `GET`
- **Description**: Lấy danh sách lịch làm việc của một bác sĩ cụ thể
- **Parameters**:
  - `doctor_id` (query, required): ID của bác sĩ
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440080",
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "day_of_week": 1,
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "is_active": true,
      "effective_from": "2023-01-01",
      "effective_to": null,
      "notes": "Regular office hours"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440081",
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "day_of_week": 2,
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "is_active": true,
      "effective_from": "2023-01-01",
      "effective_to": null,
      "notes": "Regular office hours"
    }
  ]
  ```

##### Get Time Slots for Availability

- **URL**: `/api/doctor-availability/{id}/time-slots`
- **Method**: `GET`
- **Description**: Tạo các khoảng thời gian cho lịch làm việc của bác sĩ vào một ngày cụ thể
- **Parameters**:
  - `id` (path): ID của lịch làm việc
  - `date` (query, required): Ngày cần tạo khoảng thời gian (YYYY-MM-DD)
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440090",
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "date": "2023-06-20",
      "start_time": "09:00:00",
      "end_time": "09:30:00",
      "status": "AVAILABLE"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440091",
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "date": "2023-06-20",
      "start_time": "09:30:00",
      "end_time": "10:00:00",
      "status": "AVAILABLE"
    }
  ]
  ```

#### Appointment API

##### List Appointments

- **URL**: `/api/appointments`
- **Method**: `GET`
- **Description**: Lấy danh sách lịch hẹn
- **Parameters**:
  - `patient_id` (query, optional): Lọc theo ID bệnh nhân
  - `doctor_id` (query, optional): Lọc theo ID bác sĩ
  - `appointment_date` (query, optional): Lọc theo ngày hẹn (YYYY-MM-DD)
  - `status` (query, optional): Lọc theo trạng thái
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "patient_id": "550e8400-e29b-41d4-a716-446655440000",
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "time_slot": "550e8400-e29b-41d4-a716-446655440090",
      "appointment_date": "2023-06-20",
      "start_time": "09:00:00",
      "end_time": "09:30:00",
      "status": "SCHEDULED",
      "cancelled_reason": null,
      "notes": "Annual check-up",
      "created_at": "2023-06-15T10:00:00Z",
      "updated_at": "2023-06-15T10:00:00Z",
      "reason": {
        "reason": "Annual check-up",
        "is_first_visit": false,
        "symptoms": null,
        "duration": null
      }
    }
  ]
  ```

##### Create Appointment

- **URL**: `/api/appointments`
- **Method**: `POST`
- **Description**: Tạo lịch hẹn mới
- **Request Body**:
  ```json
  {
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "time_slot": "550e8400-e29b-41d4-a716-446655440091",
    "appointment_date": "2023-06-20",
    "start_time": "09:30:00",
    "end_time": "10:00:00",
    "notes": "Follow-up appointment",
    "reason": {
      "reason": "Follow-up for hypertension",
      "is_first_visit": false,
      "symptoms": "Occasional headaches",
      "duration": "2 weeks"
    }
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440101",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "time_slot": "550e8400-e29b-41d4-a716-446655440091",
    "appointment_date": "2023-06-20",
    "start_time": "09:30:00",
    "end_time": "10:00:00",
    "status": "SCHEDULED",
    "cancelled_reason": null,
    "notes": "Follow-up appointment",
    "created_at": "2023-06-16T14:30:00Z",
    "updated_at": "2023-06-16T14:30:00Z",
    "reason": {
      "reason": "Follow-up for hypertension",
      "is_first_visit": false,
      "symptoms": "Occasional headaches",
      "duration": "2 weeks"
    }
  }
  ```

##### Get Appointment

- **URL**: `/api/appointments/{id}`
- **Method**: `GET`
- **Description**: Lấy thông tin lịch hẹn
- **Parameters**:
  - `id` (path): ID của lịch hẹn
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "time_slot": "550e8400-e29b-41d4-a716-446655440090",
    "appointment_date": "2023-06-20",
    "start_time": "09:00:00",
    "end_time": "09:30:00",
    "status": "SCHEDULED",
    "cancelled_reason": null,
    "notes": "Annual check-up",
    "created_at": "2023-06-15T10:00:00Z",
    "updated_at": "2023-06-15T10:00:00Z",
    "reason": {
      "reason": "Annual check-up",
      "is_first_visit": false,
      "symptoms": null,
      "duration": null
    }
  }
  ```

##### Update Appointment

- **URL**: `/api/appointments/{id}`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin lịch hẹn
- **Parameters**:
  - `id` (path): ID của lịch hẹn
- **Request Body**:
  ```json
  {
    "status": "CONFIRMED",
    "notes": "Confirmed by patient via phone"
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "time_slot": "550e8400-e29b-41d4-a716-446655440090",
    "appointment_date": "2023-06-20",
    "start_time": "09:00:00",
    "end_time": "09:30:00",
    "status": "CONFIRMED",
    "cancelled_reason": null,
    "notes": "Confirmed by patient via phone",
    "created_at": "2023-06-15T10:00:00Z",
    "updated_at": "2023-06-16T15:45:00Z",
    "reason": {
      "reason": "Annual check-up",
      "is_first_visit": false,
      "symptoms": null,
      "duration": null
    }
  }
  ```

##### Cancel Appointment

- **URL**: `/api/appointments/{id}/cancel`
- **Method**: `POST`
- **Description**: Hủy lịch hẹn
- **Parameters**:
  - `id` (path): ID của lịch hẹn
- **Request Body**:
  ```json
  {
    "reason": "Patient requested cancellation"
  }
  ```
- **Response**:
  ```json
  {
    "status": "appointment cancelled"
  }
  ```

##### Reschedule Appointment

- **URL**: `/api/appointments/{id}/reschedule`
- **Method**: `POST`
- **Description**: Đổi lịch hẹn
- **Parameters**:
  - `id` (path): ID của lịch hẹn
- **Request Body**:
  ```json
  {
    "time_slot_id": "550e8400-e29b-41d4-a716-446655440092"
  }
  ```
- **Response**:
  ```json
  {
    "status": "appointment rescheduled"
  }
  ```

##### Complete Appointment

- **URL**: `/api/appointments/{id}/complete`
- **Method**: `POST`
- **Description**: Đánh dấu lịch hẹn đã hoàn thành
- **Parameters**:
  - `id` (path): ID của lịch hẹn
- **Response**:
  ```json
  {
    "status": "appointment completed"
  }
  ```

##### Mark Appointment as No-Show

- **URL**: `/api/appointments/{id}/no-show`
- **Method**: `POST`
- **Description**: Đánh dấu bệnh nhân không đến
- **Parameters**:
  - `id` (path): ID của lịch hẹn
- **Response**:
  ```json
  {
    "status": "appointment marked as no-show"
  }
  ```

### 2.3.4 Pharmacy Service API

#### Medication API

##### List Medications

- **URL**: `/api/medications`
- **Method**: `GET`
- **Description**: Lấy danh sách thuốc
- **Parameters**:
  - `name` (query, optional): Lọc theo tên thuốc
  - `requires_prescription` (query, optional): Lọc theo yêu cầu kê đơn
  - `is_active` (query, optional): Lọc theo trạng thái hoạt động
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440110",
      "name": "Lisinopril",
      "generic_name": "Lisinopril",
      "description": "Used to treat high blood pressure and heart failure",
      "dosage_form": "Tablet",
      "strength": "10mg",
      "manufacturer": "AstraZeneca",
      "requires_prescription": true,
      "is_active": true,
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-01-01T12:00:00Z"
    }
  ]
  ```

##### Create Medication

- **URL**: `/api/medications`
- **Method**: `POST`
- **Description**: Tạo thuốc mới
- **Request Body**:
  ```json
  {
    "name": "Metformin",
    "generic_name": "Metformin Hydrochloride",
    "description": "Used to treat type 2 diabetes",
    "dosage_form": "Tablet",
    "strength": "500mg",
    "manufacturer": "Merck",
    "requires_prescription": true,
    "is_active": true
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440111",
    "name": "Metformin",
    "generic_name": "Metformin Hydrochloride",
    "description": "Used to treat type 2 diabetes",
    "dosage_form": "Tablet",
    "strength": "500mg",
    "manufacturer": "Merck",
    "requires_prescription": true,
    "is_active": true,
    "created_at": "2023-06-16T14:30:00Z",
    "updated_at": "2023-06-16T14:30:00Z"
  }
  ```

##### Get Medication

- **URL**: `/api/medications/{id}`
- **Method**: `GET`
- **Description**: Lấy thông tin thuốc
- **Parameters**:
  - `id` (path): ID của thuốc
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440110",
    "name": "Lisinopril",
    "generic_name": "Lisinopril",
    "description": "Used to treat high blood pressure and heart failure",
    "dosage_form": "Tablet",
    "strength": "10mg",
    "manufacturer": "AstraZeneca",
    "requires_prescription": true,
    "is_active": true,
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z"
  }
  ```

##### Update Medication

- **URL**: `/api/medications/{id}`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin thuốc
- **Parameters**:
  - `id` (path): ID của thuốc
- **Request Body**:
  ```json
  {
    "description": "Used to treat high blood pressure, heart failure, and diabetic kidney disease",
    "manufacturer": "AstraZeneca Pharmaceuticals",
    "is_active": true
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440110",
    "name": "Lisinopril",
    "generic_name": "Lisinopril",
    "description": "Used to treat high blood pressure, heart failure, and diabetic kidney disease",
    "dosage_form": "Tablet",
    "strength": "10mg",
    "manufacturer": "AstraZeneca Pharmaceuticals",
    "requires_prescription": true,
    "is_active": true,
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-06-16T15:45:00Z"
  }
  ```

##### Search Medications

- **URL**: `/api/medications/search`
- **Method**: `GET`
- **Description**: Tìm kiếm thuốc
- **Parameters**:
  - `query` (query, required): Từ khóa tìm kiếm
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440110",
      "name": "Lisinopril",
      "generic_name": "Lisinopril",
      "description": "Used to treat high blood pressure and heart failure",
      "dosage_form": "Tablet",
      "strength": "10mg",
      "manufacturer": "AstraZeneca",
      "requires_prescription": true,
      "is_active": true
    }
  ]
  ```

##### Check Medication Interactions

- **URL**: `/api/medications/interactions`
- **Method**: `POST`
- **Description**: Kiểm tra tương tác giữa các thuốc
- **Request Body**:
  ```json
  {
    "medication_ids": [
      "550e8400-e29b-41d4-a716-446655440110",
      "550e8400-e29b-41d4-a716-446655440111"
    ]
  }
  ```
- **Response**:
  ```json
  [
    {
      "medication1": {
        "id": "550e8400-e29b-41d4-a716-446655440110",
        "name": "Lisinopril"
      },
      "medication2": {
        "id": "550e8400-e29b-41d4-a716-446655440111",
        "name": "Metformin"
      },
      "severity": "MILD",
      "description": "May cause a small decrease in blood sugar. Monitor blood glucose levels."
    }
  ]
  ```

#### Prescription API

##### List Prescriptions

- **URL**: `/api/prescriptions`
- **Method**: `GET`
- **Description**: Lấy danh sách đơn thuốc
- **Parameters**:
  - `patient_id` (query, optional): Lọc theo ID bệnh nhân
  - `doctor_id` (query, optional): Lọc theo ID bác sĩ
  - `status` (query, optional): Lọc theo trạng thái
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440120",
      "patient_id": "550e8400-e29b-41d4-a716-446655440000",
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "encounter_id": "550e8400-e29b-41d4-a716-446655440030",
      "prescription_date": "2023-06-01",
      "status": "ACTIVE",
      "notes": "Take as directed",
      "created_at": "2023-06-01T11:30:00Z",
      "updated_at": "2023-06-01T11:30:00Z",
      "expiry_date": "2023-12-01",
      "is_refillable": true,
      "refills_remaining": 2,
      "items": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440130",
          "prescription": "550e8400-e29b-41d4-a716-446655440120",
          "medication": "550e8400-e29b-41d4-a716-446655440110",
          "medication_details": {
            "name": "Lisinopril",
            "generic_name": "Lisinopril",
            "dosage_form": "Tablet",
            "strength": "10mg"
          },
          "dosage": "1 tablet",
          "frequency": "Once daily",
          "duration": "6 months",
          "quantity": 180,
          "instructions": "Take in the morning with food"
        }
      ]
    }
  ]
  ```

##### Create Prescription

- **URL**: `/api/prescriptions`
- **Method**: `POST`
- **Description**: Tạo đơn thuốc mới
- **Request Body**:
  ```json
  {
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "encounter_id": "550e8400-e29b-41d4-a716-446655440031",
    "prescription_date": "2023-06-15",
    "notes": "Take as directed",
    "expiry_date": "2023-12-15",
    "is_refillable": true,
    "refills_remaining": 2,
    "items": [
      {
        "medication": "550e8400-e29b-41d4-a716-446655440111",
        "dosage": "1 tablet",
        "frequency": "Twice daily",
        "duration": "3 months",
        "quantity": 180,
        "instructions": "Take with meals"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440121",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "encounter_id": "550e8400-e29b-41d4-a716-446655440031",
    "prescription_date": "2023-06-15",
    "status": "ACTIVE",
    "notes": "Take as directed",
    "created_at": "2023-06-16T14:30:00Z",
    "updated_at": "2023-06-16T14:30:00Z",
    "expiry_date": "2023-12-15",
    "is_refillable": true,
    "refills_remaining": 2,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440131",
        "prescription": "550e8400-e29b-41d4-a716-446655440121",
        "medication": "550e8400-e29b-41d4-a716-446655440111",
        "medication_details": {
          "name": "Metformin",
          "generic_name": "Metformin Hydrochloride",
          "dosage_form": "Tablet",
          "strength": "500mg"
        },
        "dosage": "1 tablet",
        "frequency": "Twice daily",
        "duration": "3 months",
        "quantity": 180,
        "instructions": "Take with meals"
      }
    ]
  }
  ```

##### Get Prescription

- **URL**: `/api/prescriptions/{id}`
- **Method**: `GET`
- **Description**: Lấy thông tin đơn thuốc
- **Parameters**:
  - `id` (path): ID của đơn thuốc
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440120",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "encounter_id": "550e8400-e29b-41d4-a716-446655440030",
    "prescription_date": "2023-06-01",
    "status": "ACTIVE",
    "notes": "Take as directed",
    "created_at": "2023-06-01T11:30:00Z",
    "updated_at": "2023-06-01T11:30:00Z",
    "expiry_date": "2023-12-01",
    "is_refillable": true,
    "refills_remaining": 2,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440130",
        "prescription": "550e8400-e29b-41d4-a716-446655440120",
        "medication": "550e8400-e29b-41d4-a716-446655440110",
        "medication_details": {
          "name": "Lisinopril",
          "generic_name": "Lisinopril",
          "dosage_form": "Tablet",
          "strength": "10mg"
        },
        "dosage": "1 tablet",
        "frequency": "Once daily",
        "duration": "6 months",
        "quantity": 180,
        "instructions": "Take in the morning with food"
      }
    ]
  }
  ```

##### Update Prescription

- **URL**: `/api/prescriptions/{id}`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin đơn thuốc
- **Parameters**:
  - `id` (path): ID của đơn thuốc
- **Request Body**:
  ```json
  {
    "status": "ACTIVE",
    "notes": "Take as directed. Call if any side effects occur.",
    "is_refillable": true,
    "refills_remaining": 1
  }
  ```
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440120",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "encounter_id": "550e8400-e29b-41d4-a716-446655440030",
    "prescription_date": "2023-06-01",
    "status": "ACTIVE",
    "notes": "Take as directed. Call if any side effects occur.",
    "created_at": "2023-06-01T11:30:00Z",
    "updated_at": "2023-06-16T15:45:00Z",
    "expiry_date": "2023-12-01",
    "is_refillable": true,
    "refills_remaining": 1,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440130",
        "prescription": "550e8400-e29b-41d4-a716-446655440120",
        "medication": "550e8400-e29b-41d4-a716-446655440110",
        "medication_details": {
          "name": "Lisinopril",
          "generic_name": "Lisinopril",
          "dosage_form": "Tablet",
          "strength": "10mg"
        },
        "dosage": "1 tablet",
        "frequency": "Once daily",
        "duration": "6 months",
        "quantity": 180,
        "instructions": "Take in the morning with food"
      }
    ]
  }
  ```

##### Verify Prescription

- **URL**: `/api/prescriptions/{id}/verify`
- **Method**: `POST`
- **Description**: Xác minh đơn thuốc
- **Parameters**:
  - `id` (path): ID của đơn thuốc
- **Request Body**:
  ```json
  {
    "verified_by": "550e8400-e29b-41d4-a716-446655440004",
    "notes": "Verified by pharmacist"
  }
  ```
- **Response**:
  ```json
  {
    "status": "prescription verified",
    "verification": {
      "verified_by": "550e8400-e29b-41d4-a716-446655440004",
      "verified_at": "2023-06-16T16:00:00Z",
      "notes": "Verified by pharmacist"
    }
  }
  ```

##### Dispense Prescription

- **URL**: `/api/prescriptions/{id}/dispense`
- **Method**: `POST`
- **Description**: Cấp phát thuốc theo đơn
- **Parameters**:
  - `id` (path): ID của đơn thuốc
- **Request Body**:
  ```json
  {
    "dispensed_by": "550e8400-e29b-41d4-a716-446655440004",
    "notes": "Dispensed by pharmacist",
    "items": [
      {
        "prescription_item_id": "550e8400-e29b-41d4-a716-446655440130",
        "quantity_dispensed": 30
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "status": "prescription dispensed",
    "dispensation": {
      "dispensed_by": "550e8400-e29b-41d4-a716-446655440004",
      "dispensed_at": "2023-06-16T16:15:00Z",
      "notes": "Dispensed by pharmacist",
      "items": [
        {
          "prescription_item_id": "550e8400-e29b-41d4-a716-446655440130",
          "medication": "Lisinopril 10mg",
          "quantity_dispensed": 30,
          "remaining_quantity": 150
        }
      ]
    }
  }
  ```

#### Inventory API

##### List Inventory

- **URL**: `/api/inventory`
- **Method**: `GET`
- **Description**: Lấy danh sách tồn kho thuốc
- **Parameters**:
  - `medication_id` (query, optional): Lọc theo ID thuốc
  - `low_stock` (query, optional): Lọc theo tồn kho thấp
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440140",
      "medication_id": "550e8400-e29b-41d4-a716-446655440110",
      "medication": {
        "name": "Lisinopril",
        "generic_name": "Lisinopril",
        "dosage_form": "Tablet",
        "strength": "10mg"
      },
      "batch_number": "LIS-2023-001",
      "expiry_date": "2025-06-01",
      "quantity": 500,
      "reorder_level": 100,
      "location": "Shelf A-1",
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-06-16T16:15:00Z"
    }
  ]
  ```

##### Get Low Stock Medications

- **URL**: `/api/inventory/low-stock`
- **Method**: `GET`
- **Description**: Lấy danh sách thuốc sắp hết
- **Response**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440141",
      "medication_id": "550e8400-e29b-41d4-a716-446655440111",
      "medication": {
        "name": "Metformin",
        "generic_name": "Metformin Hydrochloride",
        "dosage_form": "Tablet",
        "strength": "500mg"
      },
      "batch_number": "MET-2023-001",
      "expiry_date": "2025-06-01",
      "quantity": 90,
      "reorder_level": 100,
      "location": "Shelf B-2",
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-06-16T16:15:00Z"
    }
  ]
  ```

### 2.3.5 Laboratory Service API

#### Test Type API