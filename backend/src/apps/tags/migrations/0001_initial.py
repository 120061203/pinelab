# Generated migration for Tag model
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True, verbose_name='標籤名稱')),
                ('slug', models.SlugField(blank=True, max_length=50, unique=True, verbose_name='Slug')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新時間')),
            ],
            options={
                'verbose_name': '標籤',
                'verbose_name_plural': '標籤',
                'db_table': 'tags',
                'ordering': ['name'],
            },
        ),
    ]

