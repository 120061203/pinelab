# 資料庫備份資料夾

此資料夾用於存放資料庫備份文件。

## 備份文件命名規則

- `zeabur_backup_YYYYMMDD_HHMMSS.sql` - Zeabur 生產環境完整備份
- `local_backup_YYYYMMDD_HHMMSS.sql` - 本地開發環境備份

## 備份方式

### 從 Zeabur 備份

⚠️ **重要**：必須使用 PostgreSQL 18 版本的 pg_dump（Zeabur 使用 PostgreSQL 18.0）

```bash
# 使用 Docker PostgreSQL 18 容器備份（推薦）
docker run --rm postgres:18-alpine sh -c "PGPASSWORD='<password>' pg_dump -h <host> -p <port> -U root -d zeabur --no-owner --no-acl --verbose" > backup/zeabur_backup_$(date +%Y%m%d_%H%M%S).sql

# 範例（請替換為實際的連接資訊）
docker run --rm postgres:18-alpine sh -c "PGPASSWORD='3IyrvKw2H506NnihT89S7Ljq4B1xCRdc' pg_dump -h sjc1.clusters.zeabur.com -p 32364 -U root -d zeabur --no-owner --no-acl" > backup/zeabur_backup_$(date +%Y%m%d_%H%M%S).sql
```

**注意**：如果使用較舊版本的 pg_dump（如 15 或 17），會出現版本不匹配錯誤並 abort。

### 從本地備份

```bash
docker compose exec db pg_dump -U pinelab_user pinelab_db --no-owner --no-acl > backup/local_backup_$(date +%Y%m%d_%H%M%S).sql
```

## 還原方式

### 還原到本地

```bash
docker compose exec -T db psql -U pinelab_user -d pinelab_db < backup/zeabur_backup_YYYYMMDD_HHMMSS.sql
```

## 注意事項

⚠️ **重要**：
- 備份文件包含敏感資料（密碼、用戶資訊等），**請勿提交到 Git**
- 此資料夾已在 `.gitignore` 中，不會被版本控制追蹤
- 定期備份生產環境資料庫
- 備份文件請妥善保管，避免洩露

