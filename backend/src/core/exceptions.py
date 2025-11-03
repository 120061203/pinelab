"""
自訂例外處理
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    自訂例外處理器，統一錯誤回應格式
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'status': 'error',
            'code': response.data.get('code', 'UNKNOWN_ERROR'),
            'message': response.data.get('detail', '發生錯誤'),
            'errors': response.data
        }
        
        # 處理驗證錯誤
        if isinstance(response.data, dict) and 'detail' not in response.data:
            custom_response_data['errors'] = response.data
        
        return Response(custom_response_data, status=response.status_code)
    
    return response

