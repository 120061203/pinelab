"""
Product Serializer 測試
"""
import pytest
from decimal import Decimal
from apps.products.models import Product
from apps.products.serializers import ProductSerializer, ProductListSerializer
from apps.categories.models import Category
from apps.tags.models import Tag


@pytest.mark.django_db
class TestProductSerializer:
    """Product Serializer 測試"""
    
    def test_serialize_product(self):
        """測試序列化商品"""
        category = Category.objects.create(name='測試分類')
        tag = Tag.objects.create(name='測試標籤')
        
        product = Product.objects.create(
            name='測試商品',
            description='商品描述',
            price=Decimal('999.99'),
            category=category
        )
        product.tags.add(tag)
        
        serializer = ProductSerializer(product)
        data = serializer.data
        
        assert data['id'] == product.id
        assert data['name'] == '測試商品'
        assert data['price'] == '999.99'
        assert data['category']['name'] == '測試分類'
        assert len(data['tags']) == 1
        assert data['tags'][0]['name'] == '測試標籤'
    
    def test_product_list_serializer(self):
        """測試商品列表序列化器"""
        product = Product.objects.create(
            name='測試商品',
            price=Decimal('100')
        )
        
        serializer = ProductListSerializer(product)
        data = serializer.data
        
        assert data['id'] == product.id
        assert data['name'] == '測試商品'
        assert 'primary_image' in data
    
    def test_product_serializer_with_images(self):
        """測試商品序列化器包含圖片"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        
        from apps.products.models import ProductImage
        ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/img.jpg',
            is_primary=True
        )
        
        serializer = ProductSerializer(product)
        data = serializer.data
        
        assert len(data['images']) == 1
        assert data['images'][0]['is_primary'] is True

