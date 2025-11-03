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
        # Product 模型索引（表名為 products）
        migrations.RunSQL(
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
                    CREATE INDEX IF NOT EXISTS idx_product_name ON products(name);
                    CREATE INDEX IF NOT EXISTS idx_product_description ON products(description) WHERE description IS NOT NULL;
                    CREATE INDEX IF NOT EXISTS idx_product_category_active ON products(category_id, is_active) WHERE is_active = true;
                    CREATE INDEX IF NOT EXISTS idx_product_sort_updated ON products(sort_order DESC, updated_at DESC);
                    CREATE INDEX IF NOT EXISTS idx_product_price ON products(price);
                END IF;
            END $$;
            """,
            reverse_sql=(
                "DROP INDEX IF EXISTS idx_product_price;"
                "DROP INDEX IF EXISTS idx_product_sort_updated;"
                "DROP INDEX IF EXISTS idx_product_category_active;"
                "DROP INDEX IF EXISTS idx_product_description;"
                "DROP INDEX IF EXISTS idx_product_name;"
            ),
        ),
        # ProductImage 模型索引（表名為 product_images）
        migrations.RunSQL(
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_images') THEN
                    CREATE INDEX IF NOT EXISTS idx_productimage_sort ON product_images(product_id, sort_order);
                    CREATE INDEX IF NOT EXISTS idx_productimage_primary ON product_images(product_id, is_primary) WHERE is_primary = true;
                END IF;
            END $$;
            """,
            reverse_sql=(
                "DROP INDEX IF EXISTS idx_productimage_primary;"
                "DROP INDEX IF EXISTS idx_productimage_sort;"
            ),
        ),
    ]

