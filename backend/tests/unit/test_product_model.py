"""
Product 模型單元測試
"""
import pytest
from decimal import Decimal
from django.core.exceptions import ValidationError
from apps.products.models import Product
from apps.categories.models import Category


@pytest.mark.django_db
class TestProductModel:
    """Product 模型測試"""
    
    def test_create_product(self):
        """測試建立商品"""
        product = Product.objects.create(
            name='測試商品',
            description='這是測試商品',
            price=Decimal('999.99')
        )
        
        assert product.id is not None
        assert product.name == '測試商品'
        assert product.price == Decimal('999.99')
        assert product.is_active is True
        assert product.sort_order == 0
    
    def test_product_slug_auto_generate(self):
        """測試 slug 自動生成"""
        product = Product.objects.create(
            name='Test Product',
            price=Decimal('100')
        )
        assert product.slug == 'test-product'
    
    def test_product_price_positive(self):
        """測試價格必須為正數"""
        # Django DecimalField 在模型層不自動驗證，但我們有 MinValueValidator
        product = Product(
            name='測試',
            price=Decimal('0')  # 應該要失敗
        )
        
        # 在保存時驗證
        with pytest.raises(ValidationError):
            product.full_clean()
    
    def test_product_with_category(self):
        """測試商品關聯分類"""
        category = Category.objects.create(name='測試分類')
        product = Product.objects.create(
            name='測試商品',
            price=Decimal('100'),
            category=category
        )
        
        assert product.category == category
        assert category.products.count() == 1
    
    def test_product_category_set_null_on_delete(self):
        """測試分類刪除時商品分類設為 NULL"""
        category = Category.objects.create(name='測試分類')
        product = Product.objects.create(
            name='測試商品',
            price=Decimal('100'),
            category=category
        )
        
        category_id = category.id
        category.delete()
        
        product.refresh_from_db()
        assert product.category is None
    
    def test_product_ordering(self):
        """測試商品排序"""
        p1 = Product.objects.create(name='商品1', price=Decimal('100'), sort_order=1)
        p2 = Product.objects.create(name='商品2', price=Decimal('200'), sort_order=2)
        p3 = Product.objects.create(name='商品3', price=Decimal('300'), sort_order=0)
        
        products = list(Product.objects.all())
        assert products[0].name == '商品2'  # sort_order DESC
        assert products[1].name == '商品1'
        assert products[2].name == '商品3'
    
    def test_product_str(self):
        """測試商品字串表示"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        assert str(product) == '測試商品'

