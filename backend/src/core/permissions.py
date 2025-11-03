"""
權限控制模組
"""
from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    檢查使用者是否為管理員
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        )


class IsPublicEndpoint(permissions.BasePermission):
    """
    公開端點，無需認證
    """
    
    def has_permission(self, request, view):
        return True

