"""
JWT 認證模組
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.exceptions import AuthenticationFailed


class PinelabJWTAuthentication(JWTAuthentication):
    """
    自訂 JWT 認證類別
    擴充基礎 JWT 認證功能
    """
    
    def authenticate(self, request):
        """
        驗證 JWT Token
        """
        try:
            return super().authenticate(request)
        except (InvalidToken, TokenError) as e:
            raise AuthenticationFailed('無效的認證 Token')

