"""
商品 Views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Prefetch, Q
from .models import Product
from .serializers import ProductSerializer, ProductListSerializer
from .filters import ProductFilter
from core.permissions import IsPublicEndpoint


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    商品 ViewSet（僅讀取）
    """
    queryset = Product.objects.filter(is_active=True).prefetch_related(
        'tags',
        'images'
    ).select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [IsPublicEndpoint]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['sort_order', 'updated_at', 'price']
    ordering = ['-sort_order', '-updated_at']
    
    def get_serializer_class(self):
        """根據動作選擇序列化器"""
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer
    
    def get_queryset(self):
        """取得查詢集，應用篩選"""
        queryset = super().get_queryset()
        
        # 應用篩選
        filterset = self.filterset_class(self.request.GET, queryset=queryset)
        queryset = filterset.qs
        
        return queryset.distinct()
    
    def list(self, request, *args, **kwargs):
        """統一回應格式"""
        response = super().list(request, *args, **kwargs)
        # 分頁回應已經由 StandardResultsSetPagination 處理
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
    
    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """
        取得相關商品
        優先考慮共享分類和標籤的商品
        """
        product = self.get_object()
        
        # 取得共享分類和標籤的商品
        related_products = Product.objects.filter(
            is_active=True
        ).exclude(id=product.id)
        
        # 優先：共享分類或標籤
        shared_products = related_products.filter(
            Q(category=product.category) | Q(tags__in=product.tags.all())
        ).distinct()[:3]
        
        # 如果不足 3 個，用最新商品補齊
        if shared_products.count() < 3:
            remaining = 3 - shared_products.count()
            latest_products = related_products.exclude(
                id__in=[p.id for p in shared_products]
            ).order_by('-updated_at')[:remaining]
            related_products = list(shared_products) + list(latest_products)
        else:
            related_products = list(shared_products)[:3]
        
        serializer = ProductListSerializer(
            related_products,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'status': 'success',
            'data': serializer.data,
        })

