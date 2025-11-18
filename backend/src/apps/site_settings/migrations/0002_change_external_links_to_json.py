# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('site_settings', '0001_initial'),
    ]

    operations = [
        # 添加新的 external_links 欄位
        migrations.AddField(
            model_name='sitesettings',
            name='external_links',
            field=models.JSONField(blank=True, default=list, help_text='格式：[{"name": "顯示名稱", "url": "https://..."}]', verbose_name='外部連結'),
        ),
        # 刪除舊的固定連結欄位
        migrations.RemoveField(
            model_name='sitesettings',
            name='shopee_link',
        ),
        migrations.RemoveField(
            model_name='sitesettings',
            name='line_at_link',
        ),
        migrations.RemoveField(
            model_name='sitesettings',
            name='mall_link',
        ),
        migrations.RemoveField(
            model_name='sitesettings',
            name='fan_page_link',
        ),
        migrations.RemoveField(
            model_name='sitesettings',
            name='blog_link',
        ),
    ]

