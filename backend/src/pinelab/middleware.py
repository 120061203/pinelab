"""
自訂 Middleware
"""
import logging
import time
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    請求日誌記錄中間件
    記錄所有 API 請求的詳細資訊
    """
    
    def process_request(self, request):
        """請求開始時記錄"""
        request._start_time = time.time()
        
        # 只記錄 API 請求
        if request.path.startswith('/api/'):
            logger.info(
                f"API Request: {request.method} {request.path} - "
                f"User: {getattr(request.user, 'username', 'Anonymous')}"
            )
    
    def process_response(self, request, response):
        """請求結束時記錄"""
        if request.path.startswith('/api/'):
            duration = 0
            if hasattr(request, '_start_time'):
                duration = (time.time() - request._start_time) * 1000  # 轉為毫秒
            
            logger.info(
                f"API Response: {request.method} {request.path} - "
                f"Status: {response.status_code} - "
                f"Duration: {duration:.2f}ms"
            )
        
        return response

