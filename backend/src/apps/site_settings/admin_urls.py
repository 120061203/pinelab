"""
網站設定管理 API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .admin_views import (
    SiteSettingsAdminViewSet,
    NewsAdminViewSet,
    ServiceAdminViewSet
)

router = DefaultRouter()
router.register(r'site-settings', SiteSettingsAdminViewSet, basename='admin-site-settings')
router.register(r'news', NewsAdminViewSet, basename='admin-news')
router.register(r'services', ServiceAdminViewSet, basename='admin-service')

urlpatterns = [
    path('', include(router.urls)),
]

