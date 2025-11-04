"""
標籤管理 API Views（管理員專用）
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Tag
from .serializers import TagSerializer
from core.permissions import IsAdminUser


class TagAdminViewSet(viewsets.ModelViewSet):
    """
    標籤管理 ViewSet（管理員專用）
    支援 CRUD 操作
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminUser]
    
    def create(self, request, *args, **kwargs):
        """建立標籤，統一響應格式"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({
                'status': 'success',
                'data': serializer.data,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # 處理唯一性約束錯誤
            error_message = str(e)
            
            # 檢查是否是驗證錯誤（DRF serializer validation）
            if hasattr(e, 'detail'):
                # DRF 驗證錯誤
                if isinstance(e.detail, dict):
                    # 檢查是否是 name 或 slug 的唯一性錯誤
                    if 'name' in e.detail:
                        name_error = e.detail['name']
                        if isinstance(name_error, list) and any('unique' in str(err).lower() for err in name_error):
                            return Response({
                                'status': 'error',
                                'code': 'DUPLICATE_NAME',
                                'message': '標籤名稱已存在，請使用不同的名稱',
                            }, status=status.HTTP_400_BAD_REQUEST)
                    if 'slug' in e.detail:
                        slug_error = e.detail['slug']
                        if isinstance(slug_error, list) and any('unique' in str(err).lower() for err in slug_error):
                            return Response({
                                'status': 'error',
                                'code': 'DUPLICATE_SLUG',
                                'message': '標籤名稱產生的 slug 已存在，請使用不同的名稱',
                            }, status=status.HTTP_400_BAD_REQUEST)
            
            # 檢查資料庫唯一性約束錯誤
            if 'unique' in error_message.lower() or 'already exists' in error_message.lower() or 'duplicate' in error_message.lower():
                # 判斷是 name 還是 slug 的錯誤
                if 'name' in error_message.lower() or 'tags_name' in error_message.lower():
                    return Response({
                        'status': 'error',
                        'code': 'DUPLICATE_NAME',
                        'message': '標籤名稱已存在，請使用不同的名稱',
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif 'slug' in error_message.lower() or 'tags_slug' in error_message.lower():
                    return Response({
                        'status': 'error',
                        'code': 'DUPLICATE_SLUG',
                        'message': '標籤名稱產生的 slug 已存在，請使用不同的名稱',
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # 無法確定是哪個字段，顯示通用錯誤
                    return Response({
                        'status': 'error',
                        'code': 'DUPLICATE',
                        'message': '標籤名稱已存在，請使用不同的名稱',
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # 重新拋出其他異常，讓 DRF 處理
            raise
    
    def update(self, request, *args, **kwargs):
        """更新標籤，統一響應格式"""
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
        """刪除標籤，統一響應格式"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'status': 'success',
            'data': {'message': '標籤已刪除'},
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

