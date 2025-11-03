"""
POST /api/admin/products/ API 整合測試
"""
import pytest
from decimal import Decimal
from apps.categories.models import Category
from apps.tags.models import Tag


@pytest.mark.django_db
class TestAdminProductsCreate:
    """管理員商品建立 API 測試"""
    
    def test_create_product(self, authenticated_client):
        """測試建立商品"""
        response = authenticated_client.post('/api/admin/products/', {
            'name': '新商品',
            'description': '商品描述',
            'price': '999.99',
            'sort_order': 0,
            'is_active': True,
        }, format='json')
        
        assert response.status_code == 201
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['name'] == '新商品'
        assert data['data']['price'] == '999.99'
    
    def test_create_product_with_category(self, authenticated_client):
        """測試建立商品並關聯分類"""
        category = Category.objects.create(name='測試分類')
        
        response = authenticated_client.post('/api/admin/products/', {
            'name': '新商品',
            'price': '999.99',
            'category_id': category.id,
        }, format='json')
        
        assert response.status_code == 201
        data = response.json()
        assert data['data']['category']['id'] == category.id
    
    def test_create_product_with_tags(self, authenticated_client):
        """測試建立商品並關聯標籤"""
        tag1 = Tag.objects.create(name='標籤1')
        tag2 = Tag.objects.create(name='標籤2')
        
        response = authenticated_client.post('/api/admin/products/', {
            'name': '新商品',
            'price': '999.99',
            'tag_ids': [tag1.id, tag2.id],
        }, format='json')
        
        assert response.status_code == 201
        data = response.json()
        assert len(data['data']['tags']) == 2
    
    def test_create_product_invalid_price(self, authenticated_client):
        """測試建立商品時價格驗證"""
        response = authenticated_client.post('/api/admin/products/', {
            'name': '新商品',
            'price': '-100',  # 無效價格
        }, format='json')
        
        assert response.status_code == 400

