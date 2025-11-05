"""
Django settings for pinelab project.
"""

from pathlib import Path
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables
load_dotenv(BASE_DIR.parent.parent / '.env')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

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
    'django_filters',
    
    # Local apps
    'apps.products',
    'apps.categories',
    'apps.tags',
    'apps.contacts',
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
    'pinelab.middleware.RequestLoggingMiddleware',  # 自訂請求日誌
]

ROOT_URLCONF = 'pinelab.urls'

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

WSGI_APPLICATION = 'pinelab.wsgi.application'

# Database
# 優先使用 DATABASE_URL（Zeabur 等平台提供），否則使用單個環境變數
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    # 解析 DATABASE_URL: postgresql://user:password@host:port/database
    parsed = urlparse(DATABASE_URL)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': parsed.path[1:] if parsed.path else os.getenv('DB_NAME', 'pinelab_db'),  # 移除前導斜線
            'USER': parsed.username or os.getenv('DB_USER', 'pinelab_user'),
            'PASSWORD': parsed.password or os.getenv('DB_PASSWORD', 'pinelab_password'),
            'HOST': parsed.hostname or os.getenv('DB_HOST', 'localhost'),
            'PORT': parsed.port or os.getenv('DB_PORT', '5432'),
        }
    }
else:
    # 使用單個環境變數（向後兼容）
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'pinelab_db'),
            'USER': os.getenv('DB_USER', 'pinelab_user'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'pinelab_password'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

# Password validation
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
LANGUAGE_CODE = 'zh-tw'
TIME_ZONE = 'Asia/Taipei'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR.parent.parent / 'staticfiles'

# Media files
MEDIA_ROOT = BASE_DIR.parent.parent / 'media'
MEDIA_URL = '/media/'

# Logging configuration
# 在容器環境中只使用 console logging（由 Docker/Zeabur 收集）
# 本地開發環境如果 logs 目錄存在，則額外使用文件日誌
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'pinelab': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# 只在本地開發環境且 logs 目錄存在時使用文件日誌
if DEBUG and os.path.exists('/app/logs'):
    LOGGING['handlers']['file'] = {
        'class': 'logging.FileHandler',
        'filename': '/app/logs/django.log',
        'formatter': 'verbose',
    }
    LOGGING['loggers']['django']['handlers'].append('file')
    LOGGING['loggers']['pinelab']['handlers'].append('file')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model (使用 Django 內建 User)
# AUTH_USER_MODEL = 'auth.User'  # 暫時使用 Django 預設 User

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_HOURS', 24))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': os.getenv('JWT_SECRET_KEY', SECRET_KEY),
}

# CORS Settings
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000'
).split(',')

CORS_ALLOW_CREDENTIALS = True

# API Secret Key for HMAC-SHA256
API_SECRET_KEY = os.getenv('API_SECRET_KEY', 'change-me-in-production')

