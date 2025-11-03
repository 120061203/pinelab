"""
商品搜尋邏輯單元測試
"""
import pytest
from decimal import Decimal
from apps.products.models import Product
from apps.products.filters import ProductFilter
from apps.tags.models import Tag


@pytest.fixture
def setup_test_data(db):
    """建立測試資料 Fixture"""
    tag1 = Tag.objects.create(name='創意')
    tag2 = Tag.objects.create(name='設計')
    
    product1 = Product.objects.create(
        name='創意商品',
        description='這是一個創意商品',
        price=Decimal('100')
    )
    product1.tags.add(tag1)
    
    product2 = Product.objects.create(
        name='設計商品',
        description='這是設計相關商品',
        price=Decimal('200')
    )
    product2.tags.add(tag2)
    
    product3 = Product.objects.create(
        name='普通商品',
        description='這是一般商品',
        price=Decimal('300')
    )
    
    return {
        'tag1': tag1,
        'tag2': tag2,
        'product1': product1,
        'product2': product2,
        'product3': product3,
    }


@pytest.mark.django_db
class TestProductSearch:
    """商品搜尋測試"""
    
    def setUp(self):
        """建立測試資料"""
        tag1 = Tag.objects.create(name='創意')
        tag2 = Tag.objects.create(name='設計')
        
        self.product1 = Product.objects.create(
            name='創意商品',
            description='這是一個創意商品',
            price=Decimal('100')
        )
        self.product1.tags.add(tag1)
        
        self.product2 = Product.objects.create(
            name='設計商品',
            description='這是設計相關商品',
            price=Decimal('200')
        )
        self.product2.tags.add(tag2)
        
        self.product3 = Product.objects.create(
            name='普通商品',
            description='這是一般商品',
            price=Decimal('300')
        )
    
    def test_search_by_name(self, setup_test_data):
        """測試依名稱搜尋"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({'search': '創意'}, queryset=queryset)
        results = filterset.qs
        
        assert results.count() == 1
        assert results[0].name == '創意商品'
    
    def test_search_by_description(self, setup_test_data):
        """測試依描述搜尋"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({'search': '設計相關'}, queryset=queryset)
        results = filterset.qs
        
        assert results.count() == 1
        assert results[0].name == '設計商品'
    
    def test_search_by_tag(self, setup_test_data):
        """測試依標籤搜尋"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({'search': '創意'}, queryset=queryset)
        results = filterset.qs
        
        # 應該找到名稱或標籤包含「創意」的商品
        assert results.count() >= 1
    
    def test_search_no_results(self, setup_test_data):
        """測試搜尋無結果"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({'search': '不存在的關鍵字'}, queryset=queryset)
        results = filterset.qs
        
        assert results.count() == 0
    
    def test_search_case_insensitive(self, setup_test_data):
        """測試搜尋不分大小寫"""
        queryset = Product.objects.all()
        
        filterset = ProductFilter({'search': '創意'}, queryset=queryset)
        results1 = filterset.qs.count()
        
        filterset = ProductFilter({'search': '創'}, queryset=queryset)
        results2 = filterset.qs.count()
        
        assert results1 == 1
        assert results2 == 1

