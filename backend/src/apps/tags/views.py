"""
標籤 Views
"""
from rest_framework import viewsets
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

