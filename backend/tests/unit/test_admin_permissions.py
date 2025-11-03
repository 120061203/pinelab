"""
管理員權限測試
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from core.permissions import IsAdminUser, IsPublicEndpoint

User = get_user_model()


@pytest.mark.django_db
class TestAdminPermissions:
    """管理員權限測試"""
    
    def test_is_admin_user_allows_staff(self):
        """測試管理員權限允許 is_staff 用戶"""
        user = User.objects.create_user(
            username='admin',
            password='testpass123',
            is_staff=True
        )
        
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = user
        
        permission = IsAdminUser()
        
        assert permission.has_permission(request, None) is True
    
    def test_is_admin_user_denies_non_staff(self):
        """測試管理員權限拒絕非管理員用戶"""
        user = User.objects.create_user(
            username='user',
            password='testpass123',
            is_staff=False
        )
        
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = user
        
        permission = IsAdminUser()
        
        assert permission.has_permission(request, None) is False
    
    def test_is_admin_user_denies_unauthenticated(self):
        """測試管理員權限拒絕未認證用戶"""
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = None
        
        permission = IsAdminUser()
        
        assert permission.has_permission(request, None) is False
    
    def test_is_public_endpoint_allows_all(self):
        """測試公開端點允許所有用戶"""
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = None
        
        permission = IsPublicEndpoint()
        
        assert permission.has_permission(request, None) is True

