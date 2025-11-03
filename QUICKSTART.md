# 快速啟動指南

## 方式一：使用 Docker Compose（推薦）

### 1. 前置需求

- Docker Desktop 已安裝並運行
- Git 已安裝

### 2. 設置環境變數

```bash
# 複製後端環境變數文件
cp backend/.env.example backend/.env

# 複製前端環境變數文件
cp frontend/.env.example frontend/.env.local
```

### 3. 啟動服務

```bash
cd infra
docker-compose up -d
```

這會啟動：
- PostgreSQL 資料庫（端口 5432）
- Django 後端（端口 8000）
- Next.js 前端（端口 3000）

### 4. 初始化資料庫

```bash
# 執行遷移
docker-compose exec backend python manage.py migrate

# 建立管理員帳號（可選）
docker-compose exec backend python manage.py createsuperuser
```

### 5. 訪問應用

- **前端網站**: http://localhost:3000
- **後端 API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **健康檢查**: http://localhost:8000/api/health/

### 6. 查看日誌

```bash
# 查看所有服務日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 7. 停止服務

```bash
docker-compose down
```

---

## 方式二：本地開發（不使用 Docker）

### 後端設置

#### 1. 安裝依賴

```bash
cd backend
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

#### 2. 設置環境變數

```bash
cp .env.example .env
# 編輯 .env 文件，設定資料庫連線資訊
```

#### 3. 設置資料庫

確保 PostgreSQL 正在運行，然後：

```bash
# 執行遷移
python manage.py migrate

# 建立管理員帳號
python manage.py createsuperuser
```

#### 4. 啟動後端

```bash
python manage.py runserver
```

後端將在 http://localhost:8000 運行

### 前端設置

#### 1. 安裝依賴

```bash
cd frontend
npm install
```

#### 2. 設置環境變數

```bash
cp .env.example .env.local
# 確保 NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### 3. 啟動前端

```bash
npm run dev
```

前端將在 http://localhost:3000 運行

---

## 常見問題

### 1. 資料庫連線失敗

檢查：
- PostgreSQL 是否正在運行
- `.env` 中的資料庫設定是否正確
- Docker Compose 中資料庫服務是否健康

### 2. 前端無法連接到後端

檢查：
- 後端是否正在運行（http://localhost:8000）
- `frontend/.env.local` 中的 `NEXT_PUBLIC_API_URL` 設定是否正確
- CORS 設定是否允許前端來源

### 3. 遷移失敗

```bash
# 檢查資料庫連線
docker-compose exec backend python manage.py dbshell

# 如果需要重置資料庫（⚠️ 會刪除所有資料）
docker-compose exec backend python manage.py flush
docker-compose exec backend python manage.py migrate
```

### 4. 端口已被占用

如果 3000 或 8000 端口已被占用：

**Docker Compose**：編輯 `infra/docker-compose.yml` 修改端口映射

**本地開發**：
- 後端：`python manage.py runserver 8001`
- 前端：`npm run dev -- -p 3001`

---

## 測試

### 後端測試

```bash
# 使用 Docker
docker-compose exec backend pytest

# 本地開發
cd backend
pytest
```

### 前端測試

```bash
# 使用 Docker（需要進入容器）
docker-compose exec frontend npm test

# 本地開發
cd frontend
npm test
```

---

## 下一步

1. 訪問 http://localhost:3000 查看前端網站
2. 訪問 http://localhost:8000/admin 使用 Django Admin 管理資料
3. 查看 API 文檔：`specs/001-corporate-website/contracts/openapi.yaml`
4. 閱讀完整文檔：`README.md` 和 `specs/001-corporate-website/quickstart.md`

---

## 環境變數說明

### 後端 (.env)

```env
SECRET_KEY=your-secret-key-here          # Django SECRET_KEY
DEBUG=True                                # 開發模式
DB_NAME=pinelab_db                        # 資料庫名稱
DB_USER=pinelab_user                      # 資料庫用戶
DB_PASSWORD=pinelab_password              # 資料庫密碼
DB_HOST=localhost                         # 資料庫主機（Docker 使用 'db'）
DB_PORT=5432                              # 資料庫端口
API_SECRET_KEY=your-api-secret-key-here  # HMAC-SHA256 簽章密鑰
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 前端 (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_SECRET_KEY=your-api-secret-key-here  # 必須與後端相同
```

**⚠️ 重要**：前後端的 `API_SECRET_KEY` 必須相同，否則簽章驗證會失敗。

