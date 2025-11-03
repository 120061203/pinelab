"""
ProductImage 模型單元測試
"""
import pytest
from decimal import Decimal
from apps.products.models import Product, ProductImage


@pytest.mark.django_db
class TestProductImageModel:
    """ProductImage 模型測試"""
    
    def test_create_product_image(self):
        """測試建立商品圖片"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        image = ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/image1.jpg'
        )
        
        assert image.id is not None
        assert image.product == product
        assert image.is_primary is False
        assert image.sort_order == 0
    
    def test_product_image_cascade_delete(self):
        """測試商品刪除時圖片一併刪除"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        image = ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/image1.jpg'
        )
        
        image_id = image.id
        product.delete()
        
        assert ProductImage.objects.filter(id=image_id).count() == 0
    
    def test_product_multiple_images(self):
        """測試商品多張圖片"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        
        image1 = ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/image1.jpg',
            is_primary=True
        )
        image2 = ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/image2.jpg'
        )
        
        assert product.images.count() == 2
        assert product.images.filter(is_primary=True).count() == 1
    
    def test_product_image_ordering(self):
        """測試圖片排序"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        
        img1 = ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/img1.jpg',
            sort_order=2
        )
        img2 = ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/img2.jpg',
            sort_order=1
        )
        
        images = list(product.images.all())
        assert images[0].sort_order == 1
        assert images[1].sort_order == 2
    
    def test_product_image_str(self):
        """測試圖片字串表示"""
        product = Product.objects.create(name='測試商品', price=Decimal('100'))
        image = ProductImage.objects.create(
            product=product,
            image_url='/media/products/1/image1.jpg'
        )
        assert '測試商品' in str(image)

