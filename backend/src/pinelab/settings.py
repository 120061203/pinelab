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

# ALLOWED_HOSTS configuration
# 在生產環境中，必須明確設定 ALLOWED_HOSTS 環境變數
allowed_hosts_env = os.getenv('ALLOWED_HOSTS')
if allowed_hosts_env:
    # 處理每個主機名，自動移除協議前綴（http:// 或 https://）
    hosts = []
    for host in allowed_hosts_env.split(','):
        host = host.strip()
        if not host:
            continue
        # 如果包含協議，提取主機名（保留端口）
        if host.startswith('http://') or host.startswith('https://'):
            parsed = urlparse(host)
            # 保留端口信息（如果有的話）
            if parsed.port:
                host = f"{parsed.hostname}:{parsed.port}"
            else:
                host = parsed.hostname or host.replace('http://', '').replace('https://', '').split('/')[0]
        hosts.append(host)
    ALLOWED_HOSTS = hosts
    
    # 在開發環境中，如果包含 localhost，自動添加常見的端口變體
    if DEBUG:
        if 'localhost' in ALLOWED_HOSTS or '*' in ALLOWED_HOSTS:
            # 添加常見的 localhost 端口變體
            common_ports = ['8000', '3000', '8080']
            for port in common_ports:
                localhost_with_port = f'localhost:{port}'
                if localhost_with_port not in ALLOWED_HOSTS:
                    ALLOWED_HOSTS.append(localhost_with_port)
else:
    # 開發環境預設值
    if DEBUG:
        ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'localhost:8000', 'localhost:3000', '*']
    else:
        # 生產環境：如果沒有設定 ALLOWED_HOSTS，嘗試從 Zeabur 環境變數推斷
        # Zeabur 可能會提供 ZEABUR_SERVICE_URL 或類似環境變數
        zeabur_domain = os.getenv('ZEABUR_SERVICE_URL') or os.getenv('ZEABUR_DOMAIN')
        if zeabur_domain:
            # 從 URL 提取域名
            from urllib.parse import urlparse
            parsed = urlparse(zeabur_domain) if zeabur_domain.startswith('http') else None
            if parsed:
                ALLOWED_HOSTS = [parsed.hostname]
            else:
                ALLOWED_HOSTS = [zeabur_domain]
        else:
            # 如果無法推斷，使用通配符（僅在無法確定域名時使用）
            # 警告：這不是最佳實踐，應該明確設定 ALLOWED_HOSTS
            import warnings
            warnings.warn(
                'ALLOWED_HOSTS is not set in production environment. '
                'Please set ALLOWED_HOSTS environment variable to include your backend domain. '
                'Using "*" as fallback (not recommended for production).',
                UserWarning
            )
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
    'django_filters',
    
    # Local apps
    'apps.products',
    'apps.categories',
    'apps.tags',
    'apps.contacts',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # 必須在 SecurityMiddleware 之後
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
    # 支援 postgresql:// 和 postgres:// 兩種格式
    parsed = urlparse(DATABASE_URL)
    # 確保從 DATABASE_URL 解析的值優先使用，只有在解析失敗時才使用單個環境變數
    db_name = parsed.path[1:] if parsed.path and len(parsed.path) > 1 else None
    db_user = parsed.username
    db_password = parsed.password
    db_host = parsed.hostname
    db_port = parsed.port
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': db_name or os.getenv('DB_NAME', 'pinelab_db'),
            'USER': db_user or os.getenv('DB_USER', 'pinelab_user'),
            'PASSWORD': db_password or os.getenv('DB_PASSWORD', 'pinelab_password'),
            'HOST': db_host or os.getenv('DB_HOST', 'localhost'),
            'PORT': str(db_port) if db_port else os.getenv('DB_PORT', '5432'),
        }
    }
    # 在啟動時輸出資料庫配置資訊（不包含密碼）
    if not DEBUG or os.getenv('SHOW_DB_CONFIG', 'False').lower() == 'true':
        print(f"✓ Database configured from DATABASE_URL")
        print(f"  Host: {db_host or 'N/A'}")
        print(f"  Port: {db_port or 'N/A'}")
        print(f"  Database: {db_name or 'N/A'}")
        print(f"  User: {db_user or 'N/A'}")
else:
    # 使用單個環境變數（向後兼容）
    # 注意：在 Zeabur 上，如果沒有 DATABASE_URL，DB_HOST 必須是實際的主機名，不能是 "postgresql"
    db_host = os.getenv('DB_HOST', 'localhost')
    db_name = os.getenv('DB_NAME', 'pinelab_db')
    db_user = os.getenv('DB_USER', 'pinelab_user')
    db_port = os.getenv('DB_PORT', '5432')
    
    if db_host == 'postgresql':
        # 在 Zeabur 上，"postgresql" 無法解析，必須使用 DATABASE_URL 或實際主機名
        print("=" * 80)
        print("⚠️  WARNING: Database Configuration Issue")
        print("=" * 80)
        print("DB_HOST is set to 'postgresql' which cannot be resolved.")
        print("")
        print("To fix this issue, please do ONE of the following:")
        print("")
        print("Option 1 (Recommended): Use DATABASE_URL")
        print("  - In Zeabur backend service, add DATABASE_URL environment variable")
        print("  - Format: postgresql://user:password@host:port/database")
        print("  - You can find this in your PostgreSQL service's connection info")
        print("")
        print("Option 2: Use the actual database hostname")
        print("  - Remove DB_HOST=postgresql")
        print("  - Set DB_HOST to the actual hostname from Zeabur PostgreSQL service")
        print("  - Check the PostgreSQL service's 'Network' or 'Settings' tab")
        print("=" * 80)
        print("")
        # 仍然嘗試使用，但會失敗並產生明確的錯誤
        import sys
        sys.stderr.write("ERROR: Cannot connect to database with DB_HOST='postgresql'\n")
        sys.stderr.write("Please configure DATABASE_URL or use the correct DB_HOST.\n")
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': db_name,
            'USER': db_user,
            'PASSWORD': os.getenv('DB_PASSWORD', 'pinelab_password'),
            'HOST': db_host,
            'PORT': db_port,
        }
    }
    # 在啟動時輸出資料庫配置資訊
    if not DEBUG or os.getenv('SHOW_DB_CONFIG', 'False').lower() == 'true':
        print(f"✓ Database configured from individual environment variables")
        print(f"  Host: {db_host}")
        print(f"  Port: {db_port}")
        print(f"  Database: {db_name}")
        print(f"  User: {db_user}")

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
# STATIC_ROOT 路徑計算：
# BASE_DIR = backend/src/pinelab/settings.py 的 parent.parent.parent
# 在 Docker 中：__file__ = /app/src/pinelab/settings.py
#   parent = /app/src/pinelab/
#   parent.parent = /app/src/
#   parent.parent.parent = /app/
# 所以 BASE_DIR = /app/
# STATIC_ROOT 應該在 /app/staticfiles
# 可以通過環境變數 STATIC_ROOT 覆蓋（可選，通常不需要）
# 如果設置了環境變數，使用環境變數；否則使用默認路徑
STATIC_ROOT = os.getenv('STATIC_ROOT', str(BASE_DIR / 'staticfiles'))

# 確保 staticfiles 目錄存在（在啟動時創建，避免 WhiteNoise 警告）
# 注意：這個目錄會在 Dockerfile 和 collectstatic 中創建，這裡只是確保啟動時存在
staticfiles_dir = Path(STATIC_ROOT)
if not staticfiles_dir.exists():
    try:
        staticfiles_dir.mkdir(parents=True, exist_ok=True)
    except (OSError, PermissionError):
        # 如果無法創建（可能是權限問題），collectstatic 會處理
        pass

# WhiteNoise configuration for serving static files
# 使用 WhiteNoise 在生產環境中提供靜態文件（不需要 Nginx）
# 注意：CompressedManifestStaticFilesStorage 需要先運行 collectstatic
# 如果 collectstatic 失敗，可以暫時改用 CompressedStaticFilesStorage
if os.getenv('USE_COMPRESSED_MANIFEST', 'False').lower() == 'true':
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
else:
    # 使用更寬鬆的配置，即使沒有運行 collectstatic 也能工作
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# WhiteNoise 設定：確保靜態文件正確提供
# 這些設定確保 WhiteNoise 能夠正確處理靜態文件請求
# 注意：WhiteNoise 會自動從 STATIC_ROOT 提供靜態文件，不需要額外配置
WHITENOISE_USE_FINDERS = DEBUG  # 只在開發環境中使用 finders
WHITENOISE_AUTOREFRESH = DEBUG  # 在開發環境中自動刷新
WHITENOISE_MANIFEST_STRICT = False  # 如果找不到 manifest 文件，不報錯

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

# CSRF Settings
CSRF_TRUSTED_ORIGINS = os.getenv(
    'CSRF_TRUSTED_ORIGINS',
    'http://localhost:3000'
).split(',')

# 如果在生產環境，自動添加 ZEABUR_WEB_URL
if not DEBUG:
    zeabur_url = os.getenv('ZEABUR_WEB_URL')
    if zeabur_url:
        # 確保 zeabur_url 不在列表中才添加
        if zeabur_url not in CSRF_TRUSTED_ORIGINS:
            CSRF_TRUSTED_ORIGINS.append(zeabur_url)
    # 如果沒有 ZEABUR_WEB_URL，嘗試從 ALLOWED_HOSTS 推斷
    elif ALLOWED_HOSTS and ALLOWED_HOSTS != ['*']:
        # 將 ALLOWED_HOSTS 中的域名轉換為完整的 URL
        for host in ALLOWED_HOSTS:
            if host and host != '*':
                # 判斷是生產環境（通常包含 .zeabur.app）
                if '.zeabur.app' in host or not host.startswith('localhost'):
                    trusted_url = f'https://{host}'
                    if trusted_url not in CSRF_TRUSTED_ORIGINS:
                        CSRF_TRUSTED_ORIGINS.append(trusted_url)

# API Secret Key for HMAC-SHA256
API_SECRET_KEY = os.getenv('API_SECRET_KEY', 'change-me-in-production')

