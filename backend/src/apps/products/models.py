"""
商品模型
"""
from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.categories.models import Category
from apps.tags.models import Tag


class Product(models.Model):
    """
    商品模型
    """
    name = models.CharField(max_length=200, verbose_name='商品名稱')
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name='Slug')
    description = models.TextField(blank=True, null=True, verbose_name='描述')
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='價格'
    )
    sort_order = models.IntegerField(default=0, verbose_name='排序順序')
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name='分類'
    )
    tags = models.ManyToManyField(Tag, through='ProductTag', related_name='products', verbose_name='標籤')
    is_active = models.BooleanField(default=True, verbose_name='是否啟用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')
    
    class Meta:
        db_table = 'products'
        verbose_name = '商品'
        verbose_name_plural = '商品'
        ordering = ['-sort_order', '-updated_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
            models.Index(fields=['-sort_order', '-updated_at']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """
    商品圖片模型
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='商品'
    )
    image_url = models.CharField(max_length=500, verbose_name='圖片 URL')
    sort_order = models.IntegerField(default=0, verbose_name='排序順序')
    is_primary = models.BooleanField(default=False, verbose_name='是否為主圖')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    
    class Meta:
        db_table = 'product_images'
        verbose_name = '商品圖片'
        verbose_name_plural = '商品圖片'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['product', 'is_primary']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - Image {self.id}"


class ProductTag(models.Model):
    """
    Product 與 Tag 的多對多關聯表
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='商品')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, verbose_name='標籤')
    
    class Meta:
        db_table = 'product_tags'
        verbose_name = '商品標籤關聯'
        verbose_name_plural = '商品標籤關聯'
        unique_together = [['product', 'tag']]
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['tag']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - {self.tag.name}"

