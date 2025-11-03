"""
DELETE /api/admin/products/{id}/ API 整合測試
"""
import pytest
from decimal import Decimal
from apps.products.models import Product


@pytest.mark.django_db
class TestAdminProductsDelete:
    """管理員商品刪除 API 測試"""
    
    def test_delete_product(self, authenticated_client):
        """測試刪除商品"""
        product = Product.objects.create(
            name='待刪除商品',
            price=Decimal('100'),
        )
        
        response = authenticated_client.delete(f'/api/admin/products/{product.id}/')
        
        assert response.status_code == 204
        
        # 驗證商品已刪除
        assert not Product.objects.filter(id=product.id).exists()
    
    def test_delete_nonexistent_product(self, authenticated_client):
        """測試刪除不存在的商品"""
        response = authenticated_client.delete('/api/admin/products/999/')
        
        assert response.status_code == 404
    
    def test_delete_product_requires_authentication(self, api_client):
        """測試刪除商品需要認證"""
        product = Product.objects.create(
            name='商品',
            price=Decimal('100'),
        )
        
        response = api_client.delete(f'/api/admin/products/{product.id}/')
        
        assert response.status_code == 401

