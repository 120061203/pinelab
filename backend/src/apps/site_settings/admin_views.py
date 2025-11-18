"""
網站設定管理 API Views（管理員專用）
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import SiteSettings, News, Service
from .admin_serializers import (
    SiteSettingsAdminSerializer,
    NewsAdminSerializer,
    ServiceAdminSerializer
)
from core.permissions import IsAdminUser


class SiteSettingsAdminViewSet(viewsets.ModelViewSet):
    """
    網站設定管理 ViewSet（管理員專用）
    支援更新操作（單例模式，不支援建立和刪除）
    """
    serializer_class = SiteSettingsAdminSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ['get', 'put', 'patch', 'head', 'options']  # 只允許 GET, PUT, PATCH
    
    def get_queryset(self):
        """取得單例 SiteSettings"""
        return SiteSettings.objects.filter(key='site_settings')
    
    def get_object(self):
        """取得單例實例（忽略 pk 參數）"""
        # 對於單例模式，忽略 URL 中的 pk 參數
        return SiteSettings.get_instance()
    
    def list(self, request, *args, **kwargs):
        """取得網站設定"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'data': serializer.data,
        })
    
    def retrieve(self, request, *args, **kwargs):
        """取得網站設定詳情"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'data': serializer.data,
        })
    
    def create(self, request, *args, **kwargs):
        """不允許建立（單例模式）"""
        return Response({
            'status': 'error',
            'code': 'NOT_ALLOWED',
            'message': '網站設定是單例，無法建立新記錄',
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def update(self, request, *args, **kwargs):
        """更新網站設定，統一響應格式"""
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
        """不允許刪除（單例模式）"""
        return Response({
            'status': 'error',
            'code': 'NOT_ALLOWED',
            'message': '網站設定是單例，無法刪除',
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class NewsAdminViewSet(viewsets.ModelViewSet):
    """
    最新消息管理 ViewSet（管理員專用）
    支援完整 CRUD 操作
    """
    queryset = News.objects.all()
    serializer_class = NewsAdminSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """管理員可以查看所有消息（包括草稿）"""
        queryset = News.objects.all()
        status_filter = self.request.query_params.get('status')
        if status_filter in ['draft', 'published']:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-publish_date', '-created_at')
    
    def create(self, request, *args, **kwargs):
        """建立最新消息，統一響應格式"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """更新最新消息，統一響應格式"""
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
        """刪除最新消息，統一響應格式"""
        self.perform_destroy(self.get_object())
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def list(self, request, *args, **kwargs):
        """列表查詢，統一響應格式"""
        response = super().list(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data.get('results', []) if isinstance(response.data, dict) else response.data,
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
    
    @action(detail=True, methods=['patch'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        """
        切換最新消息的發布狀態（草稿↔已發布）
        """
        news = self.get_object()
        new_status = 'published' if news.status == 'draft' else 'draft'
        news.status = new_status
        news.save(update_fields=['status'])
        
        serializer = self.get_serializer(news)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_200_OK)


class ServiceAdminViewSet(viewsets.ModelViewSet):
    """
    服務項目管理 ViewSet（管理員專用）
    支援完整 CRUD 操作
    """
    queryset = Service.objects.all()
    serializer_class = ServiceAdminSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """管理員可以查看所有服務項目"""
        return Service.objects.all().order_by('-sort_order', '-updated_at')
    
    def create(self, request, *args, **kwargs):
        """建立服務項目，統一響應格式"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """更新服務項目，統一響應格式"""
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
        """刪除服務項目，統一響應格式"""
        self.perform_destroy(self.get_object())
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def list(self, request, *args, **kwargs):
        """列表查詢，統一響應格式"""
        response = super().list(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data.get('results', []) if isinstance(response.data, dict) else response.data,
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
    
    @action(detail=True, methods=['patch'], url_path='update-sort')
    def update_sort_order(self, request, pk=None):
        """
        更新服務項目的排序順序
        """
        service = self.get_object()
        sort_order = request.data.get('sort_order')
        
        if sort_order is None:
            return Response({
                'status': 'error',
                'code': 'MISSING_FIELD',
                'message': 'sort_order 欄位為必填',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            sort_order = int(sort_order)
        except (ValueError, TypeError):
            return Response({
                'status': 'error',
                'code': 'INVALID_VALUE',
                'message': 'sort_order 必須是整數',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        service.sort_order = sort_order
        service.save(update_fields=['sort_order'])
        
        serializer = self.get_serializer(service)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='batch_update_sort')
    def batch_update_sort(self, request):
        """
        批量更新服務項目排序
        接收格式: { "items": [{"id": 1, "sort_order": 10}, {"id": 2, "sort_order": 20}] }
        """
        items = request.data.get('items', [])
        if not isinstance(items, list):
            return Response({
                'status': 'error',
                'code': 'INVALID_FORMAT',
                'message': 'items 必須是陣列',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 批量更新
            updates = []
            for item in items:
                service_id = item.get('id')
                sort_order = item.get('sort_order')
                
                if service_id is None or sort_order is None:
                    continue
                
                try:
                    service = Service.objects.get(id=service_id)
                    service.sort_order = sort_order
                    service.save(update_fields=['sort_order'])
                    updates.append({'id': service_id, 'sort_order': sort_order})
                except Service.DoesNotExist:
                    continue
            
            return Response({
                'status': 'success',
                'data': {
                    'updated_count': len(updates),
                    'items': updates,
                },
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'code': 'UPDATE_FAILED',
                'message': f'批量更新失敗: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

