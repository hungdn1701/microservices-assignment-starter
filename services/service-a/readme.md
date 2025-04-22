# Service A

## Tổng quan

Service A chịu trách nhiệm [mô tả chức năng cụ thể của Service A, ví dụ: xác thực người dùng hoặc xử lý dữ liệu đầu vào]. Đây là một microservice được xây dựng bằng Flask (Python).

## Cài đặt

- Xây dựng image Docker từ `Dockerfile` có sẵn.
- Mã nguồn nằm trong thư mục `src/`.

## Phát triển

- Định nghĩa API trong file `docs/api-specs/service-a.yaml`.
- Chạy môi trường local:
  ```bash
  docker-compose up --build service-a
  ```
  hoặc
  ```bash
  cd services/service-a
  flask run --port=5001
  ```

## Các endpoint

- **Base URL**: `http://localhost:5001/`
- Tham khảo chi tiết các endpoint và cấu trúc request/response trong `docs/api-specs/service-a.yaml`.

## Các biến môi trường (ví dụ)

- `DATABASE_URL`: URL kết nối PostgreSQL.
- `SECRET_KEY`: Khóa bảo mật cho Flask.
- `REDIS_URL`: Địa chỉ Redis broker (dành cho Celery nếu có).

## Công nghệ chính

- Python 3.x, Flask
- Gunicorn (production)
- PostgreSQL
- Redis (nếu sử dụng Celery)

---

*Đọc thêm hướng dẫn phát triển chung trong thư mục gốc của dự án.*