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
            # 分類排序和啟用狀態索引（檢查表是否存在）
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories_category') THEN
                    CREATE INDEX IF NOT EXISTS idx_category_sort_active ON categories_category(sort_order, is_active) WHERE is_active = true;
                END IF;
            END $$;
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_category_sort_active;"
        ),
    ]

