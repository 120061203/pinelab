# Zeabur 部署問題排查指南

## ❌ 錯誤：`requirements.txt not found`

### 問題描述
```
ERROR: failed to calculate checksum of ref ... "/requirements.txt": not found
```

### 原因
Zeabur 的 build context（構建上下文）設置不正確，導致 Dockerfile 無法找到 `requirements.txt` 文件。

### 解決方案

#### 方案 A：檢查根目錄設置

1. 進入 Zeabur Dashboard
2. 選擇你的後端服務
3. 進入「**設定**」或「**Settings**」
4. 檢查「**根目錄 (Root Directory)**」或「**Build Context**」
5. 確保設置為：`backend`

**重要：** 根目錄必須是 `backend`，這樣 Dockerfile 才能找到：
- `requirements.txt`
- `manage.py`
- `src/` 目錄

#### 方案 B：檢查 Dockerfile 路徑

1. 進入服務設定
2. 檢查「**Dockerfile 路徑**」
3. 應該設置為：
   - `Dockerfile`（如果根目錄是 `backend`）
   - 或 `backend/Dockerfile`（如果根目錄是專案根目錄）

#### 方案 C：使用配置按鈕重新設置

1. 在 Zeabur 的「建置方案預覽」中，點擊「**配置**」按鈕
2. 選擇：
   - **Provider**: `Docker`
   - **根目錄 (Root Directory)**: `backend`
   - **Dockerfile**: `Dockerfile`（自動檢測）

#### 方案 D：確認文件結構

確保你的專案結構如下：
```
pinelab/
├── backend/
│   ├── Dockerfile        ← 這裡
│   ├── requirements.txt  ← 這裡
│   ├── manage.py
│   └── src/
├── frontend/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

### 驗證步驟

1. 確認 `backend/requirements.txt` 存在
2. 確認 `backend/Dockerfile` 存在
3. 在 Zeabur 中檢查根目錄設置
4. 重新部署服務

---

## ❌ 錯誤：前端構建失敗 - `/frontend` not found

### 問題描述
```
ERROR: failed to calculate checksum ... "/frontend": not found
> [builder 5/6] COPY frontend .
```

### 原因
Zeabur 的 build context（構建上下文）設置不正確，導致 Dockerfile 無法找到前端文件。

### 解決方案

#### 方案 A：檢查根目錄設置

1. 進入 Zeabur Dashboard
2. 選擇你的前端服務
3. 進入「**設定**」或「**Settings**」
4. 檢查「**根目錄 (Root Directory)**」或「**Build Context**」
5. 確保設置為：`frontend`

**重要：** 根目錄必須是 `frontend`，這樣 Dockerfile 才能找到：
- `package.json`
- `next.config.js`
- `src/` 目錄
- `public/` 目錄

#### 方案 B：使用配置按鈕重新設置

1. 在 Zeabur 的「建置方案預覽」中，點擊「**配置**」按鈕
2. 選擇：
   - **Provider**: `Docker`
   - **根目錄 (Root Directory)**: `frontend`
   - **Dockerfile**: `Dockerfile`（自動檢測）

#### 方案 C：確認文件結構

確保你的專案結構如下：
```
pinelab/
├── backend/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile        ← 這裡
│   ├── package.json      ← 這裡
│   ├── next.config.js
│   ├── src/
│   └── public/
└── docker-compose.yml
```

### 其他前端構建問題

如果遇到 `package.json not found` 或 `npm install` 失敗：

1. 確保前端服務的根目錄設置為：`frontend`
2. 確認 `frontend/package.json` 存在
3. 檢查 Dockerfile 路徑是否正確

---

## ❌ 錯誤：資料庫連線失敗

### 問題描述
後端無法連接到資料庫

### 解決方案

1. **檢查環境變數**：
   - `DB_HOST`：如果使用 Docker Compose，應該是 `db`；如果使用外部資料庫，使用實際主機名
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`：必須與資料庫服務的設定一致

2. **檢查資料庫服務**：
   - 確認 PostgreSQL 服務正在運行
   - 確認資料庫已創建

3. **檢查網路連線**：
   - 如果使用 Docker Compose，服務間可以通過服務名稱通信
   - 如果分別部署，確保使用正確的主機名和端口

---

## ❌ 錯誤：CORS 錯誤

### 問題描述
前端無法調用後端 API，出現 CORS 錯誤

### 解決方案

1. 檢查後端的 `CORS_ALLOWED_ORIGINS` 環境變數
2. 確保包含前端服務的完整 URL（包含 `https://`）
3. 檢查 `ALLOWED_HOSTS` 是否包含後端網域

範例：
```env
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.zeabur.app
ALLOWED_HOSTS=your-backend-domain.zeabur.app
```

---

## ❌ 錯誤：找不到模組 (Module not found)

### 問題描述
Django 啟動時找不到模組，例如 `pinelab.wsgi`

### 解決方案

1. 確認 `PYTHONPATH` 環境變數設置為：`/app/src`
2. 確認 `backend/src/pinelab/` 目錄結構正確
3. 檢查 Dockerfile 中是否正確複製了所有文件

---

## 🔍 除錯技巧

### 1. 查看構建日誌
在 Zeabur Dashboard 中：
1. 進入服務
2. 點擊「**日誌**」或「**Logs**」
3. 查看構建過程的詳細輸出

### 2. 檢查文件結構
確認所有必要的文件都在正確的位置：
- `backend/requirements.txt`
- `backend/Dockerfile`
- `backend/manage.py`
- `backend/src/pinelab/`
- `frontend/package.json`
- `frontend/Dockerfile`

### 3. 測試本地構建
在本地測試 Dockerfile 是否正常：
```bash
# 測試後端構建
cd backend
docker build -t pinelab-backend .

# 測試前端構建
cd frontend
docker build -t pinelab-frontend .
```

### 4. 檢查環境變數
在 Zeabur 中確認所有必要的環境變數都已設置：
- 參考 `ZEABUR_ENV_VARS.md` 檢查清單
- 確認沒有拼寫錯誤
- 確認值沒有多餘的空格

---

## 📞 需要幫助？

如果以上方法都無法解決問題，請：

1. 檢查 Zeabur 的官方文檔
2. 查看服務的構建日誌
3. 確認專案結構是否正確
4. 檢查 Git 提交是否包含所有必要文件

