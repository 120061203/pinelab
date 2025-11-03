"""
測試商品圖片上傳功能
注意：當前實現使用本地路徑字符串，暫無實際檔案上傳
"""
import pytest
from rest_framework import status
from apps.products.models import Product, ProductImage
from decimal import Decimal


@pytest.mark.django_db
class TestProductImageUpload:
    """測試商品圖片上傳"""
    
    def test_upload_image_with_valid_data(self, authenticated_client):
        """測試上傳有效的圖片路徑"""
        product = Product.objects.create(
            name='測試商品',
            slug='test-product',
            price=Decimal('100.00')
        )
        
        response = authenticated_client.post(
            f'/api/admin/products/{product.id}/upload_image/',
            {
                'image_url': '/media/products/test-image.jpg',
                'sort_order': 0,
                'is_primary': True,
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data['status'] == 'success'
        
        # 驗證圖片已創建
        image = ProductImage.objects.filter(product=product).first()
        assert image is not None
        assert image.image_url == '/media/products/test-image.jpg'
        assert image.is_primary is True
    
    def test_upload_image_requires_image_url(self, authenticated_client):
        """測試上傳圖片必須提供 image_url"""
        product = Product.objects.create(
            name='測試商品',
            slug='test-product',
            price=Decimal('100.00')
        )
        
        response = authenticated_client.post(
            f'/api/admin/products/{product.id}/upload_image/',
            {
                'sort_order': 0,
                'is_primary': False,
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data['status'] == 'error'
        assert data['code'] == 'MISSING_IMAGE_URL'
    
    def test_upload_multiple_images(self, authenticated_client):
        """測試上傳多張圖片"""
        product = Product.objects.create(
            name='測試商品',
            slug='test-product',
            price=Decimal('100.00')
        )
        
        # 上傳第一張圖片（主圖）
        response1 = authenticated_client.post(
            f'/api/admin/products/{product.id}/upload_image/',
            {
                'image_url': '/media/products/image1.jpg',
                'sort_order': 0,
                'is_primary': True,
            }
        )
        assert response1.status_code == status.HTTP_201_CREATED
        
        # 上傳第二張圖片
        response2 = authenticated_client.post(
            f'/api/admin/products/{product.id}/upload_image/',
            {
                'image_url': '/media/products/image2.jpg',
                'sort_order': 1,
                'is_primary': False,
            }
        )
        assert response2.status_code == status.HTTP_201_CREATED
        
        # 驗證兩張圖片都已創建
        images = ProductImage.objects.filter(product=product)
        assert images.count() == 2
        primary_images = images.filter(is_primary=True)
        assert primary_images.count() == 1
    
    def test_upload_image_requires_authentication(self, api_client):
        """測試上傳圖片需要認證"""
        product = Product.objects.create(
            name='測試商品',
            slug='test-product',
            price=Decimal('100.00')
        )
        
        response = api_client.post(
            f'/api/admin/products/{product.id}/upload_image/',
            {
                'image_url': '/media/products/test.jpg',
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_delete_image(self, authenticated_client):
        """測試刪除圖片"""
        product = Product.objects.create(
            name='測試商品',
            slug='test-product',
            price=Decimal('100.00')
        )
        
        image = ProductImage.objects.create(
            product=product,
            image_url='/media/products/test.jpg',
            sort_order=0,
            is_primary=True
        )
        
        response = authenticated_client.delete(
            f'/api/admin/products/{product.id}/delete_image/{image.id}/'
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not ProductImage.objects.filter(id=image.id).exists()

