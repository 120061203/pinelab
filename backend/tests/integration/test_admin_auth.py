"""
管理端點認證測試（401 未認證、403 無權限）
"""
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestAdminAuth:
    """管理端點認證測試"""
    
    def test_admin_endpoint_requires_authentication(self, api_client):
        """測試管理端點需要認證"""
        response = api_client.get('/api/admin/products/')
        
        assert response.status_code == 401
    
    def test_admin_endpoint_with_invalid_token(self, api_client):
        """測試使用無效 token 訪問管理端點"""
        api_client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = api_client.get('/api/admin/products/')
        
        assert response.status_code == 401
    
    def test_admin_endpoint_with_non_staff_user(self, api_client):
        """測試非管理員用戶訪問管理端點"""
        user = User.objects.create_user(
            username='user',
            password='testpass123',
            is_staff=False
        )
        
        api_client.force_authenticate(user=user)
        response = api_client.get('/api/admin/products/')
        
        assert response.status_code == 403
    
    def test_admin_endpoint_with_staff_user(self, authenticated_client):
        """測試管理員用戶訪問管理端點"""
        response = authenticated_client.get('/api/admin/products/')
        
        assert response.status_code == 200
        data = response.json()
        assert 'results' in data.get('data', {})

