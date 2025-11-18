"""
網站設定公開 API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteSettingsViewSet, NewsViewSet, ServiceViewSet

router = DefaultRouter()
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')
router.register(r'news', NewsViewSet, basename='news')
router.register(r'services', ServiceViewSet, basename='service')

urlpatterns = [
    path('', include(router.urls)),
]

