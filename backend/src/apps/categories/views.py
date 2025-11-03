"""
分類 Views
"""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Category
from .serializers import CategorySerializer
from core.permissions import IsPublicEndpoint


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    分類 ViewSet（僅讀取）
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsPublicEndpoint]

