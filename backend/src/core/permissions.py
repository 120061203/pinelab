"""
權限控制模組
"""
from rest_framework import permissions


class IsPublicEndpoint(permissions.BasePermission):
    """
    公開端點權限（允許未認證用戶訪問）
    用於商品列表、商品詳情、分類、標籤等公開 API
    """
    def has_permission(self, request, view):
        return True


class IsAdminUser(permissions.BasePermission):
    """
    管理員權限
    只有 is_staff=True 的用戶才能訪問
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        )
