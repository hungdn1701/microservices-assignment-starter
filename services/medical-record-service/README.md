# Medical Record Service

Medical Record Service là một microservice trong hệ thống Healthcare, cung cấp các API để quản lý hồ sơ y tế của bệnh nhân.

## Tính năng

- Quản lý hồ sơ y tế của bệnh nhân
- Quản lý chẩn đoán, điều trị, dị ứng, tiêm chủng, lịch sử bệnh án, thuốc, dấu hiệu sinh tồn, xét nghiệm và kết quả xét nghiệm
- Phân quyền dựa trên vai trò người dùng (bệnh nhân, bác sĩ, y tá, quản trị viên)
- Giao tiếp với User Service thông qua API Gateway

## Cài đặt

### Yêu cầu

- Docker và Docker Compose
- PostgreSQL
- Redis

### Cài đặt và chạy

1. Clone repository:

```bash
git clone <repository-url>
cd healthcare
```

2. Build và chạy service:

```bash
docker-compose build medical-record-service
docker-compose up -d medical-record-service
```

Service sẽ chạy trên port 8001.

## API Endpoints

### Medical Records

- `GET /api/medical-records/`: Lấy danh sách hồ sơ y tế
- `POST /api/medical-records/`: Tạo mới hồ sơ y tế
- `GET /api/medical-records/{id}/`: Lấy thông tin chi tiết của hồ sơ y tế
- `PUT /api/medical-records/{id}/`: Cập nhật hồ sơ y tế
- `DELETE /api/medical-records/{id}/`: Xóa hồ sơ y tế
- `GET /api/medical-records/{id}/summary/`: Lấy tóm tắt hồ sơ y tế

### Diagnoses

- `GET /api/diagnoses/`: Lấy danh sách chẩn đoán
- `POST /api/diagnoses/`: Tạo mới chẩn đoán
- `GET /api/diagnoses/{id}/`: Lấy thông tin chi tiết của chẩn đoán
- `PUT /api/diagnoses/{id}/`: Cập nhật chẩn đoán
- `DELETE /api/diagnoses/{id}/`: Xóa chẩn đoán

### Treatments

- `GET /api/treatments/`: Lấy danh sách điều trị
- `POST /api/treatments/`: Tạo mới điều trị
- `GET /api/treatments/{id}/`: Lấy thông tin chi tiết của điều trị
- `PUT /api/treatments/{id}/`: Cập nhật điều trị
- `DELETE /api/treatments/{id}/`: Xóa điều trị

### Allergies

- `GET /api/allergies/`: Lấy danh sách dị ứng
- `POST /api/allergies/`: Tạo mới dị ứng
- `GET /api/allergies/{id}/`: Lấy thông tin chi tiết của dị ứng
- `PUT /api/allergies/{id}/`: Cập nhật dị ứng
- `DELETE /api/allergies/{id}/`: Xóa dị ứng

### Immunizations

- `GET /api/immunizations/`: Lấy danh sách tiêm chủng
- `POST /api/immunizations/`: Tạo mới tiêm chủng
- `GET /api/immunizations/{id}/`: Lấy thông tin chi tiết của tiêm chủng
- `PUT /api/immunizations/{id}/`: Cập nhật tiêm chủng
- `DELETE /api/immunizations/{id}/`: Xóa tiêm chủng

### Medical Histories

- `GET /api/medical-histories/`: Lấy danh sách lịch sử bệnh án
- `POST /api/medical-histories/`: Tạo mới lịch sử bệnh án
- `GET /api/medical-histories/{id}/`: Lấy thông tin chi tiết của lịch sử bệnh án
- `PUT /api/medical-histories/{id}/`: Cập nhật lịch sử bệnh án
- `DELETE /api/medical-histories/{id}/`: Xóa lịch sử bệnh án

### Medications

- `GET /api/medications/`: Lấy danh sách thuốc
- `POST /api/medications/`: Tạo mới thuốc
- `GET /api/medications/{id}/`: Lấy thông tin chi tiết của thuốc
- `PUT /api/medications/{id}/`: Cập nhật thuốc
- `DELETE /api/medications/{id}/`: Xóa thuốc

### Vital Signs

- `GET /api/vital-signs/`: Lấy danh sách dấu hiệu sinh tồn
- `POST /api/vital-signs/`: Tạo mới dấu hiệu sinh tồn
- `GET /api/vital-signs/{id}/`: Lấy thông tin chi tiết của dấu hiệu sinh tồn
- `PUT /api/vital-signs/{id}/`: Cập nhật dấu hiệu sinh tồn
- `DELETE /api/vital-signs/{id}/`: Xóa dấu hiệu sinh tồn

### Lab Tests

- `GET /api/lab-tests/`: Lấy danh sách xét nghiệm
- `POST /api/lab-tests/`: Tạo mới xét nghiệm
- `GET /api/lab-tests/{id}/`: Lấy thông tin chi tiết của xét nghiệm
- `PUT /api/lab-tests/{id}/`: Cập nhật xét nghiệm
- `DELETE /api/lab-tests/{id}/`: Xóa xét nghiệm

### Lab Results

- `GET /api/lab-results/`: Lấy danh sách kết quả xét nghiệm
- `POST /api/lab-results/`: Tạo mới kết quả xét nghiệm
- `GET /api/lab-results/{id}/`: Lấy thông tin chi tiết của kết quả xét nghiệm
- `PUT /api/lab-results/{id}/`: Cập nhật kết quả xét nghiệm
- `DELETE /api/lab-results/{id}/`: Xóa kết quả xét nghiệm

## Phân quyền

- **Bệnh nhân**: Chỉ có thể xem hồ sơ y tế của chính mình
- **Bác sĩ**: Có thể xem và cập nhật hồ sơ y tế của bất kỳ bệnh nhân nào
- **Y tá**: Có thể xem hồ sơ y tế của bất kỳ bệnh nhân nào và cập nhật một số thông tin nhất định
- **Quản trị viên**: Có toàn quyền truy cập

## Giao tiếp với các service khác

Medical Record Service giao tiếp với các service khác thông qua API Gateway:

- **User Service**: Để lấy thông tin người dùng và xác thực token
- **Appointment Service**: Để lấy thông tin lịch hẹn
- **Billing Service**: Để lấy thông tin hóa đơn
- **Pharmacy Service**: Để lấy thông tin thuốc
- **Lab Service**: Để lấy thông tin xét nghiệm

## Phát triển

### Cấu trúc thư mục

```
medical-record-service/
├── core/                  # Cấu hình Django
├── records/               # Ứng dụng quản lý hồ sơ y tế
│   ├── migrations/        # Migrations
│   ├── models.py          # Models
│   ├── serializers.py     # Serializers
│   ├── views.py           # Views
│   ├── urls.py            # URLs
│   ├── permissions.py     # Permissions
│   └── services.py        # Services
├── Dockerfile             # Dockerfile
├── entrypoint.sh          # Entrypoint script
├── manage.py              # Django manage.py
└── requirements.txt       # Dependencies
```

### Thêm model mới

1. Thêm model mới vào `records/models.py`
2. Tạo serializer mới trong `records/serializers.py`
3. Tạo view mới trong `records/views.py`
4. Thêm URL mới vào `records/urls.py`
5. Chạy migrations:

```bash
docker-compose exec medical-record-service python manage.py makemigrations
docker-compose exec medical-record-service python manage.py migrate
```

### Kiểm thử

Để chạy unit tests:

```bash
docker-compose exec medical-record-service python manage.py test
```

## Troubleshooting

### Cấu trúc Database

Hệ thống sử dụng một instance PostgreSQL duy nhất với nhiều database riêng biệt cho từng service:

- **healthcare_default**: Database mặc định của PostgreSQL
- **healthcare_user**: Database cho User Service
- **healthcare_medical**: Database cho Medical Record Service
- **healthcare_appointment**: Database cho Appointment Service (nếu có)
- **healthcare_billing**: Database cho Billing Service (nếu có)
- **healthcare_pharmacy**: Database cho Pharmacy Service (nếu có)
- **healthcare_lab**: Database cho Laboratory Service (nếu có)

### Lỗi kết nối đến cơ sở dữ liệu

Nếu gặp lỗi kết nối đến cơ sở dữ liệu, hãy kiểm tra:

1. PostgreSQL đã chạy chưa:

```bash
docker-compose ps postgres
```

2. Cơ sở dữ liệu đã được tạo chưa:

```bash
docker-compose exec postgres psql -U postgres -c "\l"
```

3. Nếu cơ sở dữ liệu chưa được tạo, hãy tạo thủ công:

```bash
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE healthcare_medical;"
```

### Lỗi migrations

Nếu gặp lỗi migrations, hãy thử:

```bash
docker-compose exec medical-record-service python manage.py makemigrations records
docker-compose exec medical-record-service python manage.py migrate
```

## Liên hệ

Nếu có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ với chúng tôi qua email: [email@example.com](mailto:email@example.com)
