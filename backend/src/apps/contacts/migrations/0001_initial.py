# Generated migration for Contact model
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='姓名')),
                ('email', models.EmailField(verbose_name='電子郵件')),
                ('message', models.TextField(verbose_name='訊息')),
                ('is_read', models.BooleanField(default=False, verbose_name='是否已讀')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='提交時間')),
            ],
            options={
                'verbose_name': '聯絡表單',
                'verbose_name_plural': '聯絡表單',
                'db_table': 'contacts',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='contact',
            index=models.Index(fields=['is_read'], name='contacts_is_read_idx'),
        ),
        migrations.AddIndex(
            model_name='contact',
            index=models.Index(fields=['-created_at'], name='contacts_created_idx'),
        ),
    ]

