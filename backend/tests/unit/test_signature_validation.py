"""
HMAC-SHA256 簽章驗證測試
"""
import pytest
from django.utils import timezone
from core.signatures import generate_signature, verify_signature
from django.conf import settings


class TestSignatureValidation:
    """簽章驗證測試"""
    
    def test_generate_signature(self):
        """測試生成簽章"""
        params = {
            'name': '測試',
            'email': 'test@example.com',
            'message': '測試訊息',
        }
        
        signature = generate_signature(params)
        
        assert signature is not None
        assert len(signature) == 64  # SHA256 十六進位字串長度
        assert isinstance(signature, str)
    
    def test_verify_valid_signature(self):
        """測試驗證有效簽章"""
        params = {
            'name': '測試',
            'email': 'test@example.com',
            'message': '測試訊息',
        }
        signature = generate_signature(params)
        params['sign'] = signature
        
        assert verify_signature(params, signature) is True
    
    def test_verify_invalid_signature(self):
        """測試驗證無效簽章"""
        params = {
            'name': '測試',
            'email': 'test@example.com',
            'message': '測試訊息',
        }
        signature = generate_signature(params)
        
        # 使用錯誤的簽章
        assert verify_signature(params, 'invalid_signature') is False
    
    def test_signature_with_different_params(self):
        """測試不同參數產生不同簽章"""
        params1 = {'name': '測試1', 'email': 'test1@example.com'}
        params2 = {'name': '測試2', 'email': 'test2@example.com'}
        
        sig1 = generate_signature(params1)
        sig2 = generate_signature(params2)
        
        assert sig1 != sig2
    
    def test_signature_deterministic(self):
        """測試簽章確定性（相同參數產生相同簽章）"""
        params = {
            'name': '測試',
            'email': 'test@example.com',
        }
        
        sig1 = generate_signature(params)
        sig2 = generate_signature(params)
        
        assert sig1 == sig2
    
    def test_signature_parameter_ordering(self):
        """測試參數順序不影響簽章（會自動排序）"""
        params1 = {'name': '測試', 'email': 'test@example.com'}
        params2 = {'email': 'test@example.com', 'name': '測試'}
        
        sig1 = generate_signature(params1)
        sig2 = generate_signature(params2)
        
        assert sig1 == sig2  # 應該相同，因為會自動排序

