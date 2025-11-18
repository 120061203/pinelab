"""
網站設定公開 API Views
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.utils import timezone
from .models import SiteSettings, News, Service
from .serializers import SiteSettingsSerializer, NewsSerializer, ServiceSerializer
from core.permissions import IsPublicEndpoint


class SiteSettingsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    網站設定 ViewSet（公開 API，僅讀取）
    """
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsPublicEndpoint]
    
    def get_queryset(self):
        """取得單例 SiteSettings"""
        return SiteSettings.objects.filter(key='site_settings')
    
    def list(self, request, *args, **kwargs):
        """取得網站設定（單例，所以 list 和 retrieve 行為相同）"""
        instance = SiteSettings.get_instance()
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'data': serializer.data,
        })
    
    def retrieve(self, request, *args, **kwargs):
        """取得網站設定詳情"""
        instance = SiteSettings.get_instance()
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'data': serializer.data,
        })


class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    最新消息 ViewSet（公開 API，僅讀取）
    只返回已發布且發布日期小於等於當前日期的消息
    """
    serializer_class = NewsSerializer
    permission_classes = [IsPublicEndpoint]
    
    def get_queryset(self):
        """只返回已發布的消息"""
        today = timezone.now().date()
        return News.objects.filter(
            status='published',
            publish_date__lte=today
        ).order_by('-publish_date', '-created_at')
    
    def list(self, request, *args, **kwargs):
        """取得最新消息列表"""
        limit = int(request.query_params.get('limit', 5))
        queryset = self.get_queryset()[:limit]
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
        })
    
    def retrieve(self, request, *args, **kwargs):
        """取得單一最新消息詳情"""
        response = super().retrieve(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data,
            })
        return response


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    服務項目 ViewSet（公開 API，僅讀取）
    """
    serializer_class = ServiceSerializer
    permission_classes = [IsPublicEndpoint]
    queryset = Service.objects.all().order_by('-sort_order', '-updated_at')
    
    def list(self, request, *args, **kwargs):
        """取得服務項目列表"""
        response = super().list(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data.get('results', []) if isinstance(response.data, dict) else response.data,
            })
        return response
    
    def retrieve(self, request, *args, **kwargs):
        """取得單一服務項目詳情"""
        response = super().retrieve(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data,
            })
        return response

