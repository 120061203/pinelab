"""
分類管理 URLs（管理員專用）
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .admin_views import CategoryAdminViewSet

router = DefaultRouter()
router.register(r'admin/categories', CategoryAdminViewSet, basename='admin-category')

urlpatterns = [
    path('', include(router.urls)),
]

