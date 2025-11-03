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
            # 聯絡表單已讀狀態和建立時間索引（檢查正確資料表名稱）
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contacts'
                ) THEN
                    CREATE INDEX IF NOT EXISTS idx_contact_read_created ON contacts(is_read, created_at DESC);
                END IF;
            END $$;
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_contact_read_created;"
        ),
        migrations.RunSQL(
            # 聯絡表單電子郵件索引（用於查詢）
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contacts'
                ) THEN
                    CREATE INDEX IF NOT EXISTS idx_contact_email ON contacts(email);
                END IF;
            END $$;
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_contact_email;"
        ),
    ]

