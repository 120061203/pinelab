"""
網站設定模型
"""
from django.db import models
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
import json


class SiteSettings(models.Model):
    """
    網站設定模型（單例模式）
    系統中只存在一筆記錄
    """
    key = models.CharField(
        max_length=50,
        unique=True,
        default='site_settings',
        verbose_name='唯一標識'
    )
    brand_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='品牌名稱'
    )
    brand_slogan = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name='品牌標語'
    )
    logo_url = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name='Logo URL'
    )
    hero_banner_url = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name='Hero橫幅 URL'
    )
    external_links = models.JSONField(
        default=list,
        blank=True,
        verbose_name='外部連結',
        help_text='格式：[{"name": "顯示名稱", "url": "https://..."}]'
    )
    show_price = models.BooleanField(
        default=True,
        verbose_name='顯示商品價格'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='建立時間'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新時間'
    )
    
    class Meta:
        db_table = 'site_settings'
        verbose_name = '網站設定'
        verbose_name_plural = '網站設定'
    
    @classmethod
    def get_instance(cls):
        """
        取得單例實例，如果不存在則建立
        """
        instance, created = cls.objects.get_or_create(key='site_settings')
        return instance
    
    def clean(self):
        """驗證欄位"""
        super().clean()
        # 驗證外部連結格式
        if self.external_links:
            if not isinstance(self.external_links, list):
                raise ValidationError({
                    'external_links': '外部連結必須是一個陣列'
                })
            
            url_validator = URLValidator()
            for idx, link in enumerate(self.external_links):
                if not isinstance(link, dict):
                    raise ValidationError({
                        'external_links': f'外部連結第 {idx + 1} 項必須是一個物件'
                    })
                
                if 'name' not in link or not link['name']:
                    raise ValidationError({
                        'external_links': f'外部連結第 {idx + 1} 項缺少顯示名稱'
                    })
                
                if 'url' not in link or not link['url']:
                    raise ValidationError({
                        'external_links': f'外部連結第 {idx + 1} 項缺少 URL'
                    })
                
                # 驗證 URL 格式
                try:
                    url_validator(link['url'])
                except ValidationError:
                    raise ValidationError({
                        'external_links': f'外部連結第 {idx + 1} 項的 URL 格式無效'
                    })
    
    def save(self, *args, **kwargs):
        """儲存前驗證"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f'Site Settings ({self.key})'


class News(models.Model):
    """
    最新消息模型
    """
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已發布'),
    ]
    
    title = models.CharField(
        max_length=200,
        verbose_name='標題'
    )
    content = models.TextField(
        max_length=5000,
        verbose_name='內容'
    )
    publish_date = models.DateField(
        verbose_name='發布日期'
    )
    image_url = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name='圖片 URL'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='發布狀態'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='建立時間'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新時間'
    )
    
    class Meta:
        db_table = 'news'
        verbose_name = '最新消息'
        verbose_name_plural = '最新消息'
        ordering = ['-publish_date', '-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['publish_date']),
            models.Index(fields=['-publish_date', 'status']),
        ]
    
    def __str__(self):
        return self.title


class Service(models.Model):
    """
    服務項目模型
    """
    ICON_TYPE_CHOICES = [
        ('fontawesome', 'Font Awesome'),
        ('material', 'Material Icons'),
        ('custom', '自訂圖標'),
    ]
    
    title = models.CharField(
        max_length=100,
        verbose_name='標題'
    )
    description = models.CharField(
        max_length=500,
        verbose_name='描述'
    )
    icon_type = models.CharField(
        max_length=20,
        choices=ICON_TYPE_CHOICES,
        blank=True,
        null=True,
        verbose_name='圖標類型'
    )
    icon_value = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name='圖標值'
    )
    sort_order = models.IntegerField(
        default=0,
        verbose_name='排序順序'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='建立時間'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新時間'
    )
    
    class Meta:
        db_table = 'services'
        verbose_name = '服務項目'
        verbose_name_plural = '服務項目'
        ordering = ['-sort_order', '-updated_at']
        indexes = [
            models.Index(fields=['sort_order']),
            models.Index(fields=['-sort_order', '-updated_at']),
        ]
    
    def clean(self):
        """驗證圖標欄位"""
        super().clean()
        # 如果 icon_type 為 NULL，icon_value 也必須為 NULL
        if not self.icon_type and self.icon_value:
            raise ValidationError({
                'icon_value': '當圖標類型為空時，圖標值也必須為空'
            })
        # 如果 icon_type 有值，icon_value 也必須有值
        if self.icon_type and not self.icon_value:
            raise ValidationError({
                'icon_value': '當圖標類型有值時，圖標值也必須有值'
            })
    
    def save(self, *args, **kwargs):
        """儲存前驗證"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title

