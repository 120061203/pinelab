"""
認證模組 - User 模型擴充
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError


class User(AbstractUser):
    """
    擴充 Django 預設 User 模型
    管理員使用者模型
    """
    ROLE_CHOICES = [
        ('admin', '管理員'),
        ('editor', '編輯者'),
        ('analyst', '分析師'),
    ]
    
    email = models.EmailField(unique=True, blank=True, null=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='editor',
        verbose_name='角色'
    )
    is_super_admin = models.BooleanField(
        default=False,
        verbose_name='主管理員',
        help_text='系統中只能有一位主管理員'
    )
    deletion_scheduled_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='刪除預定時間',
        help_text='用於7天猶豫期管理'
    )
    deletion_requested_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='deletion_requests',
        verbose_name='刪除請求者'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = '使用者'
        verbose_name_plural = '使用者'
        constraints = [
            models.UniqueConstraint(
                fields=['is_super_admin'],
                condition=models.Q(is_super_admin=True),
                name='unique_super_admin'
            )
        ]
    
    # 覆蓋 groups 和 user_permissions 的 related_name 以避免與 Django 內建 auth 衝突
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    
    def clean(self):
        """驗證主管理員唯一性"""
        if self.is_super_admin:
            # 檢查是否已有其他主管理員（排除自己）
            existing = User.objects.filter(is_super_admin=True)
            if self.pk:
                existing = existing.exclude(pk=self.pk)
            if existing.exists():
                raise ValidationError({
                    'is_super_admin': '系統中只能有一位主管理員'
                })
    
    def save(self, *args, **kwargs):
        """保存前驗證"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        role_display = self.get_role_display()
        if self.is_super_admin:
            return f"{self.username} (主管理員)"
        return f"{self.username} ({role_display})"

