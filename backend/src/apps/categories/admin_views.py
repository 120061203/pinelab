"""
分類管理 API Views（管理員專用）
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
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

