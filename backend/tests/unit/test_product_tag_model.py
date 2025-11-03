"""
ProductTag 關聯模型單元測試
"""
import pytest
from decimal import Decimal
from apps.products.models import Product, ProductTag
from apps.tags.models import Tag


@pytest.mark.django_db
class TestProductTagModel:
    """ProductTag 模型測試"""
    
    def test_create_product_tag(self):
        """測試建立商品標籤關聯"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        tag = Tag.objects.create(name='測試標籤')
        
        product_tag = ProductTag.objects.create(product=product, tag=tag)
        
        assert product_tag.id is not None
        assert product_tag.product == product
        assert product_tag.tag == tag
    
    def test_product_tag_unique_constraint(self):
        """測試商品標籤關聯唯一性"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        tag = Tag.objects.create(name='測試標籤')
        
        ProductTag.objects.create(product=product, tag=tag)
        
        # 重複關聯應該失敗
        with pytest.raises(Exception):
            ProductTag.objects.create(product=product, tag=tag)
    
    def test_product_multiple_tags(self):
        """測試商品多個標籤"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        tag1 = Tag.objects.create(name='標籤1')
        tag2 = Tag.objects.create(name='標籤2')
        
        ProductTag.objects.create(product=product, tag=tag1)
        ProductTag.objects.create(product=product, tag=tag2)
        
        assert product.tags.count() == 2
    
    def test_tag_multiple_products(self):
        """測試標籤多個商品"""
        product1 = Product.objects.create(name='商品1', price=Decimal('100'))
        product2 = Product.objects.create(name='商品2', price=Decimal('200'))
        tag = Tag.objects.create(name='共用標籤')
        
        ProductTag.objects.create(product=product1, tag=tag)
        ProductTag.objects.create(product=product2, tag=tag)
        
        assert tag.products.count() == 2
    
    def test_product_tag_cascade_delete(self):
        """測試商品或標籤刪除時關聯自動刪除"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        tag = Tag.objects.create(name='測試標籤')
        product_tag = ProductTag.objects.create(product=product, tag=tag)
        
        # 刪除商品
        product_id = product.id
        product.delete()
        
        assert ProductTag.objects.filter(id=product_tag.id).count() == 0
        
        # 刪除標籤
        product2 = Product.objects.create(name='商品2', price=Decimal('200'))
        tag2 = Tag.objects.create(name='標籤2')
        product_tag2 = ProductTag.objects.create(product=product2, tag=tag2)
        
        tag2.delete()
        assert ProductTag.objects.filter(id=product_tag2.id).count() == 0

