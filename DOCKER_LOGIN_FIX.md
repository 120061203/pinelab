# Docker 登入 "Failed to fetch" 問題修復指南

## 問題描述

登入 Admin Portal 時出現 "Failed to fetch" 錯誤，原因是後端 Docker 容器無法啟動，缺少 `whitenoise` 模組。

## 根本原因

1. 後端容器使用的是舊的 Docker 鏡像，沒有安裝 `whitenoise` 依賴
2. `settings.py` 中配置了 `WhiteNoiseMiddleware`，但容器中沒有安裝 `whitenoise` 套件
3. 導致 Django 無法啟動，前端無法連接到後端 API

## 解決方案

### 步驟 1: 確認 requirements.txt 包含 whitenoise

確認 `backend/requirements.txt` 包含：
```
whitenoise>=6.6.0
```

### 步驟 2: 重新構建 Docker 容器

```bash
cd infra
docker-compose build backend
```

### 步驟 3: 重啟後端容器

```bash
docker-compose up -d backend
```

### 步驟 4: 檢查後端是否正常運行

```bash
# 檢查容器狀態
docker ps | grep backend

# 檢查健康檢查端點
curl http://localhost:8000/api/health/

# 檢查容器日誌
docker logs infra-backend-1 --tail 50
```

## 驗證步驟

1. **檢查後端健康狀態**：
   ```bash
   curl http://localhost:8000/api/health/
   ```
   應該返回：`{"status": "healthy", "checks": {"database": "ok", "cache": "ok"}}`

2. **檢查登入 API**：
   ```bash
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"your_username","password":"your_password"}'
   ```
   應該返回 JWT token 或錯誤訊息

3. **檢查前端連接**：
   - 打開瀏覽器開發者工具（F12）
   - 查看 Network 標籤
   - 嘗試登入，檢查是否有 CORS 錯誤或連接錯誤

## 常見問題

### 問題 1: 容器仍然無法啟動

**檢查**：
- 查看容器日誌：`docker logs infra-backend-1`
- 確認資料庫連接是否正常
- 確認環境變數是否正確設置

### 問題 2: CORS 錯誤

**解決**：
- 確認 `CORS_ALLOWED_ORIGINS` 環境變數包含前端 URL（例如：`http://localhost:3000`）
- 檢查 `backend/src/pinelab/settings.py` 中的 CORS 配置

### 問題 3: 前端 API URL 不正確

**檢查**：
- 確認前端 `.env` 或環境變數中 `NEXT_PUBLIC_API_URL` 設置正確
- 默認值為 `http://localhost:8000/api`
- 如果使用 Docker，應該使用 `http://backend:8000/api` 或 `http://localhost:8000/api`

## 預防措施

1. **定期更新 Docker 鏡像**：
   - 當 `requirements.txt` 更新時，重新構建容器
   - 使用 `docker-compose build --no-cache backend` 強制重新構建

2. **檢查依賴**：
   - 確保所有 Python 依賴都在 `requirements.txt` 中
   - 使用 `pip freeze > requirements.txt` 導出當前環境的依賴

3. **監控容器狀態**：
   - 定期檢查 `docker ps` 確認容器運行狀態
   - 設置健康檢查端點監控

## 相關文件

- `backend/requirements.txt` - Python 依賴列表
- `infra/docker-compose.yml` - Docker Compose 配置
- `backend/src/pinelab/settings.py` - Django 設定（包含 WhiteNoise 配置）

