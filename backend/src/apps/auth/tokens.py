"""
自定義 JWT Token 類別
支援身份切換功能
"""
from rest_framework_simplejwt.tokens import RefreshToken


class ImpersonationRefreshToken(RefreshToken):
    """
    支援身份切換的 RefreshToken
    在 token 中添加 impersonate_role 和 original_user_id claims
    """
    
    @classmethod
    def for_user_with_impersonation(cls, user, impersonate_role=None, original_user_id=None):
        """
        為使用者生成帶有身份切換信息的 token
        
        Args:
            user: 當前使用者（可能是被模擬的使用者）
            impersonate_role: 要模擬的角色（'editor' 或 'analyst'）
            original_user_id: 原始管理員的 ID（如果正在模擬）
        """
        token = cls.for_user(user)
        
        # 添加自定義 claims
        if impersonate_role:
            token['impersonate_role'] = impersonate_role
        if original_user_id:
            token['original_user_id'] = original_user_id
        
        # 在 access token 中也添加這些 claims
        token.access_token['impersonate_role'] = impersonate_role if impersonate_role else None
        token.access_token['original_user_id'] = original_user_id if original_user_id else None
        
        return token

