"""
聯絡表單模型
"""
from django.db import models
from django.core.validators import MinLengthValidator


class Contact(models.Model):
    """
    聯絡表單模型
    """
    name = models.CharField(max_length=100, verbose_name='姓名')
    email = models.EmailField(verbose_name='電子郵件')
    message = models.TextField(
        validators=[MinLengthValidator(10)],
        verbose_name='訊息'
    )
    is_read = models.BooleanField(default=False, verbose_name='是否已讀')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='提交時間')
    
    class Meta:
        db_table = 'contacts'
        verbose_name = '聯絡表單'
        verbose_name_plural = '聯絡表單'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_read']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.email}"

