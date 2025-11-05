# 將本機 PostgreSQL 資料庫資料複製到 Zeabur（psql 版）

本文件記錄用 psql 將本機資料庫「資料」同步到 Zeabur PostgreSQL 的安全步驟。適用於已在 Zeabur 上先執行 Django migrations（已有資料表結構）的情況。

---

## 0. 先在 Zeabur backend 設定 DATABASE_URL（重要）

在 Zeabur 後端服務（backend）環境變數僅保留一個：

```
DATABASE_URL=postgresql://root:<password>@<host>:<port>/zeabur
```

- 請用 Zeabur PostgreSQL 服務頁面提供的實際 `<password>`、`<host>`、`<port>`
- 建議移除 `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` 以免混淆
- 重新部署 backend 後，後端即可正確連線

---

## 1. 從本機匯出「僅資料」

選擇你的本機來源：

### 1.1 若使用 Docker Compose 的 db 容器
```bash
# 導出所有資料（僅資料，無結構）
docker-compose exec db pg_dump -U pinelab_user pinelab_db --data-only > backup_data_only.sql
```

### 1.2 若直接連本機 PostgreSQL
```bash
PGPASSWORD=pinelab_password pg_dump \
  -h localhost -p 5432 \
  -U pinelab_user -d pinelab_db \
  --data-only > backup_data_only.sql
```

（可選）只導出應用資料表，避免系統表重複：
```bash
# categories/tags/products/... 等應用表
pg_dump ... --data-only \
  -t categories -t tags -t products -t product_images -t product_tags -t contacts \
  > app_data_only.sql
```

（若檔案開頭有 `\\restrict`、結尾有 `\\unrestrict`，可先移除）
```bash
# macOS/Linux
sed -i '' '/^\\\\restrict/d; /^\\\\unrestrict/d' backup_data_only.sql
```

---

## 2. 匯入到 Zeabur（psql）

先測試連線：
```bash
psql "postgresql://root:<password>@<host>:<port>/zeabur" -c "SELECT version();"
```

為避免外鍵順序問題與重複主鍵，建議流程如下：

### 2.1 清空目標應用表（謹慎）
此步驟會刪除 Zeabur 上既有的應用資料，請先確認。
```bash
psql "postgresql://root:<password>@<host>:<port>/zeabur" -c \
  "TRUNCATE TABLE product_images, product_tags, products, categories, tags, contacts RESTART IDENTITY CASCADE;"
```

### 2.2 匯入資料（關閉觸發器期間）
```bash
# 推薦使用僅資料檔（backup_data_only.sql 或 app_data_only.sql）
psql "postgresql://root:<password>@<host>:<port>/zeabur" \
  -v ON_ERROR_STOP=1 \
  -c "SET session_replication_role='replica';" \
  -f app_data_only.sql \
  -c "SET session_replication_role='origin';"
```

- 若使用 `backup_data_only.sql`，將 `-f app_data_only.sql` 改成你的檔名即可
- 若遇到重複主鍵錯誤，多半是目標表未清空；請重做 2.1 後再匯入

---

## 3. 驗證

```bash
# 連線到 Zeabur 查詢資料量
psql "postgresql://root:<password>@<host>:<port>/zeabur" -c "\\dt"   # 列表
psql "postgresql://root:<password>@<host>:<port>/zeabur" -c "SELECT count(*) FROM products;"
```

---

## 4. 常見問題

- duplicate key / multiple primary keys：
  - 因為 Zeabur 端已有結構，請使用「僅資料」檔，或先 TRUNCATE 目標表再匯入
- 外鍵錯誤（FK violation）：
  - 匯入時先執行 `SET session_replication_role='replica';` 再匯入，結束後改回 `origin`
- `\\restrict/\\unrestrict` 無效命令：
  - 這是某些 pg_dump 版本的註記，可用 sed 先移除再匯入
- 密碼含特殊字元：
  - 用 `PGPASSWORD` 方式輸入，或對 URL 內的特殊字元做百分比編碼

---

## 5. 小抄（one-liners）

```bash
# 清空應用表（謹慎）
psql "$DATABASE_URL" -c \
  "TRUNCATE TABLE product_images, product_tags, products, categories, tags, contacts RESTART IDENTITY CASCADE;"

# 關閉觸發器期間匯入
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "SET session_replication_role='replica';" -f app_data_only.sql -c "SET session_replication_role='origin';"
```

> 提醒：請以 Zeabur PostgreSQL 服務頁提供的 `<password>/<host>/<port>` 置換示例命令中的占位符。


