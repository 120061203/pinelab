# 資料庫備份資料夾

此資料夾用於存放資料庫備份文件。

## 備份文件命名規則

- `zeabur_backup_YYYYMMDD_HHMMSS.sql` - Zeabur 生產環境完整備份
- `local_backup_YYYYMMDD_HHMMSS.sql` - 本地開發環境備份

## 備份方式

### 從 Zeabur 備份

```bash
docker run --rm postgres:18-alpine sh -c "PGPASSWORD='<password>' pg_dump -h <host> -p <port> -U root -d zeabur --no-owner --no-acl" > backup/zeabur_backup_$(date +%Y%m%d_%H%M%S).sql
```

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

