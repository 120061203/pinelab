"""
API 回應格式一致性測試
"""
import pytest
from apps.categories.models import Category
from apps.products.models import Product
from decimal import Decimal


@pytest.mark.django_db
class TestAPIResponseFormat:
    """API 回應格式測試"""
    
    def test_success_response_format(self, api_client):
        """測試成功回應格式"""
        category = Category.objects.create(name='測試分類')
        response = api_client.get(f'/api/categories/{category.id}/')
        
        assert response.status_code == 200
        data = response.json()
        assert 'status' in data
        assert 'data' in data
        assert data['status'] == 'success'
    
    def test_error_response_format(self, api_client):
        """測試錯誤回應格式"""
        response = api_client.get('/api/categories/999/')
        
        assert response.status_code == 404
        data = response.json()
        assert 'status' in data
        assert data['status'] == 'error'
    
    def test_paginated_response_format(self, api_client):
        """測試分頁回應格式"""
        Product.objects.create(name='商品1', price=Decimal('100'))
        Product.objects.create(name='商品2', price=Decimal('200'))
        
        response = api_client.get('/api/products/')
        
        assert response.status_code == 200
        data = response.json()
        assert 'status' in data
        assert 'data' in data
        if 'results' in data['data']:
            assert 'count' in data['data']
            assert 'next' in data['data']
            assert 'previous' in data['data']

