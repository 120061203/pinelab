"""
商品篩選邏輯單元測試
"""
import pytest
from decimal import Decimal
from apps.products.models import Product
from apps.products.filters import ProductFilter
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
        category=category1
    )
    product1.tags.add(tag1)
    
    product2 = Product.objects.create(
        name='商品2',
        price=Decimal('200'),
        category=category2
    )
    product2.tags.add(tag2)
    
    product3 = Product.objects.create(
        name='商品3',
        price=Decimal('300'),
        category=category1
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
class TestProductFilters:
    """商品篩選器測試"""
    
    def setUp(self):
        """建立測試資料"""
        self.category1 = Category.objects.create(name='分類1')
        self.category2 = Category.objects.create(name='分類2')
        self.tag1 = Tag.objects.create(name='標籤1')
        self.tag2 = Tag.objects.create(name='標籤2')
        
        self.product1 = Product.objects.create(
            name='商品1',
            price=Decimal('100'),
            category=self.category1
        )
        self.product1.tags.add(self.tag1)
        
        self.product2 = Product.objects.create(
            name='商品2',
            price=Decimal('200'),
            category=self.category2
        )
        self.product2.tags.add(self.tag2)
        
        self.product3 = Product.objects.create(
            name='商品3',
            price=Decimal('300'),
            category=self.category1
        )
        self.product3.tags.add(self.tag1, self.tag2)
    
    def test_filter_by_category(self, setup_test_data):
        """測試分類篩選"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({'category': setup_test_data['category1'].id}, queryset=queryset)
        results = filterset.qs
        
        assert results.count() == 2
        assert all(p.category == setup_test_data['category1'] for p in results)
    
    def test_filter_by_tags(self, setup_test_data):
        """測試標籤篩選"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({'tags': [setup_test_data['tag1'].id]}, queryset=queryset)
        results = filterset.qs
        
        assert results.count() == 2  # product1 和 product3
    
    def test_filter_by_price_range(self, setup_test_data):
        """測試價格區間篩選"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({
            'min_price': 150,
            'max_price': 250
        }, queryset=queryset)
        results = filterset.qs
        
        assert results.count() == 1
        assert results[0].name == '商品2'
    
    def test_filter_by_min_price_only(self, setup_test_data):
        """測試僅最小價格"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({'min_price': 200}, queryset=queryset)
        results = filterset.qs
        
        assert results.count() == 2
        assert all(float(p.price) >= 200 for p in results)
    
    def test_filter_by_max_price_only(self, setup_test_data):
        """測試僅最大價格"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({'max_price': 200}, queryset=queryset)
        results = filterset.qs
        
        assert results.count() == 2
        assert all(float(p.price) <= 200 for p in results)
    
    def test_multiple_filters(self, setup_test_data):
        """測試多條件篩選"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({
            'category': setup_test_data['category1'].id,
            'min_price': 200
        }, queryset=queryset)
        results = filterset.qs
        
        assert results.count() == 1
        assert results[0].name == '商品3'

