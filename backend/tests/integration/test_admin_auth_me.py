"""
測試認證相關端點
注意：當前實現中，login 端點已返回用戶信息，無需額外的 /api/auth/me/ 端點
"""
import pytest
from rest_framework import status


@pytest.mark.django_db
class TestAuthMe:
    """測試認證端點（login 返回用戶信息）"""
    
    def test_login_returns_user_info(self, api_client, admin_user):
        """測試 login 端點返回用戶信息（替代 /api/auth/me/ 功能）"""
        response = api_client.post('/api/auth/login/', {
            'username': 'admin',
            'password': 'testpassword123',
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data['status'] == 'success'
        assert 'data' in data
        assert 'user' in data['data']
        assert data['data']['user']['id'] == admin_user.id
        assert data['data']['user']['username'] == admin_user.username
        assert data['data']['user']['email'] == admin_user.email
        assert 'access' in data['data']
        assert 'refresh' in data['data']
    
    def test_login_fails_with_invalid_credentials(self, api_client):
        """測試無效憑證登入失敗"""
        response = api_client.post('/api/auth/login/', {
            'username': 'invalid',
            'password': 'wrongpassword',
        })
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert data['status'] == 'error'
        assert data['code'] == 'INVALID_CREDENTIALS'
    
    def test_login_fails_with_non_admin(self, api_client):
        """測試非管理員無法登入"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        regular_user = User.objects.create_user(
            username='regular',
            password='testpassword123',
            is_staff=False,
        )
        
        response = api_client.post('/api/auth/login/', {
            'username': 'regular',
            'password': 'testpassword123',
        })
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        data = response.json()
        assert data['status'] == 'error'
        assert data['code'] == 'NOT_ADMIN'

