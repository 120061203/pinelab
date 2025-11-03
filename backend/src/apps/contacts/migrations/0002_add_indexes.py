"""
添加聯絡表單模型索引優化查詢效能
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            # 聯絡表單已讀狀態和建立時間索引
            "CREATE INDEX IF NOT EXISTS idx_contact_read_created ON contacts_contact(is_read, created_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_contact_read_created;"
        ),
        migrations.RunSQL(
            # 聯絡表單電子郵件索引（用於查詢）
            "CREATE INDEX IF NOT EXISTS idx_contact_email ON contacts_contact(email);",
            reverse_sql="DROP INDEX IF EXISTS idx_contact_email;"
        ),
    ]

