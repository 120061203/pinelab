"""
添加分類模型索引優化查詢效能
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('categories', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            # 分類排序和啟用狀態索引
            "CREATE INDEX IF NOT EXISTS idx_category_sort_active ON categories_category(sort_order, is_active) WHERE is_active = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_category_sort_active;"
        ),
    ]

