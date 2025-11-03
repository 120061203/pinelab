"""
URL configuration for pinelab project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.auth.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.categories.urls')),
    path('api/', include('apps.tags.urls')),
    path('api/', include('apps.contacts.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

