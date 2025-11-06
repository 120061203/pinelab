"""
URL configuration for pinelab project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from .health import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    # 健康檢查
    path('api/health/', health_check, name='health'),
    # 公開 API
    path('api/', include('apps.auth.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.categories.urls')),
    path('api/', include('apps.tags.urls')),
    path('api/', include('apps.contacts.urls')),
    # 管理員 API
    path('api/', include('apps.categories.admin_urls')),
    path('api/', include('apps.tags.admin_urls')),
    path('api/', include('apps.products.admin_urls')),
    path('api/', include('apps.contacts.admin_urls')),
]

# Serve media files
# 在開發環境通過 Django 提供媒體文件
# 在生產環境，應該使用 WhiteNoise 或 Nginx 提供媒體文件
# 注意：Zeabur 等平台需要配置持久化儲存卷，否則文件會在容器重啟後丟失
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # 生產環境：使用 WhiteNoise 提供媒體文件（如果配置了持久化儲存）
    # 或者使用外部儲存服務（推薦：AWS S3, Cloudinary 等）
    from django.views.static import serve
    from django.urls import re_path
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]

