# Common Authentication Library

Thư viện xác thực chung cho tất cả các service trong hệ thống y tế.

## Cài đặt

```bash
# Từ thư mục gốc của dự án
cd common-auth
pip install -e .
```

## Sử dụng

Trong file settings.py của mỗi service:

```python
INSTALLED_APPS = [
    # ...
    'common_auth',
    # ...
]

# Cấu hình xác thực
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'common_auth.authentication.ServiceAuthentication',
    ],
    # ...
}
```

Trong file views.py hoặc permissions.py:

```python
from common_auth.permissions import IsAuthenticated, HasRole, HasResourceAccess

class MyView(APIView):
    permission_classes = [IsAuthenticated, HasRole(['DOCTOR', 'NURSE'])]
    # ...
```
