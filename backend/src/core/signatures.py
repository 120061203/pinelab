"""
HMAC-SHA256 簽章驗證模組
用於 API 請求簽章生成與驗證
"""
import hmac
import hashlib
from typing import Dict, Any
from django.conf import settings


def generate_signature(params: Dict[str, Any], secret_key: str = None) -> str:
    """
    生成 HMAC-SHA256 簽章
    
    Args:
        params: 請求參數字典
        secret_key: API 密鑰（預設從 settings 讀取）
    
    Returns:
        小寫十六進位字串簽章
    """
    if secret_key is None:
        secret_key = settings.API_SECRET_KEY
    
    # 1. 參數排序（ASCII 順序）
    sorted_params = sorted(params.items())
    
    # 2. 生成查詢字串
    query_string = '&'.join([f"{k}={v}" for k, v in sorted_params if k != 'sign'])
    
    # 3. 加上 secret key
    query_string += f"&key={secret_key}"
    
    # 4. HMAC-SHA256
    signature = hmac.new(
        secret_key.encode('utf-8'),
        query_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return signature


def verify_signature(params: Dict[str, Any], provided_sign: str, secret_key: str = None) -> bool:
    """
    驗證 HMAC-SHA256 簽章
    
    Args:
        params: 請求參數字典（包含 sign 和 timestamp）
        provided_sign: 提供的簽章
        secret_key: API 密鑰（預設從 settings 讀取）
    
    Returns:
        驗證是否通過
    """
    if 'sign' not in params:
        return False
    
    expected_sign = generate_signature(params, secret_key)
    
    # 使用 constant-time 比較避免時間攻擊
    return hmac.compare_digest(expected_sign, provided_sign)

