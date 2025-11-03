"""
商品管理 API Views（管理員專用）
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product
from .admin_serializers import ProductAdminSerializer
from .image_handler import validate_image_url, clean_image_url
from core.permissions import IsAdminUser


class ProductAdminViewSet(viewsets.ModelViewSet):
    """
    商品管理 ViewSet（管理員專用）
    支援完整 CRUD 操作，包括未啟用商品
    """
    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """管理員可以查看所有商品"""
        queryset = super().get_queryset()
        queryset = queryset.prefetch_related('tags', 'images').select_related('category')
        return queryset
    
    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        """
        上傳商品圖片
        """
        product = self.get_object()
        image_url = request.data.get('image_url')
        sort_order = request.data.get('sort_order', 0)
        is_primary = request.data.get('is_primary', False)
        
        if not image_url:
            return Response({
                'status': 'error',
                'code': 'MISSING_IMAGE_URL',
                'message': '請提供圖片 URL',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 驗證並清理圖片 URL
        cleaned_url = clean_image_url(image_url)
        if not validate_image_url(cleaned_url):
            return Response({
                'status': 'error',
                'code': 'INVALID_IMAGE_URL',
                'message': '無效的圖片 URL 格式',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from .models import ProductImage
        image = ProductImage.objects.create(
            product=product,
            image_url=cleaned_url,
            sort_order=sort_order,
            is_primary=is_primary
        )
        
        serializer = self.get_serializer(product)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        """
        刪除商品圖片
        """
        product = self.get_object()
        
        try:
            image = product.images.get(id=image_id)
            image.delete()
            
            return Response({
                'status': 'success',
                'data': {'message': '圖片已刪除'},
            }, status=status.HTTP_200_OK)
        except product.images.model.DoesNotExist:
            return Response({
                'status': 'error',
                'code': 'IMAGE_NOT_FOUND',
                'message': '圖片不存在',
            }, status=status.HTTP_404_NOT_FOUND)

