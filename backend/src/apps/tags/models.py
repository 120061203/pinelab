"""
標籤模型
"""
from django.db import models
from django.utils.text import slugify


class Tag(models.Model):
    """
    商品標籤模型
    """
    name = models.CharField(max_length=50, unique=True, verbose_name='標籤名稱')
    slug = models.SlugField(max_length=50, unique=True, blank=True, verbose_name='Slug')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')
    
    class Meta:
        db_table = 'tags'
        verbose_name = '標籤'
        verbose_name_plural = '標籤'
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            # 如果 slugify 結果為空（例如純中文名稱），使用名稱的一部分
            if not base_slug:
                # 移除中文字符，保留英數字，如果還是空就用時間戳
                import re
                base_slug = re.sub(r'[^\w]', '', self.name.lower())
                if not base_slug:
                    import time
                    base_slug = f"tag-{int(time.time())}"
            
            # 確保 slug 唯一：如果已存在，在後面加上數字
            slug = base_slug
            counter = 1
            # 使用 exclude 來排除當前對象（如果是更新操作）
            queryset = Tag.objects.filter(slug=slug)
            if self.pk:
                queryset = queryset.exclude(pk=self.pk)
            
            while queryset.exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
                queryset = Tag.objects.filter(slug=slug)
                if self.pk:
                    queryset = queryset.exclude(pk=self.pk)
            
            self.slug = slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

