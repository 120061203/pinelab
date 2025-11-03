# Generated migration for Product, ProductImage, ProductTag models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import migrations, models
import django.db.models.deletion
from decimal import Decimal


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('categories', '0001_initial'),
        ('tags', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='商品名稱')),
                ('slug', models.SlugField(blank=True, max_length=200, unique=True, verbose_name='Slug')),
                ('description', models.TextField(blank=True, null=True, verbose_name='描述')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='價格')),
                ('sort_order', models.IntegerField(default=0, verbose_name='排序順序')),
                ('is_active', models.BooleanField(default=True, verbose_name='是否啟用')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新時間')),
                ('category', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products', to='categories.category', verbose_name='分類')),
            ],
            options={
                'verbose_name': '商品',
                'verbose_name_plural': '商品',
                'db_table': 'products',
                'ordering': ['-sort_order', '-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image_url', models.CharField(max_length=500, verbose_name='圖片 URL')),
                ('sort_order', models.IntegerField(default=0, verbose_name='排序順序')),
                ('is_primary', models.BooleanField(default=False, verbose_name='是否為主圖')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='products.product', verbose_name='商品')),
            ],
            options={
                'verbose_name': '商品圖片',
                'verbose_name_plural': '商品圖片',
                'db_table': 'product_images',
                'ordering': ['sort_order', 'created_at'],
            },
        ),
        migrations.CreateModel(
            name='ProductTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='products.product', verbose_name='商品')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tags.tag', verbose_name='標籤')),
            ],
            options={
                'verbose_name': '商品標籤關聯',
                'verbose_name_plural': '商品標籤關聯',
                'db_table': 'product_tags',
                'unique_together': {('product', 'tag')},
            },
        ),
        migrations.AddField(
            model_name='product',
            name='tags',
            field=models.ManyToManyField(related_name='products', through='products.ProductTag', to='tags.tag', verbose_name='標籤'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['category'], name='products_category_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['is_active'], name='products_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['-sort_order', '-updated_at'], name='products_sort_idx'),
        ),
        migrations.AddIndex(
            model_name='productimage',
            index=models.Index(fields=['product'], name='product_images_product_idx'),
        ),
        migrations.AddIndex(
            model_name='productimage',
            index=models.Index(fields=['product', 'is_primary'], name='product_images_primary_idx'),
        ),
        migrations.AddIndex(
            model_name='producttag',
            index=models.Index(fields=['product'], name='product_tags_product_idx'),
        ),
        migrations.AddIndex(
            model_name='producttag',
            index=models.Index(fields=['tag'], name='product_tags_tag_idx'),
        ),
    ]

