"""
標籤 Views
"""
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Tag
from .serializers import TagSerializer
from core.permissions import IsPublicEndpoint


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    標籤 ViewSet（僅讀取）
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsPublicEndpoint]
    
    def list(self, request, *args, **kwargs):
        """統一回應格式"""
        response = super().list(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data if isinstance(response.data, list) else response.data.get('results', []),
            })
        return response
    
    def retrieve(self, request, *args, **kwargs):
        """統一回應格式"""
        response = super().retrieve(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data,
            })
        return response

