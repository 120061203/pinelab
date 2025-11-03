"""
標籤管理 URLs（管理員專用）
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .admin_views import TagAdminViewSet

router = DefaultRouter()
router.register(r'admin/tags', TagAdminViewSet, basename='admin-tag')

urlpatterns = [
    path('', include(router.urls)),
]

