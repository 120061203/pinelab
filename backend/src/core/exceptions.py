"""
自訂例外處理
"""
from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    自訂 API 例外處理器
    統一返回格式：{'status': 'error', 'code': 'ERROR_CODE', 'message': '...'}
    """
    # 先使用 DRF 預設例外處理器
    response = exception_handler(exc, context)
    
    if response is not None:
        # 統一錯誤格式
        custom_response_data = {
            'status': 'error',
            'code': response.status_code,
            'message': '發生錯誤',
        }
        
        # 如果有詳細錯誤訊息，加入
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                custom_response_data['message'] = exc.detail
            elif isinstance(exc.detail, list):
                custom_response_data['message'] = exc.detail[0] if exc.detail else '發生錯誤'
            else:
                custom_response_data['message'] = str(exc.detail)
        elif hasattr(exc, 'message'):
            custom_response_data['message'] = str(exc.message)
        
        response.data = custom_response_data
    
    return response
