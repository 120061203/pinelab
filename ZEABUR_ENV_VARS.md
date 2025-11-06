# Zeabur 環境變數設定指南

## 📋 環境變數清單

根據你的部署方式，需要在 Zeabur 中設定不同的環境變數。

---

## 🐳 方案一：使用 Docker Compose

如果使用 Docker Compose 部署，需要在 **Zeabur 專案層級**或**服務層級**設定以下環境變數：

### 🔴 後端服務（Backend）環境變數

#### 必填項目 ⚠️

| 變數名稱 | 說明 | 範例值 | 備註 |
|---------|------|--------|------|
| `SECRET_KEY` | Django 安全金鑰 | `django-insecure-change-me-in-production` | ⚠️ **必須更換為強密碼** |
| `DEBUG` | 除錯模式 | `False` | 生產環境必須設為 `False` |
| `DB_NAME` | 資料庫名稱 | `pinelab_db` | 如果使用 Zeabur PostgreSQL，使用資料庫提供的名稱 |
| `DB_USER` | 資料庫使用者 | `pinelab_user` | 如果使用 Zeabur PostgreSQL，使用資料庫提供的使用者 |
| `DB_PASSWORD` | 資料庫密碼 | `your-secure-password` | 如果使用 Zeabur PostgreSQL，使用資料庫提供的密碼 |
| `DB_HOST` | 資料庫主機 | `db` | Docker Compose 中使用服務名稱 `db`；如果使用外部資料庫，使用實際主機名 |
| `DB_PORT` | 資料庫端口 | `5432` | 通常為 `5432` |
| `ALLOWED_HOSTS` | 允許的主機名 | `backend,your-backend-domain.zeabur.app` | 必須包含後端服務的實際網域 |
| `CORS_ALLOWED_ORIGINS` | 允許的 CORS 來源 | `https://your-frontend-domain.zeabur.app` | 必須包含前端服務的實際網域 |

#### 選填項目（有預設值）

| 變數名稱 | 說明 | 預設值 | 備註 |
|---------|------|--------|------|
| `PYTHONPATH` | Python 路徑 | `/app/src` | 已在 Dockerfile 中設定，通常不需要 |
| `API_SECRET_KEY` | API HMAC 簽章金鑰 | `change-me-in-production` | 用於聯絡表單簽章驗證 |
| `JWT_SECRET_KEY` | JWT 簽章金鑰 | 同 `SECRET_KEY` | 如果不設定，會使用 `SECRET_KEY` |
| `JWT_ACCESS_TOKEN_EXPIRE_HOURS` | JWT 存取權杖過期時間（小時） | `24` | 管理員登入權杖有效期 |

---

### 🟢 前端服務（Frontend）環境變數

#### 必填項目 ⚠️

| 變數名稱 | 說明 | 範例值 | 備註 |
|---------|------|--------|------|
| `NEXT_PUBLIC_API_URL` | 後端 API 完整 URL | `https://your-backend-domain.zeabur.app/api` | ⚠️ **必須使用實際的後端網域** |

#### 選填項目

| 變數名稱 | 說明 | 預設值 | 備註 |
|---------|------|--------|------|
| `NEXT_PUBLIC_API_SECRET_KEY` | API 簽章金鑰（如果前端需要生成簽章） | 無 | 必須與後端 `API_SECRET_KEY` 相同 |

---

### 🟦 資料庫服務（Database）環境變數

如果使用 Docker Compose 中的 `db` 服務，需要設定：

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `DB_NAME` | 資料庫名稱 | `pinelab_db` |
| `DB_USER` | 資料庫使用者 | `pinelab_user` |
| `DB_PASSWORD` | 資料庫密碼 | `your-secure-password` |

**注意：** 如果使用 Zeabur 提供的 PostgreSQL 服務，這些變數會在 Zeabur 自動設定，你只需要在後端服務中引用。

---

## 🔧 方案二：分別部署多個服務

如果分別部署後端和前端服務，環境變數設定方式略有不同：

### 🔴 後端服務環境變數

與方案一相同，但 `DB_HOST` 需要改為 Zeabur PostgreSQL 的實際主機名：

```env
SECRET_KEY=your-strong-secret-key-here
DEBUG=False
DB_NAME=pinelab_db
DB_USER=pinelab_user
DB_PASSWORD=your-db-password
DB_HOST=your-zeabur-postgres-host.zeabur.app  # ⚠️ 使用 Zeabur 提供的資料庫主機
DB_PORT=5432
ALLOWED_HOSTS=your-backend-domain.zeabur.app
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.zeabur.app
API_SECRET_KEY=your-api-secret-key
```

### 🟢 前端服務環境變數

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.zeabur.app/api
```

---

## 📝 在 Zeabur 中設定環境變數的步驟

1. **進入服務設定**：
   - 在 Zeabur Dashboard 中，選擇你的服務
   - 點擊「**環境變數**」或「**Environment Variables**」標籤

2. **添加環境變數**：
   - 點擊「**新增環境變數**」或「**Add Variable**」
   - 輸入變數名稱和值
   - 點擊「**儲存**」

3. **重新部署**：
   - 修改環境變數後，Zeabur 會自動重新部署服務
   - 或手動點擊「**重新部署**」

---

## 🔐 安全建議

### 1. 生成強密碼

使用以下命令生成安全的 `SECRET_KEY`：

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2. 使用不同的密鑰

- `SECRET_KEY`：Django 核心安全金鑰
- `API_SECRET_KEY`：API HMAC 簽章金鑰
- `JWT_SECRET_KEY`：JWT 權杖簽章金鑰（可選，預設使用 `SECRET_KEY`）

### 3. 不要在程式碼中硬編碼

所有敏感資訊都應該透過環境變數設定，不要提交到 Git。

---

## 🧪 測試環境變數

部署後，可以透過以下方式測試：

1. **後端健康檢查**：
   ```
   https://your-backend-domain.zeabur.app/api/health/
   ```

2. **前端連線測試**：
   - 打開前端網站
   - 檢查瀏覽器開發者工具的 Network 標籤
   - 確認 API 請求是否成功

3. **檢查 CORS**：
   - 如果前端無法呼叫後端 API，檢查 `CORS_ALLOWED_ORIGINS` 是否包含前端網域

---

## 📋 快速檢查清單

### 後端服務
- [ ] `SECRET_KEY` 已設定且為強密碼
- [ ] `DEBUG=False`（生產環境）
- [ ] `DB_HOST` 正確（Docker Compose 用 `db`，外部資料庫用實際主機名）
- [ ] `DB_NAME`, `DB_USER`, `DB_PASSWORD` 正確
- [ ] `ALLOWED_HOSTS` 包含後端網域
- [ ] `CORS_ALLOWED_ORIGINS` 包含前端網域

### 前端服務
- [ ] `NEXT_PUBLIC_API_URL` 指向正確的後端網域
- [ ] 使用 `https://` 協議（生產環境）

### 資料庫
- [ ] 如果使用 Docker Compose，`db` 服務的環境變數已設定
- [ ] 如果使用 Zeabur PostgreSQL，後端環境變數已正確引用資料庫連線資訊

---

## ❓ 常見問題

### Q: 為什麼前端無法連接到後端？
A: 檢查：
1. `NEXT_PUBLIC_API_URL` 是否正確
2. 後端的 `ALLOWED_HOSTS` 是否包含後端網域
3. 後端的 `CORS_ALLOWED_ORIGINS` 是否包含前端網域

### Q: 資料庫連線失敗？
A: 檢查：
1. `DB_HOST` 是否正確（Docker Compose 用 `db`，外部資料庫用實際主機名）
2. `DB_NAME`, `DB_USER`, `DB_PASSWORD` 是否正確
3. 資料庫服務是否正常運行

### Q: 如何取得 Zeabur PostgreSQL 的連線資訊？
A: 在 Zeabur Dashboard 中：
1. 選擇你的 PostgreSQL 服務
2. 查看「**連線資訊**」或「**Connection Info**」
3. 複製 `Host`, `Port`, `Database`, `User`, `Password`

### Q: 環境變數修改後需要重新部署嗎？
A: 是的，Zeabur 通常會自動重新部署，但你可以手動觸發重新部署以確保變更生效。

