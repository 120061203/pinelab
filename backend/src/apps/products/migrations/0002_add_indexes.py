"""
添加資料庫索引優化查詢效能
根據 data-model.md 的建議添加索引
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        # Product 模型索引
        migrations.RunSQL(
            # 商品名稱和描述搜尋索引（GIN 用於全文搜尋，或使用 B-tree）
            "CREATE INDEX IF NOT EXISTS idx_product_name ON products_product(name);",
            reverse_sql="DROP INDEX IF EXISTS idx_product_name;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_product_description ON products_product(description) WHERE description IS NOT NULL;",
            reverse_sql="DROP INDEX IF EXISTS idx_product_description;"
        ),
        migrations.RunSQL(
            # 商品分類和啟用狀態索引
            "CREATE INDEX IF NOT EXISTS idx_product_category_active ON products_product(category_id, is_active) WHERE is_active = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_product_category_active;"
        ),
        migrations.RunSQL(
            # 商品排序和更新時間索引
            "CREATE INDEX IF NOT EXISTS idx_product_sort_updated ON products_product(sort_order DESC, updated_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_product_sort_updated;"
        ),
        migrations.RunSQL(
            # 商品價格範圍查詢索引
            "CREATE INDEX IF NOT EXISTS idx_product_price ON products_product(price);",
            reverse_sql="DROP INDEX IF EXISTS idx_product_price;"
        ),
        # ProductImage 模型索引
        migrations.RunSQL(
            # 商品圖片排序索引
            "CREATE INDEX IF NOT EXISTS idx_productimage_sort ON products_productimage(product_id, sort_order);",
            reverse_sql="DROP INDEX IF EXISTS idx_productimage_sort;"
        ),
        migrations.RunSQL(
            # 主圖查詢索引
            "CREATE INDEX IF NOT EXISTS idx_productimage_primary ON products_productimage(product_id, is_primary) WHERE is_primary = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_productimage_primary;"
        ),
    ]

