"""
POST /api/auth/login/ API 整合測試
"""
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestAuthLogin:
    """登入 API 測試"""
    
    def test_login_with_valid_credentials(self, api_client):
        """測試使用有效憑證登入"""
        user = User.objects.create_user(
            username='admin',
            password='testpass123',
            is_staff=True
        )
        
        response = api_client.post('/api/auth/login/', {
            'username': 'admin',
            'password': 'testpass123',
        }, format='json')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert 'access' in data['data']
        assert 'refresh' in data['data']
        assert 'user' in data['data']
        assert data['data']['user']['username'] == 'admin'
    
    def test_login_with_invalid_credentials(self, api_client):
        """測試使用無效憑證登入"""
        User.objects.create_user(
            username='admin',
            password='testpass123',
            is_staff=True
        )
        
        response = api_client.post('/api/auth/login/', {
            'username': 'admin',
            'password': 'wrongpassword',
        }, format='json')
        
        assert response.status_code == 401
        data = response.json()
        assert data['status'] == 'error'
        assert data['code'] == 'INVALID_CREDENTIALS'
    
    def test_login_with_missing_credentials(self, api_client):
        """測試缺少憑證時登入"""
        response = api_client.post('/api/auth/login/', {
            'username': 'admin',
        }, format='json')
        
        assert response.status_code == 400
        data = response.json()
        assert data['status'] == 'error'
        assert data['code'] == 'MISSING_CREDENTIALS'
    
    def test_login_with_non_staff_user(self, api_client):
        """測試非管理員用戶登入"""
        User.objects.create_user(
            username='user',
            password='testpass123',
            is_staff=False
        )
        
        response = api_client.post('/api/auth/login/', {
            'username': 'user',
            'password': 'testpass123',
        }, format='json')
        
        assert response.status_code == 403
        data = response.json()
        assert data['status'] == 'error'
        assert data['code'] == 'NOT_ADMIN'

