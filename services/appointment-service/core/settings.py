import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_yasg',
    'common_auth',
    # Local apps
    'appointments',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DATABASE_NAME', 'healthcare_appointments'),
        'USER': os.environ.get('DATABASE_USER', 'postgres'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD', 'postgres'),
        'HOST': os.environ.get('DATABASE_HOST', 'postgres'),
        'PORT': os.environ.get('DATABASE_PORT', '5432'),
    }
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:4000'
).split(',')

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'common_auth.authentication.ServiceAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'common_auth.permissions.IsAuthenticated',
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'EXCEPTION_HANDLER': 'appointments.exception_handlers.appointment_exception_handler',
}

# API Gateway URL
API_GATEWAY_URL = os.environ.get('API_GATEWAY_URL', 'http://api-gateway:8000')

# Common Auth settings
REDIS_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/0')

# Đặt JWT_SECRET cố định để đảm bảo nhất quán với các service khác
JWT_SECRET = 'healthcare_jwt_secret_key_2025'

# Disable JWT signature verification for testing
VERIFY_JWT_SIGNATURE = False  # Tạm thời tắt xác thực chữ ký JWT để debug

# JWT Settings
ACCESS_TOKEN_LIFETIME = timedelta(minutes=60)
REFRESH_TOKEN_LIFETIME = timedelta(days=7)
ROTATE_REFRESH_TOKENS = False
SESSION_TTL = 86400  # 1 day in seconds
MAX_SESSIONS_PER_USER = 5

# Appointment Reminder Config - Thời gian tính bằng giờ trước khi lịch hẹn diễn ra
APPOINTMENT_REMINDERS = [
    {'hours': 24, 'type': 'EMAIL', 'message_template': 'Nhắc nhở: Bạn có lịch hẹn khám bệnh với {doctor_name} vào ngày {date} lúc {time} {location}.'},
    {'hours': 3, 'type': 'EMAIL', 'message_template': 'Nhắc nhở: Lịch hẹn của bạn với {doctor_name} sẽ diễn ra trong vòng 3 giờ nữa {location}.'},
    {'hours': 1, 'type': 'SMS', 'message_template': 'Nhắc nhở gấp: Bạn có lịch hẹn khám bệnh với {doctor_name} trong vòng 1 giờ nữa {location}. Vui lòng đến sớm 15 phút để chuẩn bị.'},
]

# Tích hợp với các service khác
SERVICE_INTEGRATIONS = {
    'USER_SERVICE_URL': os.environ.get('USER_SERVICE_URL', 'http://user-service:8000'),
    'MEDICAL_RECORD_SERVICE_URL': os.environ.get('MEDICAL_RECORD_SERVICE_URL', 'http://medical-record-service:8000'),
    'NOTIFICATION_SERVICE_URL': os.environ.get('NOTIFICATION_SERVICE_URL', 'http://notification-service:8000'),
    'BILLING_SERVICE_URL': os.environ.get('BILLING_SERVICE_URL', 'http://billing-service:8000'),
    'PHARMACY_SERVICE_URL': os.environ.get('PHARMACY_SERVICE_URL', 'http://pharmacy-service:8000'),
    'LABORATORY_SERVICE_URL': os.environ.get('LABORATORY_SERVICE_URL', 'http://laboratory-service:8000'),
}

# Cấu hình retry cho các API call tích hợp
API_RETRY_CONFIG = {
    'MAX_RETRIES': 3,
    'RETRY_DELAY': 1,  # seconds
    'TIMEOUT': 5,  # seconds
}

# Swagger UI JWT auth configuration
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"',
        },
    },
    'USE_SESSION_AUTH': False,
}
