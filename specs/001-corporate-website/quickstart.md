# 快速開始指南：松果創意 Pinelab 企業官網

**建立日期**: 2025-11-03  
**適用對象**: 開發人員

## 概述

本指南提供 Pinelab 企業官網專案的快速啟動步驟，包括環境設置、資料庫初始化、API 啟動和前端開發。

---

## 前置需求

### 必需軟體

- **Python** 3.11+
- **Node.js** 18+ 和 npm/yarn
- **PostgreSQL** 15+
- **Docker** 和 Docker Compose（可選，用於容器化部署）
- **Git**

### 檢查安裝

```bash
python --version    # 應顯示 3.11+
node --version      # 應顯示 18+
psql --version      # 應顯示 15+
docker --version    # Docker 已安裝
```

---

## 步驟 1: 克隆專案

```bash
git clone git@github.com:120061203/pinelab.git
cd pinelab
git checkout 001-corporate-website
```

---

## 步驟 2: 後端設置（Django）

### 2.1 建立虛擬環境

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

### 2.2 安裝依賴

```bash
pip install -r requirements.txt
```

### 2.3 設定環境變數

複製 `.env.example` 並建立 `.env`：

```bash
cp .env.example .env
```

編輯 `.env` 文件：

```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pinelab

# API Security
API_SECRET_KEY=your-api-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_EXPIRE_HOURS=24

# Media Files
MEDIA_ROOT=/app/media
MEDIA_URL=/media/

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 2.4 資料庫遷移

```bash
python manage.py migrate
```

### 2.5 建立超級使用者

```bash
python manage.py createsuperuser
```

### 2.6 載入樣本資料（可選）

```bash
python manage.py loaddata fixtures/sample_data.json
```

### 2.7 啟動開發伺服器

```bash
python manage.py runserver
```

後端 API 現在運行在 `http://localhost:8000`

---

## 步驟 3: 前端設置（Next.js）

### 3.1 安裝依賴

```bash
cd frontend
npm install
# 或
yarn install
```

### 3.2 設定環境變數

複製 `.env.example` 並建立 `.env.local`：

```bash
cp .env.example .env.local
```

編輯 `.env.local`：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_SECRET_KEY=your-api-secret-key-here  # 需與後端一致
```

### 3.3 啟動開發伺服器

```bash
npm run dev
# 或
yarn dev
```

前端現在運行在 `http://localhost:3000`

---

## 步驟 4: 驗證安裝

### 4.1 測試後端 API

```bash
# 測試公開端點
curl http://localhost:8000/api/products/
curl http://localhost:8000/api/categories/
curl http://localhost:8000/api/tags/
```

### 4.2 測試前端

1. 開啟瀏覽器訪問 `http://localhost:3000`
2. 應該看到首頁，顯示品牌介紹和最新商品
3. 點擊「商品」連結，應該看到商品列表頁

### 4.3 測試管理員登入

```bash
# 登入取得 Token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'

# 使用 Token 存取管理端點
curl http://localhost:8000/api/admin/products/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 步驟 5: 使用 Docker Compose（可選）

### 5.1 啟動所有服務

```bash
# 在專案根目錄
docker-compose up -d
```

### 5.2 查看服務狀態

```bash
docker-compose ps
```

### 5.3 查看日誌

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5.4 停止服務

```bash
docker-compose down
```

---

## 開發工作流程

### 後端開發

1. **建立新 Django App**:
   ```bash
   cd backend
   python manage.py startapp app_name
   ```

2. **建立資料庫遷移**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **執行測試**:
   ```bash
   pytest
   pytest --cov  # 含覆蓋率
   ```

### 前端開發

1. **建立新頁面**:
   ```bash
   # Next.js App Router
   touch frontend/src/app/new-page/page.tsx
   ```

2. **執行測試**:
   ```bash
   npm test
   npm run test:watch
   ```

3. **類型檢查**:
   ```bash
   npm run type-check
   ```

---

## 常見問題

### 問題 1: 資料庫連線失敗

**解決方案**:
- 確認 PostgreSQL 正在運行
- 檢查 `.env` 中的 `DATABASE_URL` 是否正確
- 確認資料庫使用者有足夠權限

### 問題 2: CORS 錯誤

**解決方案**:
- 確認後端 `.env` 中的 `CORS_ALLOWED_ORIGINS` 包含前端 URL
- 檢查 `django-cors-headers` 是否已安裝

### 問題 3: API 簽章驗證失敗

**解決方案**:
- 確認前後端的 `API_SECRET_KEY` 一致
- 檢查簽章生成邏輯是否正確
- 確認 `timestamp` 在有效時間範圍內（±5 分鐘）

### 問題 4: 圖片上傳失敗

**解決方案**:
- 確認 `MEDIA_ROOT` 目錄存在且有寫入權限
- 檢查圖片格式是否符合規範（jpg, png, webp）
- 確認圖片大小不超過 5MB

---

## 下一步

1. 閱讀 [API 規範](./contracts/README.md)
2. 查看 [資料模型設計](./data-model.md)
3. 參考 [技術決策文件](../../SDD/TECHNICAL_DECISIONS.md)
4. 開始實作功能模組

---

## 資源連結

- **API 文件**: `/specs/001-corporate-website/contracts/openapi.yaml`
- **資料模型**: `/specs/001-corporate-website/data-model.md`
- **技術決策**: `/SDD/TECHNICAL_DECISIONS.md`
- **SDD 規格**: `/SDD/SDD_SPECIFICATION.md`

---

## 支援

如有問題，請：
1. 查看專案文件
2. 檢查 GitHub Issues
3. 聯繫開發團隊

