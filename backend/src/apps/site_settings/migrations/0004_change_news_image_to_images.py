# Generated manually

from django.db import migrations, models
import json


def migrate_image_url_to_images(apps, schema_editor):
    """
    將舊的 image_url 遷移到新的 images JSONField
    """
    News = apps.get_model('site_settings', 'News')
    
    for news in News.objects.all():
        if news.image_url:
            # 將舊的 image_url 轉換為 images 格式
            news.images = [{'url': news.image_url, 'alt': ''}]
            news.save(update_fields=['images'])


def reverse_migrate_images_to_image_url(apps, schema_editor):
    """
    反向遷移：將 images 的第一張圖片遷移到 image_url
    """
    News = apps.get_model('site_settings', 'News')
    
    for news in News.objects.all():
        if news.images and len(news.images) > 0:
            news.image_url = news.images[0].get('url', '')
            news.save(update_fields=['image_url'])


class Migration(migrations.Migration):

    dependencies = [
        ('site_settings', '0001_initial'),
    ]

    operations = [
        # 添加新的 images 欄位
        migrations.AddField(
            model_name='news',
            name='images',
            field=models.JSONField(blank=True, default=list, help_text='格式：[{"url": "/media/site/news/image.jpg", "alt": "圖片描述"}]', verbose_name='圖片列表'),
        ),
        # 執行數據遷移
        migrations.RunPython(migrate_image_url_to_images, reverse_migrate_images_to_image_url),
        # 刪除舊的 image_url 欄位
        migrations.RemoveField(
            model_name='news',
            name='image_url',
        ),
        # 更新 content 欄位的 max_length
        migrations.AlterField(
            model_name='news',
            name='content',
            field=models.TextField(max_length=10000, verbose_name='內容'),
        ),
    ]

