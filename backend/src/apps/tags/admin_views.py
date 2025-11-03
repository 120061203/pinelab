"""
標籤管理 API Views（管理員專用）
"""
from rest_framework import viewsets
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

