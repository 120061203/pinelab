"""
商品管理 URLs（管理員專用）
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .admin_views import ProductAdminViewSet

router = DefaultRouter()
router.register(r'admin/products', ProductAdminViewSet, basename='admin-product')

urlpatterns = [
    path('', include(router.urls)),
]

