"""
分類模型
"""
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """
    商品分類模型
    """
    name = models.CharField(max_length=100, unique=True, verbose_name='分類名稱')
    slug = models.SlugField(max_length=100, unique=True, blank=True, verbose_name='Slug')
    description = models.TextField(blank=True, null=True, verbose_name='描述')
    sort_order = models.IntegerField(default=0, verbose_name='排序順序')
    is_active = models.BooleanField(default=True, verbose_name='是否啟用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')
    
    class Meta:
        db_table = 'categories'
        verbose_name = '分類'
        verbose_name_plural = '分類'
        ordering = ['-sort_order', '-updated_at']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

