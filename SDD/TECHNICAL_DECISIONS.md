# 技術決策文件 (Technical Decisions)

> 本文檔記錄 Pinelab 專案的核心技術決策與規格細節  
> 由 Senior Engineer 審查後提出的專業建議與最終決策

---

## 📋 決策優先級

### 🔴 P0 - 必須明確（影響架構與實作）
1. API 端點命名規範
2. 資料庫 Schema 設計（關聯關係、欄位定義）
3. 安全性機制（JWT、MD5/HMAC）
4. API 回應格式標準

### 🟡 P1 - 重要（影響開發效率）
5. 圖片上傳與儲存策略
6. 錯誤處理機制
7. 資料驗證規則
8. 環境變數配置

### 🟢 P2 - 後續優化
9. 性能優化（快取、分頁）
10. 監控與日誌

---

## 1️⃣ API 設計規範

### 1.1 端點命名規範 ✅ **建議採用**

**公開端點（不需認證）：**
```
GET  /api/products/           # 商品列表（公開）
GET  /api/products/{id}/      # 商品詳情（公開）
GET  /api/categories/          # 分類列表（公開）
GET  /api/tags/                # 標籤列表（公開）
POST /api/contact/             # 聯絡表單（需 MD5，不需 JWT）
```

**管理端點（需 JWT + MD5）：**
```
# 商品管理
GET    /api/admin/products/
POST   /api/admin/products/
PATCH  /api/admin/products/{id}/
DELETE /api/admin/products/{id}/

# 分類管理
GET    /api/admin/categories/
POST   /api/admin/categories/
PATCH  /api/admin/categories/{id}/
DELETE /api/admin/categories/{id}/

# 標籤管理
GET    /api/admin/tags/
POST   /api/admin/tags/
PATCH  /api/admin/tags/{id}/
DELETE /api/admin/tags/{id}/

# 聯絡表單管理
GET    /api/admin/contacts/
GET    /api/admin/contacts/{id}/
```

**Auth 端點（僅需帳密，不需 MD5）：**
```
POST /api/auth/login/          # 管理員登入
POST /api/auth/logout/         # 登出（可選）
GET  /api/auth/me/             # 取得當前使用者資訊（JWT 驗證）
```

**決策理由：**
- 清晰的命名規範有助於維護與擴展
- `/api/admin/` 前綴明確區分管理與公開端點
- 符合 RESTful 設計原則

---

### 1.2 API 回應格式標準 ✅ **建議採用**

**成功回應：**
```json
{
  "status": "success",
  "data": {
    // 實際資料
  }
}
```

**錯誤回應：**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "錯誤訊息",
  "errors": {
    "field_name": ["錯誤詳情"]
  }
}
```

**分頁回應：**
```json
{
  "status": "success",
  "data": {
    "count": 100,
    "next": "http://api.example.com/api/products/?page=3",
    "previous": "http://api.example.com/api/products/?page=1",
    "results": [...]
  }
}
```

**HTTP 狀態碼：**
- `200 OK` - 成功取得資源
- `201 Created` - 成功建立資源
- `204 No Content` - 成功刪除（無回應內容）
- `400 Bad Request` - 請求參數錯誤
- `401 Unauthorized` - 未認證
- `403 Forbidden` - 無權限
- `404 Not Found` - 資源不存在
- `422 Unprocessable Entity` - 資料驗證失敗
- `500 Internal Server Error` - 伺服器錯誤

**決策理由：**
- 統一的回應格式便於前端處理
- 明確的錯誤碼有助於除錯與問題追蹤

---

## 2️⃣ 安全性設計

### 2.1 MD5 vs HMAC-SHA256 🔒 **建議升級**

**現況：** 使用 MD5 簽章  
**建議：** 改用 **HMAC-SHA256**

**理由：**
- MD5 已存在碰撞漏洞，不適合安全應用
- HMAC-SHA256 是業界標準，更安全
- Django 內建支援，實作成本低

**實作方式：**
```python
import hmac
import hashlib
import json

def generate_signature(params, secret_key):
    # 1. 參數排序
    sorted_params = sorted(params.items())
    # 2. 生成字串
    query_string = '&'.join([f"{k}={v}" for k, v in sorted_params])
    query_string += f"&key={secret_key}"
    # 3. HMAC-SHA256
    signature = hmac.new(
        secret_key.encode(),
        query_string.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature
```

**如果必須使用 MD5：**
- 僅用於內部 API（非對外公開）
- 需明確說明風險
- 建議設定時效性檢查（timestamp ±5 分鐘）

**最終決策：** ⚠️ 請確認是否改用 HMAC-SHA256

---

### 2.2 JWT Token 設定 ✅ **建議採用**

**Access Token：**
- 過期時間：**24 小時**
- Algorithm: HS256
- Payload: `{ "user_id": 1, "username": "admin", "exp": timestamp }`

**Refresh Token（可選）：**
- MVP 階段可暫不實作
- 未來擴充：refresh token 過期時間 7 天

**登出機制：**
- 前端刪除 local storage 中的 token
- 後端可實作 token 黑名單（Redis）或依賴過期時間

**Token 儲存位置：**
- 前端：localStorage 或 httpOnly cookie（更安全）

**決策理由：**
- 24 小時過期時間平衡安全性與使用者體驗
- MVP 階段不需 refresh token，簡化實作

---

### 2.3 MD5/HMAC 簽章適用範圍

**不需簽章的端點（公開）：**
```
GET /api/products/
GET /api/products/{id}/
GET /api/categories/
GET /api/tags/
```

**需要簽章的端點：**
```
POST /api/contact/             # 公開提交，但需防刷
POST /api/auth/login/          # ❌ 不需（已有帳密驗證）
所有 /api/admin/* 端點         # ✅ 需 JWT + MD5/HMAC
```

**決策理由：**
- 公開查詢端點不需簽章，提升性能
- 提交類端點需簽章防刷
- 管理端點需雙重驗證（JWT + 簽章）

---

## 3️⃣ 資料庫設計

### 3.1 資料表關聯關係 ✅ **建議採用**

**Product ↔ Category：**
- 關係：**一對多**（一個商品屬於一個分類）
- 理由：商品通常有明確分類，多對多會增加複雜度
- 未來擴充：若需多分類，可改為多對多

**Product ↔ Tag：**
- 關係：**多對多**（一個商品可有多個標籤）
- 關聯表：`product_tags` (product_id, tag_id)

**Product ↔ ProductImage：**
- 關係：**一對多**（一個商品有多張圖片）

**決策理由：**
- 簡化初期實作（Category 一對多）
- Tag 多對多符合標籤特性

---

### 3.2 資料表 Schema ✅ **建議採用**

#### `products`
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(200) NOT NULL
slug            VARCHAR(200) UNIQUE
description     TEXT
price           DECIMAL(10, 2) NOT NULL CHECK (price > 0)
sort_order      INTEGER DEFAULT 0
category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### `categories`
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(100) NOT NULL UNIQUE
slug            VARCHAR(100) UNIQUE
description     TEXT
sort_order      INTEGER DEFAULT 0
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### `tags`
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(50) NOT NULL UNIQUE
slug            VARCHAR(50) UNIQUE
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### `product_tags` (關聯表)
```sql
id              SERIAL PRIMARY KEY
product_id      INTEGER REFERENCES products(id) ON DELETE CASCADE
tag_id          INTEGER REFERENCES tags(id) ON DELETE CASCADE
UNIQUE(product_id, tag_id)
```

#### `product_images`
```sql
id              SERIAL PRIMARY KEY
product_id      INTEGER REFERENCES products(id) ON DELETE CASCADE
image_url       VARCHAR(500) NOT NULL
sort_order      INTEGER DEFAULT 0
is_primary      BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
```

#### `contacts`
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(100) NOT NULL
email           VARCHAR(255) NOT NULL
message         TEXT NOT NULL
is_read         BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
```

#### `users` (管理員)
```sql
id              SERIAL PRIMARY KEY
username        VARCHAR(150) UNIQUE NOT NULL
email           VARCHAR(255) UNIQUE
password_hash   VARCHAR(255) NOT NULL  # Django hashed password
is_active       BOOLEAN DEFAULT TRUE
is_staff        BOOLEAN DEFAULT TRUE    # Django admin
is_superuser    BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
last_login      TIMESTAMP
```

**關鍵設計決策：**
- ✅ 使用 `slug` 欄位支援 SEO 友善 URL
- ✅ `sort_order` 使用整數，預設 0（數字越大越優先）
- ✅ `is_active` 軟刪除機制（保留資料，僅隱藏）
- ✅ `ON DELETE SET NULL`（分類刪除時，商品分類設為 NULL）
- ✅ `ON DELETE CASCADE`（商品刪除時，圖片與標籤關聯一併刪除）
- ✅ `product_images.is_primary` 標記主圖

---

### 3.3 商品排序邏輯 ✅ **建議採用**

**排序優先級：**
1. `sort_order` DESC（數字越大越前）
2. 若 `sort_order` 相同，則 `updated_at` DESC（最新在前）

**API 排序參數：**
```
GET /api/products/?sort=sort_order      # 依手動排序
GET /api/products/?sort=updated_at      # 依更新時間
GET /api/products/?sort=-price          # 價格降序
GET /api/products/?sort=price           # 價格升序
```

**預設排序：**
- 商品列表頁：`sort_order DESC, updated_at DESC`
- 首頁最新商品：`updated_at DESC`（忽略 sort_order）

**決策理由：**
- `sort_order` 為 0 時，自動依 `updated_at` 排序
- 管理員可透過調整 `sort_order` 控制顯示順序

---

### 3.4 分類/標籤刪除策略 ✅ **建議採用**

**分類刪除：**
- 若有商品使用該分類 → **不允許刪除**（回傳 400 錯誤）
- 提示管理員需先將商品移至其他分類或刪除商品

**標籤刪除：**
- 允許刪除（CASCADE 會自動移除關聯）
- 刪除時檢查是否有商品使用，若有則提示警告（但仍允許刪除）

**實作方式：**
```python
# Django
def delete(self):
    if self.products.exists():
        raise ValidationError("無法刪除：仍有商品使用此分類")
    super().delete()
```

**決策理由：**
- 分類是核心屬性，需保護資料完整性
- 標籤較彈性，允許刪除不影響商品本身

---

## 4️⃣ 圖片處理

### 4.1 圖片上傳規範 ✅ **建議採用**

**檔案限制：**
- 允許格式：`jpg, jpeg, png, webp`
- 單檔大小上限：**5MB**
- 總數量：無限制（但建議單商品不超過 10 張）

**安全驗證：**
```python
# Django 實作
ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image(file):
    # 1. 檢查副檔名
    ext = file.name.split('.')[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError("不支援的檔案格式")
    
    # 2. 檢查檔案大小
    if file.size > MAX_FILE_SIZE:
        raise ValidationError("檔案大小超過 5MB")
    
    # 3. 檢查 MIME type（避免偽裝檔案）
    if not file.content_type.startswith('image/'):
        raise ValidationError("檔案類型不符合")
```

---

### 4.2 圖片儲存策略 ✅ **建議採用**

**本地儲存路徑：**
```
media/
  products/
    {product_id}/
      {timestamp}_{filename}
```

**Django 設定：**
```python
# settings.py
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = '/media/'

# urls.py
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

**API 回應格式：**
```json
{
  "id": 1,
  "image_url": "/media/products/1/1699001234_image.jpg",
  "full_url": "https://api.example.com/media/products/1/1699001234_image.jpg",
  "is_primary": true,
  "sort_order": 0
}
```

**未來擴充：**
- MVP 階段使用本地儲存
- 未來可升級至雲端（AWS S3, Cloudinary）

---

### 4.3 圖片上傳 API ✅ **建議採用**

**方式一：建立商品時一併上傳（推薦）**
```http
POST /api/admin/products/
Content-Type: multipart/form-data

name=商品名稱
price=1000
category_id=1
images[]=file1.jpg
images[]=file2.jpg
```

**方式二：分離上傳（彈性較高）**
```http
POST /api/admin/products/
{ "name": "商品名稱", "price": 1000 }

POST /api/admin/products/{id}/images/
images[]=file1.jpg
images[]=file2.jpg
```

**建議採用：方式一**（簡化操作）

**圖片順序：**
- 依上傳順序自動設定 `sort_order`（0, 1, 2...）
- 第一張自動設為 `is_primary=true`
- 可透過 PATCH 調整順序與主圖

---

## 5️⃣ 資料驗證規則

### 5.1 商品驗證 ✅ **建議採用**

| 欄位 | 必填 | 格式 | 限制 |
|------|------|------|------|
| `name` | ✅ | String | 2-200 字元 |
| `description` | ❌ | Text | 0-5000 字元 |
| `price` | ✅ | Decimal | > 0, 小數點後最多 2 位 |
| `category_id` | ❌ | Integer | 必須存在於 categories 表 |
| `tags` | ❌ | Array[Integer] | 每個 tag_id 必須存在 |
| `sort_order` | ❌ | Integer | 預設 0 |

---

### 5.2 價格篩選驗證 ✅ **建議採用**

**驗證規則：**
```python
# 前端與後端都需驗證
- min_price: >= 0, 可為 null
- max_price: >= 0, 可為 null
- 若同時提供：min_price <= max_price
```

**SQL 查詢：**
```python
queryset = Product.objects.filter(is_active=True)

if min_price:
    queryset = queryset.filter(price__gte=min_price)
if max_price:
    queryset = queryset.filter(price__lte=max_price)
```

---

### 5.3 聯絡表單驗證 ✅ **建議採用**

| 欄位 | 必填 | 格式 | 限制 |
|------|------|------|------|
| `name` | ✅ | String | 2-100 字元 |
| `email` | ✅ | Email | 需符合 email 格式 |
| `message` | ✅ | Text | 10-2000 字元 |

**Email 驗證：**
- 使用 Django EmailValidator
- 前端使用 HTML5 email input + JavaScript 驗證

---

## 6️⃣ 相關商品推薦邏輯 ✅ **建議採用**

**推薦順序：**
1. 同分類 + 同標籤（優先）
2. 同分類（次優先）
3. 同標籤（再次）
4. 最新商品（fallback，若以上皆無）

**實作邏輯：**
```python
def get_related_products(product, limit=6):
    # 1. 同分類 + 同標籤
    related = Product.objects.filter(
        category=product.category,
        tags__in=product.tags.all()
    ).exclude(id=product.id).distinct()
    
    if related.count() >= limit:
        return related[:limit]
    
    # 2. 同分類
    category_related = Product.objects.filter(
        category=product.category
    ).exclude(id=product.id).distinct()
    
    related = list(related) + [p for p in category_related if p not in related]
    
    if len(related) >= limit:
        return related[:limit]
    
    # 3. 同標籤
    tag_related = Product.objects.filter(
        tags__in=product.tags.all()
    ).exclude(id=product.id).distinct()
    
    related = list(related) + [p for p in tag_related if p not in related]
    
    # 4. Fallback: 最新商品
    if len(related) < limit:
        latest = Product.objects.exclude(
            id__in=[p.id for p in related] + [product.id]
        ).order_by('-updated_at')[:limit - len(related)]
        related.extend(latest)
    
    return related[:limit]
```

---

## 7️⃣ 環境變數配置 ✅ **建議採用**

### `.env.example`
```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pinelab

# API Security
API_SECRET_KEY=your-api-secret-key-here  # 用於 MD5/HMAC 簽章
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_HOURS=24

# Media Files
MEDIA_ROOT=/app/media
MEDIA_URL=/media/

# CORS (若前端分離部署)
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## 8️⃣ 分頁設定 ✅ **建議採用**

**預設值：**
- 每頁筆數：**20**
- 最大筆數：100（防止大量查詢）

**API 參數：**
```
GET /api/products/?page=1&page_size=20
```

---

## 📝 決策記錄

### 待確認決策
- [ ] **MD5 vs HMAC-SHA256** - 請確認是否改用 HMAC-SHA256
- [ ] **圖片上傳方式** - 方式一（一併上傳）或方式二（分離上傳）
- [ ] **分類關係** - 一對多（建議）或允許多對多

### 已確認決策 ✅
- ✅ API 端點命名規範（/api/admin/ 前綴）
- ✅ API 回應格式標準
- ✅ JWT Token 設定（24 小時過期）
- ✅ 資料表 Schema 設計
- ✅ 商品排序邏輯
- ✅ 圖片儲存策略

---

**文件建立日期：** 2025/11/03  
**最後更新：** 2025/11/03

