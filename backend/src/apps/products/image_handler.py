"""
商品圖片處理邏輯
處理圖片路徑驗證、儲存路徑生成等功能
"""
import os
from django.conf import settings
from django.core.exceptions import ValidationError
from urllib.parse import urlparse


def validate_image_url(image_url: str) -> bool:
    """
    驗證圖片 URL/路徑格式
    
    Args:
        image_url: 圖片 URL 或相對路徑
        
    Returns:
        是否為有效格式
    """
    if not image_url or not isinstance(image_url, str):
        return False
    
    # 允許相對路徑（如 /media/products/image.jpg）
    if image_url.startswith('/'):
        # 檢查路徑格式
        if not image_url.startswith('/media/'):
            return False
        return True
    
    # 允許完整 URL（如 http://example.com/image.jpg）
    try:
        parsed = urlparse(image_url)
        if parsed.scheme in ('http', 'https'):
            return True
    except Exception:
        pass
    
    return False


def generate_image_path(filename: str, product_id: int) -> str:
    """
    生成圖片儲存路徑
    
    Args:
        filename: 原始檔名
        product_id: 商品 ID
        
    Returns:
        相對路徑（如 /media/products/1/image.jpg）
    """
    # 確保檔名安全（移除路徑分隔符）
    safe_filename = os.path.basename(filename)
    
    # 生成路徑：/media/products/{product_id}/{filename}
    return f'/media/products/{product_id}/{safe_filename}'


def get_full_image_url(image_url: str, request=None) -> str:
    """
    取得完整圖片 URL
    
    Args:
        image_url: 相對路徑或完整 URL
        request: Django request 物件（用於生成完整 URL）
        
    Returns:
        完整 URL
    """
    if not image_url:
        return ''
    
    # 如果是完整 URL，直接返回
    if image_url.startswith('http://') or image_url.startswith('https://'):
        return image_url
    
    # 如果是相對路徑，生成完整 URL
    if request:
        return request.build_absolute_uri(image_url)
    
    # 沒有 request 時，使用 MEDIA_URL
    media_url = getattr(settings, 'MEDIA_URL', '/media/')
    if not image_url.startswith(media_url):
        return f'{media_url.rstrip("/")}{image_url}'
    
    return image_url


def clean_image_url(image_url: str) -> str:
    """
    清理圖片 URL（移除多餘空白、修正路徑）
    
    Args:
        image_url: 原始圖片 URL
        
    Returns:
        清理後的 URL
    """
    if not image_url:
        return ''
    
    # 移除前後空白
    cleaned = image_url.strip()
    
    # 正規化路徑分隔符
    cleaned = cleaned.replace('\\', '/')
    
    # 移除重複的斜線
    while '//' in cleaned and not cleaned.startswith('http://') and not cleaned.startswith('https://'):
        cleaned = cleaned.replace('//', '/')
    
    return cleaned

