from django.apps import AppConfig


class AuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.auth'
    label = 'custom_auth'  # 避免與 Django 內建 auth 衝突
    verbose_name = '認證'

