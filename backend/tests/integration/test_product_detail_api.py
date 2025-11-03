"""
GET /api/products/{id}/ API 整合測試
"""
import pytest
from decimal import Decimal
from apps.products.models import Product, ProductImage
from apps.categories.models import Category
from apps.tags.models import Tag


@pytest.mark.django_db
class TestProductDetailAPI:
    """商品詳情 API 測試"""
    
    def test_get_product_detail(self, api_client):
        """測試取得商品詳情"""
        category = Category.objects.create(name='測試分類')
        tag = Tag.objects.create(name='測試標籤')
        
        product = Product.objects.create(
            name='測試商品',
            description='商品詳細描述',
            price=Decimal('999.99'),
            category=category
        )
        product.tags.add(tag)
        
        ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/img1.jpg',
            is_primary=True
        )
        ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/img2.jpg'
        )
        
        response = api_client.get(f'/api/products/{product.id}/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        
        product_data = data['data']
        assert product_data['name'] == '測試商品'
        assert product_data['description'] == '商品詳細描述'
        assert product_data['price'] == '999.99'
        assert product_data['category']['name'] == '測試分類'
        assert len(product_data['tags']) == 1
        assert len(product_data['images']) == 2
        assert product_data['images'][0]['is_primary'] is True
    
    def test_get_non_existent_product(self, api_client):
        """測試取得不存在商品"""
        response = api_client.get('/api/products/999/')
        
        assert response.status_code == 404
    
    def test_get_inactive_product(self, api_client):
        """測試取得未啟用商品（應返回 404）"""
        product = Product.objects.create(
            name='未啟用商品',
            price=Decimal('100'),
            is_active=False
        )
        
        response = api_client.get(f'/api/products/{product.id}/')
        
        assert response.status_code == 404

