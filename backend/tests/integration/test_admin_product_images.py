"""
POST /api/admin/products/{id}/images/ API 整合測試
"""
import pytest
from decimal import Decimal
from apps.products.models import Product, ProductImage


@pytest.mark.django_db
class TestAdminProductImages:
    """管理員商品圖片 API 測試"""
    
    def test_upload_product_image(self, authenticated_client):
        """測試上傳商品圖片"""
        product = Product.objects.create(
            name='商品',
            price=Decimal('100'),
        )
        
        response = authenticated_client.post(f'/api/admin/products/{product.id}/upload_image/', {
            'image_url': '/media/products/1/image.jpg',
            'sort_order': 0,
            'is_primary': True,
        }, format='json')
        
        assert response.status_code == 201
        data = response.json()
        assert data['status'] == 'success'
        assert len(data['data']['images']) == 1
        assert data['data']['images'][0]['is_primary'] is True
    
    def test_upload_multiple_images(self, authenticated_client):
        """測試上傳多張圖片"""
        product = Product.objects.create(
            name='商品',
            price=Decimal('100'),
        )
        
        # 上傳第一張圖片
        authenticated_client.post(f'/api/admin/products/{product.id}/upload_image/', {
            'image_url': '/media/products/1/img1.jpg',
            'is_primary': True,
        }, format='json')
        
        # 上傳第二張圖片
        response = authenticated_client.post(f'/api/admin/products/{product.id}/upload_image/', {
            'image_url': '/media/products/1/img2.jpg',
            'is_primary': False,
        }, format='json')
        
        assert response.status_code == 201
        data = response.json()
        assert len(data['data']['images']) == 2
    
    def test_upload_image_missing_url(self, authenticated_client):
        """測試上傳圖片時缺少 URL"""
        product = Product.objects.create(
            name='商品',
            price=Decimal('100'),
        )
        
        response = authenticated_client.post(f'/api/admin/products/{product.id}/upload_image/', {
            'sort_order': 0,
        }, format='json')
        
        assert response.status_code == 400
        data = response.json()
        assert data['code'] == 'MISSING_IMAGE_URL'
    
    def test_delete_product_image(self, authenticated_client):
        """測試刪除商品圖片"""
        product = Product.objects.create(
            name='商品',
            price=Decimal('100'),
        )
        image = ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/image.jpg',
        )
        
        response = authenticated_client.delete(
            f'/api/admin/products/{product.id}/images/{image.id}/'
        )
        
        assert response.status_code == 200
        assert not ProductImage.objects.filter(id=image.id).exists()
    
    def test_delete_nonexistent_image(self, authenticated_client):
        """測試刪除不存在的圖片"""
        product = Product.objects.create(
            name='商品',
            price=Decimal('100'),
        )
        
        response = authenticated_client.delete(
            f'/api/admin/products/{product.id}/images/999/'
        )
        
        assert response.status_code == 404

