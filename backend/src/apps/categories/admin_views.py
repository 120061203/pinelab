"""
分類管理 API Views（管理員專用）
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category
from .serializers import CategorySerializer
from core.permissions import IsAdminUser


class CategoryAdminViewSet(viewsets.ModelViewSet):
    """
    分類管理 ViewSet（管理員專用）
    支援 CRUD 操作
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """管理員可以查看所有分類（包括未啟用的）"""
        return Category.objects.all()
    
    def create(self, request, *args, **kwargs):
        """建立分類，統一響應格式"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({
                'status': 'success',
                'data': serializer.data,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # 處理唯一性約束錯誤（例如重複的分類名稱）
            error_message = str(e)
            if 'unique' in error_message.lower() or 'already exists' in error_message.lower():
                return Response({
                    'status': 'error',
                    'code': 'DUPLICATE_NAME',
                    'message': '分類名稱已存在，請使用不同的名稱',
                }, status=status.HTTP_400_BAD_REQUEST)
            # 重新拋出其他異常，讓 DRF 處理
            raise
    
    def update(self, request, *args, **kwargs):
        """更新分類，統一響應格式"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        """刪除分類，統一響應格式"""
        instance = self.get_object()
        # 檢查是否有商品使用此分類
        if instance.products.exists():
            return Response({
                'status': 'error',
                'code': 'CATEGORY_IN_USE',
                'message': '此分類正在被商品使用，無法刪除',
            }, status=status.HTTP_400_BAD_REQUEST)
        self.perform_destroy(instance)
        return Response({
            'status': 'success',
            'data': {'message': '分類已刪除'},
        }, status=status.HTTP_200_OK)
    
    def list(self, request, *args, **kwargs):
        """列表查詢，統一響應格式"""
        response = super().list(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data.get('results', []) if isinstance(response.data, dict) and 'results' in response.data else response.data,
                'count': response.data.get('count', len(response.data)) if isinstance(response.data, dict) else len(response.data) if isinstance(response.data, list) else 0,
                'next': response.data.get('next') if isinstance(response.data, dict) else None,
                'previous': response.data.get('previous') if isinstance(response.data, dict) else None,
            })
        return response
    
    def retrieve(self, request, *args, **kwargs):
        """單一查詢，統一響應格式"""
        response = super().retrieve(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data,
            })
        return response

