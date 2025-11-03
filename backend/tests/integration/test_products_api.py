"""
GET /api/products/ API 整合測試（含篩選、搜尋、排序）
"""
import pytest
from decimal import Decimal
from apps.products.models import Product
from apps.categories.models import Category
from apps.tags.models import Tag


@pytest.fixture
def setup_test_data(db):
    """建立測試資料 Fixture"""
    category1 = Category.objects.create(name='分類1')
    category2 = Category.objects.create(name='分類2')
    tag1 = Tag.objects.create(name='標籤1')
    tag2 = Tag.objects.create(name='標籤2')
    
    product1 = Product.objects.create(
        name='商品1',
        price=Decimal('100'),
        category=category1,
        sort_order=1
    )
    product1.tags.add(tag1)
    
    product2 = Product.objects.create(
        name='商品2',
        price=Decimal('200'),
        category=category2,
        sort_order=2
    )
    product2.tags.add(tag2)
    
    product3 = Product.objects.create(
        name='商品3',
        price=Decimal('300'),
        category=category1,
        sort_order=0
    )
    product3.tags.add(tag1, tag2)
    
    return {
        'category1': category1,
        'category2': category2,
        'tag1': tag1,
        'tag2': tag2,
        'product1': product1,
        'product2': product2,
        'product3': product3,
    }


@pytest.mark.django_db
class TestProductsAPI:
    """商品 API 測試"""
    
    def setUp(self):
        """建立測試資料"""
        self.category1 = Category.objects.create(name='分類1')
        self.category2 = Category.objects.create(name='分類2')
        self.tag1 = Tag.objects.create(name='標籤1')
        self.tag2 = Tag.objects.create(name='標籤2')
        
        self.product1 = Product.objects.create(
            name='商品1',
            price=Decimal('100'),
            category=self.category1,
            sort_order=1
        )
        self.product1.tags.add(self.tag1)
        
        self.product2 = Product.objects.create(
            name='商品2',
            price=Decimal('200'),
            category=self.category2,
            sort_order=2
        )
        self.product2.tags.add(self.tag2)
        
        self.product3 = Product.objects.create(
            name='商品3',
            price=Decimal('300'),
            category=self.category1,
            sort_order=0
        )
        self.product3.tags.add(self.tag1, self.tag2)
    
    def test_get_products_list(self, api_client, setup_test_data):
        """測試取得商品列表"""
        
        response = api_client.get('/api/products/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert len(data['data']['results']) == 3
    
    def test_filter_by_category(self, api_client, setup_test_data):
        """測試依分類篩選"""
        response = api_client.get(f"/api/products/?category={setup_test_data['category1'].id}")
        
        assert response.status_code == 200
        data = response.json()
        results = data['data']['results']
        assert len(results) == 2
        assert all(p['category']['id'] == setup_test_data['category1'].id for p in results)
    
    def test_filter_by_tags(self, api_client, setup_test_data):
        """測試依標籤篩選"""
        response = api_client.get(f"/api/products/?tags={setup_test_data['tag1'].id}")
        
        assert response.status_code == 200
        data = response.json()
        results = data['data']['results']
        assert len(results) == 2  # product1 和 product3
        assert all(setup_test_data['tag1'].id in [t['id'] for t in p['tags']] for p in results)
    
    def test_filter_by_price_range(self, api_client, setup_test_data):
        """測試依價格區間篩選"""
        
        response = api_client.get('/api/products/?min_price=150&max_price=250')
        
        assert response.status_code == 200
        data = response.json()
        results = data['data']['results']
        assert len(results) == 1
        assert results[0]['name'] == '商品2'
    
    def test_search_products(self, api_client, setup_test_data):
        """測試搜尋商品"""
        response = api_client.get('/api/products/?search=商品1')
        
        assert response.status_code == 200
        data = response.json()
        results = data['data']['results']
        assert len(results) == 1
        assert results[0]['name'] == '商品1'
    
    def test_sort_products(self, api_client, setup_test_data):
        """測試排序商品"""
        
        # 依 sort_order 排序（預設）
        response = api_client.get('/api/products/?sort=sort_order')
        
        assert response.status_code == 200
        data = response.json()
        results = data['data']['results']
        assert results[0]['name'] == '商品2'  # sort_order=2
        assert results[1]['name'] == '商品1'  # sort_order=1
        assert results[2]['name'] == '商品3'  # sort_order=0
    
    def test_sort_by_price(self, api_client, setup_test_data):
        """測試依價格排序"""
        
        response = api_client.get('/api/products/?sort=price')
        
        assert response.status_code == 200
        data = response.json()
        results = data['data']['results']
        prices = [float(p['price']) for p in results]
        assert prices == [100.0, 200.0, 300.0]
    
    def test_pagination(self, api_client, setup_test_data):
        """測試分頁"""
        
        response = api_client.get('/api/products/?page_size=2')
        
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']['results']) == 2
        assert data['data']['count'] == 3

