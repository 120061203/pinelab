"""
測試商品排序調整功能
"""
import pytest
from rest_framework import status
from apps.products.models import Product
from decimal import Decimal


@pytest.mark.django_db
class TestProductSortOrder:
    """測試商品排序功能"""
    
    def test_update_product_sort_order(self, authenticated_client):
        """測試更新商品排序順序"""
        product = Product.objects.create(
            name='測試商品',
            slug='test-product',
            price=Decimal('100.00'),
            sort_order=0
        )
        
        # 更新排序順序
        response = authenticated_client.patch(
            f'/api/admin/products/{product.id}/',
            {
                'sort_order': 10,
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['sort_order'] == 10
        
        # 驗證資料庫更新
        product.refresh_from_db()
        assert product.sort_order == 10
    
    def test_products_sorted_by_sort_order(self, authenticated_client):
        """測試商品按排序順序排列"""
        # 創建多個商品
        product1 = Product.objects.create(
            name='商品1',
            slug='product-1',
            price=Decimal('100.00'),
            sort_order=3
        )
        product2 = Product.objects.create(
            name='商品2',
            slug='product-2',
            price=Decimal('200.00'),
            sort_order=1
        )
        product3 = Product.objects.create(
            name='商品3',
            slug='product-3',
            price=Decimal('300.00'),
            sort_order=2
        )
        
        # 取得商品列表
        response = authenticated_client.get('/api/admin/products/')
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert 'status' in data
        assert 'data' in data
        
        # 驗證排序（應該按 sort_order 降序，然後按 updated_at 降序）
        # 預設排序：-sort_order, -updated_at
        results = data['data'].get('results', [])
        if len(results) >= 3:
            # 檢查排序邏輯
            sort_orders = [p['sort_order'] for p in results if p['id'] in [product1.id, product2.id, product3.id]]
            # 應該按 -sort_order 排序：3, 2, 1
            assert sort_orders == sorted(sort_orders, reverse=True)
    
    def test_update_sort_order_with_bulk_update(self, authenticated_client):
        """測試批量更新排序順序"""
        # 創建多個商品
        products = []
        for i in range(3):
            product = Product.objects.create(
                name=f'商品{i+1}',
                slug=f'product-{i+1}',
                price=Decimal('100.00'),
                sort_order=i
            )
            products.append(product)
        
        # 逐一更新排序順序
        new_sort_orders = [10, 5, 15]
        for product, new_sort in zip(products, new_sort_orders):
            response = authenticated_client.patch(
                f'/api/admin/products/{product.id}/',
                {'sort_order': new_sort}
            )
            assert response.status_code == status.HTTP_200_OK
        
        # 驗證更新
        for product, expected_sort in zip(products, new_sort_orders):
            product.refresh_from_db()
            assert product.sort_order == expected_sort

