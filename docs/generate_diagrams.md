# Hướng dẫn tạo hình ảnh diagram

Tài liệu này hướng dẫn cách tạo hình ảnh diagram từ các file PlantUML trong thư mục `docs/assets/diagrams/puml`.

## Yêu cầu

- Java Runtime Environment (JRE) phiên bản 8 trở lên
- Kết nối internet (để tải PlantUML jar nếu chưa có)

## Cấu trúc thư mục

Các file PlantUML được tổ chức theo loại diagram:

```
docs/assets/diagrams/puml/
├── architecture/  # Các diagram kiến trúc
├── usecase/      # Các diagram use case
├── sequence/      # Các diagram sequence
├── activity/      # Các diagram activity
├── class/         # Các diagram class
└── erd/           # Các diagram entity-relationship
```

Các hình ảnh được tạo ra sẽ được lưu trong thư mục `docs/assets/diagrams/images/`.

## Các bước thực hiện

1. Mở terminal và di chuyển đến thư mục gốc của dự án:

```bash
cd /đường/dẫn/đến/microservices-assignment-starter
```

2. Cấp quyền thực thi cho script:

```bash
chmod +x scripts/generate_diagrams.sh
```

3. Chạy script để tạo hình ảnh:

   a. Tạo tất cả các diagram:

   ```bash
   ./scripts/generate_diagrams.sh
   ```

   b. Tạo tất cả các diagram của một loại cụ thể:

   ```bash
   ./scripts/generate_diagrams.sh architecture  # Tạo tất cả các diagram kiến trúc
   ```

   c. Tạo một diagram cụ thể (chỉ định tên file):

   ```bash
   ./scripts/generate_diagrams.sh architecture/architecture  # Tạo diagram kiến trúc tổng quan
   ```

   hoặc

   ```bash
   ./scripts/generate_diagrams.sh architecture/architecture.puml
   ```

   d. Tạo một diagram bất kỳ (script sẽ tìm kiếm trong tất cả các thư mục):

   ```bash
   ./scripts/generate_diagrams.sh architecture  # Tìm và tạo file architecture.puml trong bất kỳ thư mục nào
   ```

4. Kiểm tra kết quả:

Script sẽ tạo các file hình ảnh PNG trong thư mục `docs/assets/diagrams/images/`.

## Chỉnh sửa diagram

Nếu bạn muốn chỉnh sửa các diagram, hãy chỉnh sửa các file PlantUML tương ứng trong thư mục tương ứng:

- Kiến trúc: `docs/assets/diagrams/puml/architecture/`
- Use case: `docs/assets/diagrams/puml/usecase/`
- Sequence: `docs/assets/diagrams/puml/sequence/`
- Activity: `docs/assets/diagrams/puml/activity/`
- Class: `docs/assets/diagrams/puml/class/`
- ERD: `docs/assets/diagrams/puml/erd/`

Sau khi chỉnh sửa, chạy lại script để tạo hình ảnh mới:

```bash
./scripts/generate_diagrams.sh architecture/architecture  # Chỉ tạo lại diagram đã chỉnh sửa
```

## Tạo diagram mới

Để tạo một diagram mới, hãy làm theo các bước sau:

1. Tạo file PlantUML mới trong thư mục tương ứng, ví dụ tạo một ERD cho User Service:

```bash
touch docs/assets/diagrams/puml/erd/user_service.puml
```

2. Chỉnh sửa file với nội dung PlantUML phù hợp. Ví dụ cho một sơ đồ ER:

```
@startuml
title Mô hình dữ liệu - User Service

entity "User" as user {
  *id: UUID <<PK>>
  --
  *email: string
  *first_name: string
  *last_name: string
  *role: enum
  *is_active: boolean
  *date_joined: datetime
}

entity "PatientProfile" as patient {
  *id: UUID <<PK>>
  --
  *user_id: UUID <<FK>>
  *date_of_birth: date
  *gender: enum
  *blood_type: enum
  *height: float
  *weight: float
}

entity "DoctorProfile" as doctor {
  *id: UUID <<PK>>
  --
  *user_id: UUID <<FK>>
  *specialty: string
  *license_number: string
  *years_of_experience: integer
}

user ||--o| patient
user ||--o| doctor

@enduml
```

3. Tạo hình ảnh từ file PlantUML mới:

```bash
./scripts/generate_diagrams.sh erd/user_service
```

4. Hình ảnh sẽ được tạo trong thư mục `docs/assets/diagrams/images/` với tên `user_service.png`

5. Bạn có thể tham chiếu đến hình ảnh này trong tài liệu Markdown:

```markdown
![Mô hình dữ liệu User Service](assets/diagrams/images/user_service.png)
```

## Các loại diagram và công dụng

| Loại diagram | Thư mục | Công dụng |
|----------------|-----------|------------|
| Architecture | architecture/ | Mô tả kiến trúc tổng quan của hệ thống |
| Use Case | usecase/ | Mô tả các tác nhân và chức năng của hệ thống |
| Sequence | sequence/ | Mô tả luồng tương tác giữa các đối tượng theo thời gian |
| Activity | activity/ | Mô tả luồng công việc và quy trình |
| Class | class/ | Mô tả cấu trúc tĩnh của hệ thống, các lớp và mối quan hệ |
| ERD | erd/ | Mô tả cấu trúc dữ liệu và mối quan hệ giữa các thực thể |

## Tài liệu tham khảo

- [PlantUML Documentation](https://plantuml.com/guide)
- [PlantUML Sequence Diagram](https://plantuml.com/sequence-diagram)
- [PlantUML Use Case Diagram](https://plantuml.com/use-case-diagram)
- [PlantUML Component Diagram](https://plantuml.com/component-diagram)
- [PlantUML Class Diagram](https://plantuml.com/class-diagram)
- [PlantUML Entity Relationship Diagram](https://plantuml.com/ie-diagram)
- [PlantUML Activity Diagram](https://plantuml.com/activity-diagram-beta)
