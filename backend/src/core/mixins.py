"""
通用 Mixins
"""
from rest_framework.response import Response
from rest_framework import status


class StandardResponseMixin:
    """
    標準回應 Mixin
    統一所有 API 回應格式為 {'status': 'success', 'data': ...}
    """
    
    def list(self, request, *args, **kwargs):
        """覆寫 list 方法以統一回應格式"""
        response = super().list(request, *args, **kwargs)
        # 如果已經使用 StandardResultsSetPagination，回應格式已正確
        if response.status_code == 200 and 'data' not in response.data:
            return Response({
                'status': 'success',
                'data': response.data,
            }, status=response.status_code)
        return response
    
    def retrieve(self, request, *args, **kwargs):
        """覆寫 retrieve 方法以統一回應格式"""
        response = super().retrieve(request, *args, **kwargs)
        if response.status_code == 200 and 'data' not in response.data:
            return Response({
                'status': 'success',
                'data': response.data,
            }, status=response.status_code)
        return response
    
    def create(self, request, *args, **kwargs):
        """覆寫 create 方法以統一回應格式"""
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201 and 'data' not in response.data:
            return Response({
                'status': 'success',
                'data': response.data,
            }, status=response.status_code)
        return response
    
    def update(self, request, *args, **kwargs):
        """覆寫 update 方法以統一回應格式"""
        response = super().update(request, *args, **kwargs)
        if response.status_code == 200 and 'data' not in response.data:
            return Response({
                'status': 'success',
                'data': response.data,
            }, status=response.status_code)
        return response
    
    def destroy(self, request, *args, **kwargs):
        """覆寫 destroy 方法以統一回應格式"""
        response = super().destroy(request, *args, **kwargs)
        if response.status_code == 204:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return response

