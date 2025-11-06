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
        if not request.user or not request.user.is_authenticated:
            return False
        # 允許 is_staff 或 具備角色 admin/editor 的使用者
        try:
            role = getattr(request.user, 'role', None)
            if role in ['admin', 'editor']:
                return True
        except Exception:
            pass
        return bool(getattr(request.user, 'is_staff', False))
