# Generated migration for Category model
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='分類名稱')),
                ('slug', models.SlugField(blank=True, max_length=100, unique=True, verbose_name='Slug')),
                ('description', models.TextField(blank=True, null=True, verbose_name='描述')),
                ('sort_order', models.IntegerField(default=0, verbose_name='排序順序')),
                ('is_active', models.BooleanField(default=True, verbose_name='是否啟用')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新時間')),
            ],
            options={
                'verbose_name': '分類',
                'verbose_name_plural': '分類',
                'db_table': 'categories',
                'ordering': ['-sort_order', '-updated_at'],
            },
        ),
    ]

