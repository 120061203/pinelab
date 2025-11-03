# 松果創意 Pinelab 企業官網

企業官網專案，使用 Django REST Framework 作為後端 API，Next.js 作為前端框架。

## 專案架構

```
pinelab/
├── backend/          # Django 後端
│   └── src/
│       ├── pinelab/ # Django 專案設定
│       └── apps/     # Django 應用程式
├── frontend/         # Next.js 前端
│   └── src/
├── infra/            # 基礎設施配置
│   ├── docker-compose.yml
│   └── Dockerfiles/
└── specs/            # 規格文件
```

## 快速開始

### 前置需求

- Docker 和 Docker Compose
- Node.js 18+ (本地開發前端)
- Python 3.11+ (本地開發後端)
- PostgreSQL 15+ (或使用 Docker)

### 使用 Docker Compose（推薦）

1. **複製環境變數文件**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. **啟動服務**
```bash
cd infra
docker-compose up -d
```

3. **執行資料庫遷移**
```bash
docker-compose exec backend python manage.py migrate
```

4. **建立管理員帳號**
```bash
docker-compose exec backend python manage.py createsuperuser
```

### 本地開發

#### 後端設置

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

#### 前端設置

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## API 文檔

### 公開 API

- `GET /api/products/` - 取得商品列表（支援篩選、搜尋、排序）
- `GET /api/products/{id}/` - 取得商品詳情
- `GET /api/categories/` - 取得分類列表
- `GET /api/tags/` - 取得標籤列表
- `POST /api/contact/` - 提交聯絡表單（需 HMAC-SHA256 簽章）

### 管理員 API

- `POST /api/auth/login/` - 管理員登入（JWT）
- `POST /api/auth/logout/` - 管理員登出
- `GET /api/admin/products/` - 管理商品（CRUD）
- `GET /api/admin/categories/` - 管理分類（CRUD）
- `GET /api/admin/tags/` - 管理標籤（CRUD）
- `GET /api/admin/contact/` - 管理聯絡表單

詳細 API 規格請參考 `specs/001-corporate-website/contracts/openapi.yaml`

## 測試

### 後端測試

```bash
cd backend
pytest
pytest --cov=. --cov-report=html  # 含覆蓋率報告
```

### 前端測試

```bash
cd frontend
npm test
npm run test:coverage  # 含覆蓋率報告
```

## 環境變數

### 後端 (.env)

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=pinelab_db
DB_USER=pinelab_user
DB_PASSWORD=pinelab_password
DB_HOST=localhost
DB_PORT=5432
API_SECRET_KEY=your-api-secret-key-here
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 前端 (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_SECRET_KEY=your-api-secret-key-here-must-match-backend
```

## 開發規範

- **程式碼品質**: 遵循 Constitution 文件中的品質標準
- **測試**: 單元測試覆蓋率 ≥ 80%
- **API 格式**: 統一使用 `{'status': 'success', 'data': ...}` 格式
- **認證**: 公開端點使用 HMAC-SHA256 簽章，管理端點使用 JWT

詳細規範請參考：
- `.specify/memory/constitution.md` - 專案憲法
- `specs/001-corporate-website/plan.md` - 實作計劃
- `specs/001-corporate-website/tasks.md` - 任務清單

## 部署

### 生產環境建議

1. 設定強密碼和安全的 SECRET_KEY
2. 設定 DEBUG=False
3. 配置 HTTPS
4. 設定適當的 CORS_ALLOWED_ORIGINS
5. 使用生產級資料庫（PostgreSQL）
6. 設定靜態檔案和媒體檔案服務（如 S3、CDN）

## 專案狀態

- ✅ Phase 1: Setup - 完成
- ✅ Phase 2: Foundational - 完成
- ✅ Phase 3: User Story 1 (瀏覽與發現商品) - 完成
- ✅ Phase 4: User Story 2 (聯絡企業) - 完成
- ✅ Phase 5: User Story 3 (管理內容) - 核心功能完成
- ✅ Phase 6: Polish - 核心完善功能完成

## 授權

版權所有 © 2025 松果創意 Pinelab

