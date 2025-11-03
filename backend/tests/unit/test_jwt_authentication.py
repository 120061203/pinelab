"""
JWT 認證測試
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.mark.django_db
class TestJWTAuthentication:
    """JWT 認證測試"""
    
    def test_generate_jwt_token(self):
        """測試生成 JWT token"""
        user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            is_staff=True
        )
        
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        assert access_token is not None
        assert str(refresh) is not None
        
        # 驗證 token 包含用戶資訊
        assert access_token['user_id'] == user.id
    
    def test_jwt_token_for_staff_user(self):
        """測試管理員用戶的 JWT token"""
        staff_user = User.objects.create_user(
            username='staff',
            password='testpass123',
            is_staff=True
        )
        
        refresh = RefreshToken.for_user(staff_user)
        access_token = refresh.access_token
        
        assert access_token['user_id'] == staff_user.id
    
    def test_token_contains_user_info(self):
        """測試 token 包含用戶資訊"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            is_staff=True
        )
        
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        assert access_token['user_id'] == user.id
        assert 'token_type' in access_token

