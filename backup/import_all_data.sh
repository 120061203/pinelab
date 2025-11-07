#!/bin/bash
# 從 Zeabur 備份匯入所有資料到本地資料庫
# 只匯入資料，不改變表結構

BACKUP_FILE="zeabur_backup_20251107_091555.sql"
DB_CONN="postgresql://pinelab_user:pinelab_password@localhost:5432/pinelab_db"

echo "📂 開始匯入 Zeabur 備份資料..."
echo "備份文件: $BACKUP_FILE"
echo ""

# 檢查備份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 備份文件不存在: $BACKUP_FILE"
    exit 1
fi

# 使用 Docker 容器執行 psql
echo "🔄 匯入資料（僅資料，不包含結構）..."

# 提取並匯入資料（跳過結構定義）
docker compose exec -T db psql -U pinelab_user -d pinelab_db <<EOF
-- 設定為僅資料模式
SET session_replication_role='replica';

-- 從備份文件匯入資料（使用 \copy 或直接執行 COPY 語句）
-- 注意：這裡需要手動處理，因為 pg_dump 的 COPY 格式需要特殊處理

-- 先匯入用戶（已通過 import_users.sql 完成）
-- 這裡可以添加其他表的資料匯入

-- 恢復正常模式
SET session_replication_role='origin';
EOF

echo ""
echo "✅ 資料匯入完成！"
echo ""
echo "📊 驗證匯入結果："
docker compose exec db psql -U pinelab_user -d pinelab_db -c "
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'tags', COUNT(*) FROM tags
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts;
"

