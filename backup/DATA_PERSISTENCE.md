# 資料庫資料持久化說明

## ✅ 資料持久化配置

本專案的資料庫資料已經配置為**永久保存**，不會因為重啟 Docker 而丟失。

### 配置說明

在 `docker-compose.yml` 中，資料庫服務已配置了 **Docker Volume**：

```yaml
db:
  image: postgres:15-alpine
  volumes:
    - postgres_data:/var/lib/postgresql/data  # ← 這裡配置了持久化儲存

volumes:
  postgres_data:  # ← 命名 volume，資料會保存在這裡
```

### Volume 位置

資料實際保存在：
```
/var/lib/docker/volumes/pinelab_postgres_data/_data
```

這個位置是 Docker 管理的持久化儲存，**不會**因為以下操作而丟失：
- ✅ `docker compose restart`
- ✅ `docker compose stop` / `docker compose start`
- ✅ `docker compose down`（**不使用 `-v` 參數**）

### ⚠️ 會導致資料丟失的操作

以下操作**會刪除資料**：

1. **使用 `-v` 參數刪除 volumes**：
   ```bash
   docker compose down -v  # ❌ 會刪除所有 volumes，包括資料庫資料
   ```

2. **手動刪除 volume**：
   ```bash
   docker volume rm pinelab_postgres_data  # ❌ 會刪除資料
   ```

3. **刪除整個 Docker 環境**（極端情況）

### 🔒 保護資料的最佳實踐

1. **定期備份**：
   ```bash
   docker compose exec db pg_dump -U pinelab_user pinelab_db > backup/local_backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **不要使用 `-v` 參數**：
   ```bash
   # ✅ 正確：保留 volumes
   docker compose down
   
   # ❌ 錯誤：會刪除 volumes
   docker compose down -v
   ```

3. **檢查 volume 狀態**：
   ```bash
   docker volume ls | grep pinelab
   docker volume inspect pinelab_postgres_data
   ```

### 📊 驗證資料持久化

重啟容器後，資料應該還在：

```bash
# 1. 停止容器
docker compose down

# 2. 啟動容器
docker compose up -d

# 3. 檢查資料是否還在
docker compose exec db psql -U pinelab_user -d pinelab_db -c "SELECT COUNT(*) FROM users;"
```

如果資料還在，說明持久化配置正常。

### 🔄 遷移資料到新環境

如果需要遷移資料到新環境：

1. **備份資料**：
   ```bash
   docker compose exec db pg_dump -U pinelab_user pinelab_db > backup.sql
   ```

2. **在新環境還原**：
   ```bash
   docker compose exec -T db psql -U pinelab_user -d pinelab_db < backup.sql
   ```

### 📝 總結

- ✅ **資料已配置持久化**：使用 Docker Volume
- ✅ **重啟不會丟失資料**：只要不使用 `-v` 參數
- ✅ **建議定期備份**：以防萬一
- ⚠️ **避免使用 `-v`**：會刪除所有 volumes

