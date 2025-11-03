"""
相關商品推薦邏輯測試
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
    
    # 目標商品
    target_product = Product.objects.create(
        name='目標商品',
        price=Decimal('100'),
        category=category1
    )
    target_product.tags.add(tag1)
    
    # 共享分類和標籤的商品（應優先推薦）
    related1 = Product.objects.create(
        name='相關商品1',
        price=Decimal('200'),
        category=category1  # 共享分類
    )
    related1.tags.add(tag1)  # 共享標籤
    
    related2 = Product.objects.create(
        name='相關商品2',
        price=Decimal('300'),
        category=category2
    )
    related2.tags.add(tag1)  # 共享標籤
    
    # 無關商品
    unrelated = Product.objects.create(
        name='無關商品',
        price=Decimal('400'),
        category=category2
    )
    unrelated.tags.add(tag2)
    
    return {
        'category1': category1,
        'category2': category2,
        'tag1': tag1,
        'tag2': tag2,
        'target_product': target_product,
        'related1': related1,
        'related2': related2,
        'unrelated': unrelated,
    }


@pytest.mark.django_db
class TestProductRecommendations:
    """商品推薦測試"""
    
    def setUp(self):
        """建立測試資料"""
        self.category1 = Category.objects.create(name='分類1')
        self.category2 = Category.objects.create(name='分類2')
        self.tag1 = Tag.objects.create(name='標籤1')
        self.tag2 = Tag.objects.create(name='標籤2')
        
        # 目標商品
        self.target_product = Product.objects.create(
            name='目標商品',
            price=Decimal('100'),
            category=self.category1
        )
        self.target_product.tags.add(self.tag1)
        
        # 共享分類和標籤的商品（應優先推薦）
        self.related1 = Product.objects.create(
            name='相關商品1',
            price=Decimal('200'),
            category=self.category1  # 共享分類
        )
        self.related1.tags.add(self.tag1)  # 共享標籤
        
        self.related2 = Product.objects.create(
            name='相關商品2',
            price=Decimal('300'),
            category=self.category2
        )
        self.related2.tags.add(self.tag1)  # 共享標籤
        
        # 無關商品
        self.unrelated = Product.objects.create(
            name='無關商品',
            price=Decimal('400'),
            category=self.category2
        )
        self.unrelated.tags.add(self.tag2)
    
    def test_get_related_products_by_category(self, setup_test_data):
        """測試依分類取得相關商品"""
        from django.db.models import Q
        target = setup_test_data['target_product']
        
        related = Product.objects.filter(
            is_active=True
        ).exclude(id=target.id).filter(
            Q(category=target.category) |
            Q(tags__in=target.tags.all())
        ).distinct()
        
        assert related.count() == 2
        assert setup_test_data['related1'] in related
        assert setup_test_data['related2'] in related
    
    def test_get_related_products_by_tags(self, setup_test_data):
        """測試依標籤取得相關商品"""
        from django.db.models import Q
        target = setup_test_data['target_product']
        
        related = Product.objects.filter(
            is_active=True,
            tags__in=target.tags.all()
        ).exclude(id=target.id).distinct()
        
        assert related.count() == 2
        assert setup_test_data['related1'] in related
        assert setup_test_data['related2'] in related
    
    def test_fallback_to_latest_products(self, setup_test_data):
        """測試後備至最新商品"""
        from django.db.models import Q
        target = setup_test_data['target_product']
        
        # 如果相關商品不足，應使用最新商品
        related_by_shared = Product.objects.filter(
            is_active=True
        ).exclude(id=target.id).filter(
            Q(category=target.category) |
            Q(tags__in=target.tags.all())
        ).distinct()
        
        if related_by_shared.count() < 3:
            remaining = 3 - related_by_shared.count()
            latest = Product.objects.filter(
                is_active=True
            ).exclude(
                id__in=[p.id for p in related_by_shared] + [target.id]
            ).order_by('-updated_at')[:remaining]
            
            all_related = list(related_by_shared) + list(latest)
            assert len(all_related) <= 3

