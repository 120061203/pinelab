# Generated migration for SiteSettings, News, Service models
from django.db import migrations, models


def create_site_settings(apps, schema_editor):
    """建立 SiteSettings 單例記錄"""
    SiteSettings = apps.get_model('site_settings', 'SiteSettings')
    SiteSettings.objects.get_or_create(key='site_settings')


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SiteSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(default='site_settings', max_length=50, unique=True, verbose_name='唯一標識')),
                ('brand_name', models.CharField(blank=True, max_length=200, null=True, verbose_name='品牌名稱')),
                ('brand_slogan', models.CharField(blank=True, max_length=500, null=True, verbose_name='品牌標語')),
                ('logo_url', models.CharField(blank=True, max_length=500, null=True, verbose_name='Logo URL')),
                ('hero_banner_url', models.CharField(blank=True, max_length=500, null=True, verbose_name='Hero橫幅 URL')),
                ('shopee_link', models.URLField(blank=True, max_length=500, null=True, verbose_name='蝦皮私訊連結')),
                ('line_at_link', models.URLField(blank=True, max_length=500, null=True, verbose_name='Line@ 連結')),
                ('mall_link', models.URLField(blank=True, max_length=500, null=True, verbose_name='商城連結')),
                ('fan_page_link', models.URLField(blank=True, max_length=500, null=True, verbose_name='粉絲團連結')),
                ('blog_link', models.URLField(blank=True, max_length=500, null=True, verbose_name='部落格連結')),
                ('show_price', models.BooleanField(default=True, verbose_name='顯示商品價格')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新時間')),
            ],
            options={
                'verbose_name': '網站設定',
                'verbose_name_plural': '網站設定',
                'db_table': 'site_settings',
            },
        ),
        migrations.CreateModel(
            name='News',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='標題')),
                ('content', models.TextField(max_length=5000, verbose_name='內容')),
                ('publish_date', models.DateField(verbose_name='發布日期')),
                ('status', models.CharField(choices=[('draft', '草稿'), ('published', '已發布')], default='draft', max_length=20, verbose_name='發布狀態')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新時間')),
            ],
            options={
                'verbose_name': '最新消息',
                'verbose_name_plural': '最新消息',
                'db_table': 'news',
                'ordering': ['-publish_date', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Service',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100, verbose_name='標題')),
                ('description', models.CharField(max_length=500, verbose_name='描述')),
                ('icon_type', models.CharField(blank=True, choices=[('fontawesome', 'Font Awesome'), ('material', 'Material Icons'), ('custom', '自訂圖標')], max_length=20, null=True, verbose_name='圖標類型')),
                ('icon_value', models.CharField(blank=True, max_length=500, null=True, verbose_name='圖標值')),
                ('sort_order', models.IntegerField(default=0, verbose_name='排序順序')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新時間')),
            ],
            options={
                'verbose_name': '服務項目',
                'verbose_name_plural': '服務項目',
                'db_table': 'services',
                'ordering': ['-sort_order', '-updated_at'],
            },
        ),
        # 索引已通過手動 SQL 創建，這裡跳過以避免衝突
        # migrations.AddIndex(
        #     model_name='news',
        #     index=models.Index(fields=['status']),
        # ),
        # migrations.AddIndex(
        #     model_name='news',
        #     index=models.Index(fields=['publish_date'], name='news_publish_date_idx'),
        # ),
        # migrations.AddIndex(
        #     model_name='news',
        #     index=models.Index(fields=['-publish_date', 'status'], name='news_publish_date_status_idx'),
        # ),
        # 索引已通過手動 SQL 創建，這裡跳過以避免衝突
        # migrations.AddIndex(
        #     model_name='service',
        #     index=models.Index(fields=['sort_order'], name='services_sort_order_idx'),
        # ),
        # migrations.AddIndex(
        #     model_name='service',
        #     index=models.Index(fields=['-sort_order', '-updated_at'], name='services_sort_order_updated_idx'),
        # ),
        migrations.RunPython(create_site_settings),
    ]

