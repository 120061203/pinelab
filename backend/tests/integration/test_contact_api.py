"""
POST /api/contact/ API 整合測試（含簽章驗證）
"""
import pytest
from django.utils import timezone
from core.signatures import generate_signature
from django.conf import settings


@pytest.mark.django_db
class TestContactAPI:
    """聯絡表單 API 測試"""
    
    def test_submit_contact_with_valid_signature(self, api_client):
        """測試提交聯絡表單（有效簽章）"""
        timestamp = int(timezone.now().timestamp() * 1000)
        params = {
            'name': '測試使用者',
            'email': 'test@example.com',
            'message': '這是一個測試訊息，長度超過10個字元',
            'timestamp': timestamp,
        }
        sign = generate_signature(params)
        params['sign'] = sign
        
        response = api_client.post('/api/contact/', params, format='json')
        
        assert response.status_code == 201
        data = response.json()
        assert data['status'] == 'success'
        assert '聯絡表單已成功提交' in data['data']['message']
    
    def test_submit_contact_without_signature(self, api_client):
        """測試提交聯絡表單（無簽章）"""
        response = api_client.post('/api/contact/', {
            'name': '測試使用者',
            'email': 'test@example.com',
            'message': '這是一個測試訊息，長度超過10個字元',
        }, format='json')
        
        assert response.status_code == 400
        data = response.json()
        assert data['status'] == 'error'
        assert data['code'] == 'MISSING_SIGNATURE'
    
    def test_submit_contact_with_invalid_signature(self, api_client):
        """測試提交聯絡表單（無效簽章）"""
        timestamp = int(timezone.now().timestamp() * 1000)
        response = api_client.post('/api/contact/', {
            'name': '測試使用者',
            'email': 'test@example.com',
            'message': '這是一個測試訊息，長度超過10個字元',
            'sign': 'invalid_signature',
            'timestamp': timestamp,
        }, format='json')
        
        assert response.status_code == 401
        data = response.json()
        assert data['status'] == 'error'
        assert data['code'] == 'INVALID_SIGNATURE'
    
    def test_submit_contact_with_expired_timestamp(self, api_client):
        """測試提交聯絡表單（過期時間戳記）"""
        # 使用 10 分鐘前的时间戳
        expired_timestamp = int(timezone.now().timestamp() * 1000) - (10 * 60 * 1000)
        params = {
            'name': '測試使用者',
            'email': 'test@example.com',
            'message': '這是一個測試訊息，長度超過10個字元',
            'timestamp': expired_timestamp,
        }
        sign = generate_signature(params)
        params['sign'] = sign
        
        response = api_client.post('/api/contact/', params, format='json')
        
        assert response.status_code == 400
        data = response.json()
        assert data['status'] == 'error'
        assert data['code'] == 'TIMESTAMP_EXPIRED'
    
    def test_submit_contact_validation_errors(self, api_client):
        """測試提交聯絡表單（驗證錯誤）"""
        timestamp = int(timezone.now().timestamp() * 1000)
        params = {
            'name': '',  # 空白名稱
            'email': 'invalid-email',  # 無效 email
            'message': '短',  # 訊息太短
            'timestamp': timestamp,
        }
        sign = generate_signature(params)
        params['sign'] = sign
        
        response = api_client.post('/api/contact/', params, format='json')
        
        assert response.status_code == 400
        data = response.json()
        assert data['status'] == 'error'

