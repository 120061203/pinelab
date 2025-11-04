"""
分類模型
"""
import time
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
            base_slug = slugify(self.name)
            if not base_slug:  # 如果 slugify 結果為空（例如中文名稱）
                # 使用時間戳來生成唯一 slug
                base_slug = f"category-{int(time.time())}"
            
            slug = base_slug
            counter = 1
            # 確保 slug 唯一：如果已存在，在後面加上數字
            # 使用 exclude 來排除當前對象（如果是更新操作）
            queryset = Category.objects.filter(slug=slug)
            if self.pk:
                queryset = queryset.exclude(pk=self.pk)
            
            while queryset.exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
                queryset = Category.objects.filter(slug=slug)
                if self.pk:
                    queryset = queryset.exclude(pk=self.pk)
            self.slug = slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

