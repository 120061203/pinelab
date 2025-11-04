# Zeabur 部署指南

## 問題：Zeabur 檢測為靜態網站

Zeabur 自動檢測到 `frontend/` 目錄中的 Next.js，誤判為靜態網站。實際上這是一個**多服務專案**，包含：

1. **Django 後端** (Port 8000)
2. **Next.js 前端** (Port 3000)
3. **PostgreSQL 資料庫** (由 Zeabur 自動提供)

## 解決方案

### 方案一：使用 Docker Compose（推薦）✨

如果 Zeabur 支援 Docker Compose，這是最簡單的方式：

1. 在 Zeabur Dashboard 中，點擊「**新增服務**」
2. 連接 GitHub 倉庫
3. 選擇「**Docker Compose**」或「**從 Docker Compose 部署**」
4. 指定 `docker-compose.yml` 文件（已在專案根目錄）

**優點：**
- 一次部署所有服務（後端、前端、資料庫）
- 自動處理服務間依賴關係
- 統一管理環境變數

**注意：** 如果 Zeabur 不支援 Docker Compose，請使用方案二。

---

### 方案二：分別創建多個服務

#### 步驟 1：創建後端服務

1. 在 Zeabur Dashboard 中，點擊「**新增服務**」或「**Add Service**」
2. 連接同一個 GitHub 倉庫
3. 配置如下：
   - **服務名稱**: `pinelab-backend` (或你喜歡的名稱)
   - **根目錄 (Root Directory)**: `backend`
   - **Dockerfile**: 自動檢測（已在 `backend/Dockerfile`）
   - **環境變數**:
     ```
     PYTHONPATH=/app/src
     SECRET_KEY=your-secret-key-here
     DEBUG=False
     DB_NAME=pinelab_db
     DB_USER=pinelab_user
     DB_PASSWORD=your-db-password
     DB_HOST=your-zeabur-postgres-host
     DB_PORT=5432
     CORS_ALLOWED_ORIGINS=https://your-frontend-domain.zeabur.app
     ALLOWED_HOSTS=your-backend-domain.zeabur.app
     ```

#### 步驟 2：創建前端服務

1. 再次點擊「**新增服務**」
2. 連接同一個 GitHub 倉庫
3. 配置如下：
   - **服務名稱**: `pinelab-frontend` (或你喜歡的名稱)
   - **根目錄 (Root Directory)**: `frontend`
   - **Dockerfile**: 自動檢測（已在 `frontend/Dockerfile`）
   - **環境變數**:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-domain.zeabur.app/api
     ```

#### 步驟 3：創建 PostgreSQL 資料庫

1. 在 Zeabur Dashboard 中，點擊「**新增服務**」
2. 選擇「**PostgreSQL**」
3. 記下資料庫連線資訊（Host, Port, Database, User, Password）
4. 將這些資訊填入後端服務的環境變數

#### 步驟 4：Dockerfile 說明

專案已包含生產環境優化的 Dockerfile：

- **後端**: `backend/Dockerfile`
  - 使用 `gunicorn` 作為 WSGI 伺服器
  - 自動執行資料庫遷移
  - 正確設置 `PYTHONPATH`

- **前端**: `frontend/Dockerfile`
  - 使用多階段構建（multi-stage build）
  - 生產環境構建（`npm run build`）
  - 運行時使用 `npm start`

#### 步驟 5：執行資料庫遷移

後端 Dockerfile 已自動執行 `python manage.py migrate`，但仍需要手動創建管理員帳號：

```bash
# 在 Zeabur 的後端服務中執行（使用 Zeabur 的「執行命令」功能）
python manage.py createsuperuser
```

或者可以在 Zeabur 的服務設定中，添加環境變數 `CREATE_SUPERUSER` 來自動創建。

---

### 方案三：使用 Zeabur 的配置按鈕

如果 Zeabur 顯示「**配置**」按鈕（如圖片中所示），可以：

1. 點擊「**配置**」按鈕
2. 手動選擇：
   - **Provider**: `Docker` 或 `Docker Compose`
   - **根目錄 (Root Directory)**: 
     - 如果選擇 Docker Compose：留空（使用根目錄的 `docker-compose.yml`）
     - 如果選擇 Docker：分別創建兩個服務
       - 後端服務：`backend`
       - 前端服務：`frontend`
   - **Dockerfile**: 自動檢測（已在各自目錄中）

這樣可以避免 Zeabur 誤判為靜態網站。

---

## Docker Compose 配置說明

專案根目錄已包含 `docker-compose.yml`，定義了三個服務：

- **backend**: Django 後端服務
- **frontend**: Next.js 前端服務  
- **db**: PostgreSQL 資料庫

### 環境變數配置

在 Zeabur 中設置以下環境變數（如果使用 Docker Compose，可以在服務設定中統一配置）：

**後端環境變數：**
```
PYTHONPATH=/app/src
SECRET_KEY=your-secret-key-here
DEBUG=False
DB_NAME=pinelab_db
DB_USER=pinelab_user
DB_PASSWORD=your-db-password
DB_HOST=db
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://frontend:3000,https://your-frontend-domain.zeabur.app
ALLOWED_HOSTS=backend,localhost,127.0.0.1,your-backend-domain.zeabur.app
```

**前端環境變數：**
```
NEXT_PUBLIC_API_URL=http://backend:8000/api
```

**注意：** 在 Docker Compose 中，服務間可以使用服務名稱（如 `backend`、`frontend`、`db`）作為主機名進行通信。

## 快速檢查清單

### 使用 Docker Compose（方案一）
- [ ] 在 Zeabur 中選擇「Docker Compose」部署方式
- [ ] 確認 `docker-compose.yml` 文件在根目錄
- [ ] 設置環境變數（後端和前端）
- [ ] 執行資料庫遷移（如果需要）
- [ ] 測試 API 端點
- [ ] 測試前端頁面

### 分別部署（方案二）
- [ ] 創建後端服務（根目錄：`backend`）
- [ ] 創建前端服務（根目錄：`frontend`）
- [ ] 創建 PostgreSQL 資料庫
- [ ] 設置後端環境變數（包含資料庫連線）
- [ ] 設置前端環境變數（包含後端 API URL）
- [ ] 執行資料庫遷移
- [ ] 測試 API 端點
- [ ] 測試前端頁面

## 常見問題

### Q: 為什麼 Zeabur 檢測為靜態網站？
A: Zeabur 在根目錄檢測到 `frontend/` 目錄中的 Next.js，自動判斷為靜態網站。需要明確指定為多服務部署。

### Q: 如何連接前端和後端？
A: 前端通過環境變數 `NEXT_PUBLIC_API_URL` 指定後端 API 的完整 URL。

### Q: 如何處理 CORS？
A: 在後端環境變數中設置 `CORS_ALLOWED_ORIGINS`，包含前端服務的完整 URL。

### Q: 資料庫遷移如何執行？
A: 可以在 Zeabur 的服務設定中添加「啟動命令」，或使用 Zeabur 的「執行命令」功能手動執行。後端 Dockerfile 已包含自動遷移命令。

### Q: Docker Compose 和分別部署哪個好？
A: 
- **Docker Compose**：更簡單，一次部署所有服務，適合開發和測試環境
- **分別部署**：更靈活，可以獨立擴展每個服務，適合生產環境

### Q: 如何確認 Zeabur 是否支援 Docker Compose？
A: 在 Zeabur Dashboard 中創建新服務時，查看是否有「Docker Compose」選項。如果沒有，使用方案二分別部署。

