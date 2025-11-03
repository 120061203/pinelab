"""
PATCH /api/admin/products/{id}/ API 整合測試
"""
import pytest
from decimal import Decimal
from apps.products.models import Product
from apps.categories.models import Category
from apps.tags.models import Tag


@pytest.mark.django_db
class TestAdminProductsUpdate:
    """管理員商品更新 API 測試"""
    
    def test_update_product(self, authenticated_client):
        """測試更新商品"""
        product = Product.objects.create(
            name='原始商品',
            price=Decimal('100'),
        )
        
        response = authenticated_client.patch(f'/api/admin/products/{product.id}/', {
            'name': '更新商品',
            'price': '200',
        }, format='json')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['name'] == '更新商品'
        assert data['data']['price'] == '200'
    
    def test_update_product_category(self, authenticated_client):
        """測試更新商品分類"""
        product = Product.objects.create(
            name='商品',
            price=Decimal('100'),
        )
        category = Category.objects.create(name='新分類')
        
        response = authenticated_client.patch(f'/api/admin/products/{product.id}/', {
            'category_id': category.id,
        }, format='json')
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['category']['id'] == category.id
    
    def test_update_product_tags(self, authenticated_client):
        """測試更新商品標籤"""
        product = Product.objects.create(
            name='商品',
            price=Decimal('100'),
        )
        tag1 = Tag.objects.create(name='標籤1')
        tag2 = Tag.objects.create(name='標籤2')
        
        response = authenticated_client.patch(f'/api/admin/products/{product.id}/', {
            'tag_ids': [tag1.id, tag2.id],
        }, format='json')
        
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']['tags']) == 2
    
    def test_partial_update_product(self, authenticated_client):
        """測試部分更新商品"""
        product = Product.objects.create(
            name='商品',
            price=Decimal('100'),
            description='原始描述',
        )
        
        response = authenticated_client.patch(f'/api/admin/products/{product.id}/', {
            'description': '更新描述',
        }, format='json')
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['description'] == '更新描述'
        assert data['data']['name'] == '商品'  # 其他欄位不變

