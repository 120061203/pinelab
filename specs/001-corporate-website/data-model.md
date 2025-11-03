# 資料模型設計：松果創意 Pinelab 企業官網

**建立日期**: 2025-11-03  
**狀態**: 已完成  
**基礎文件**: SDD/TECHNICAL_DECISIONS.md Section 3

## 概述

本文件定義 Pinelab 企業官網的核心資料模型，包括實體定義、關聯關係、驗證規則和狀態轉換。所有設計基於 PostgreSQL 資料庫。

---

## 實體關係圖

```
users (管理員)
  │
  └─── (1:N) ──── products (商品)
                    │
                    ├─── (N:1) ──── categories (分類)
                    │
                    ├─── (N:M) ──── tags (標籤) [via product_tags]
                    │
                    └─── (1:N) ──── product_images (商品圖片)

contacts (聯絡表單)
```

---

## 1. User (使用者/管理員)

**說明**: 代表授權的管理員使用者，可透過 API 管理網站內容。

### 欄位定義

| 欄位名稱 | 類型 | 約束 | 說明 |
|---------|------|------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵 |
| `username` | VARCHAR(150) | UNIQUE, NOT NULL | 使用者名稱（唯一） |
| `email` | VARCHAR(255) | UNIQUE | 電子郵件（唯一，可選） |
| `password_hash` | VARCHAR(255) | NOT NULL | Django hashed password |
| `is_active` | BOOLEAN | DEFAULT TRUE | 帳號是否啟用 |
| `is_staff` | BOOLEAN | DEFAULT TRUE | 是否為員工（Django admin） |
| `is_superuser` | BOOLEAN | DEFAULT FALSE | 是否為超級使用者 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| `last_login` | TIMESTAMP | NULL | 最後登入時間 |

### 驗證規則

- `username`: 2-150 字元，僅允許字母、數字、下劃線、連字號
- `email`: 必須符合 email 格式（若提供）
- `password_hash`: 由 Django 的 `make_password()` 生成

### 狀態轉換

- **建立** → `is_active=True` (預設)
- **停用** → `is_active=False`
- **啟用** → `is_active=True`

---

## 2. Category (分類)

**說明**: 代表商品分類，用於組織和篩選商品。

### 欄位定義

| 欄位名稱 | 類型 | 約束 | 說明 |
|---------|------|------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵 |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | 分類名稱（唯一） |
| `slug` | VARCHAR(100) | UNIQUE | SEO 友善的 URL 片段 |
| `description` | TEXT | NULL | 分類描述（可選） |
| `sort_order` | INTEGER | DEFAULT 0 | 排序順序（數字越大越前） |
| `is_active` | BOOLEAN | DEFAULT TRUE | 是否啟用 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 更新時間 |

### 驗證規則

- `name`: 2-100 字元，必填，必須唯一
- `slug`: 自動從 `name` 生成（小寫、連字號分隔），必須唯一
- `sort_order`: 整數，預設 0

### 關聯關係

- **Product** (1:N): 一個分類可有多個商品
  - 外鍵：`Product.category_id` → `Category.id`
  - 刪除策略：`ON DELETE SET NULL`（分類刪除時，商品分類設為 NULL）

### 業務規則

- 若分類有關聯商品，則**不允許刪除**（回傳 400 錯誤）
- 刪除前必須先將商品移至其他分類或刪除商品

### 狀態轉換

- **建立** → `is_active=True` (預設)
- **停用** → `is_active=False`（不顯示在公開 API）
- **啟用** → `is_active=True`

---

## 3. Tag (標籤)

**說明**: 代表商品標籤，用於靈活的商品標記和篩選。

### 欄位定義

| 欄位名稱 | 類型 | 約束 | 說明 |
|---------|------|------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵 |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | 標籤名稱（唯一） |
| `slug` | VARCHAR(50) | UNIQUE | SEO 友善的 URL 片段 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 更新時間 |

### 驗證規則

- `name`: 1-50 字元，必填，必須唯一
- `slug`: 自動從 `name` 生成（小寫、連字號分隔），必須唯一

### 關聯關係

- **Product** (M:N): 透過 `product_tags` 關聯表
  - 關聯表欄位：`product_id`, `tag_id`
  - 刪除策略：`ON DELETE CASCADE`（標籤刪除時，自動移除關聯）

### 業務規則

- 標籤可自由刪除（即使有商品使用）
- 刪除時會自動移除所有商品關聯（CASCADE）

---

## 4. Product (商品)

**說明**: 代表松果創意提供的商品。

### 欄位定義

| 欄位名稱 | 類型 | 約束 | 說明 |
|---------|------|------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵 |
| `name` | VARCHAR(200) | NOT NULL | 商品名稱 |
| `slug` | VARCHAR(200) | UNIQUE | SEO 友善的 URL 片段 |
| `description` | TEXT | NULL | 商品描述 |
| `price` | DECIMAL(10, 2) | NOT NULL, CHECK (price > 0) | 價格（必須 > 0） |
| `sort_order` | INTEGER | DEFAULT 0 | 排序順序（數字越大越前） |
| `category_id` | INTEGER | FOREIGN KEY, NULL | 分類 ID（可選） |
| `is_active` | BOOLEAN | DEFAULT TRUE | 是否啟用 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 更新時間 |

### 驗證規則

- `name`: 2-200 字元，必填
- `slug`: 自動從 `name` 生成，必須唯一
- `price`: 必須 > 0，小數點後最多 2 位
- `description`: 0-5000 字元（可選）
- `sort_order`: 整數，預設 0

### 關聯關係

- **Category** (N:1): 一個商品屬於一個分類
  - 外鍵：`Product.category_id` → `Category.id`
  - 刪除策略：`ON DELETE SET NULL`
- **Tag** (M:N): 透過 `product_tags` 關聯表
- **ProductImage** (1:N): 一個商品有多張圖片

### 業務規則

- 商品必須有價格且 > 0
- 商品可屬於一個分類（可選）
- 商品可有多個標籤
- 商品可有多張圖片
- 刪除商品時，圖片與標籤關聯會自動刪除（CASCADE）

### 狀態轉換

- **建立** → `is_active=True` (預設)
- **停用** → `is_active=False`（不顯示在公開 API）
- **啟用** → `is_active=True`

### 排序邏輯

排序優先級：
1. `sort_order` DESC（數字越大越前）
2. 若 `sort_order` 相同，則 `updated_at` DESC（最新在前）

---

## 5. ProductImage (商品圖片)

**說明**: 代表與商品關聯的圖片。

### 欄位定義

| 欄位名稱 | 類型 | 約束 | 說明 |
|---------|------|------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵 |
| `product_id` | INTEGER | FOREIGN KEY, NOT NULL | 商品 ID |
| `image_url` | VARCHAR(500) | NOT NULL | 圖片 URL 路徑 |
| `sort_order` | INTEGER | DEFAULT 0 | 排序順序 |
| `is_primary` | BOOLEAN | DEFAULT FALSE | 是否為主圖 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |

### 驗證規則

- `image_url`: 最大 500 字元，必填
- `sort_order`: 整數，預設 0
- `is_primary`: 布林值，預設 False

### 關聯關係

- **Product** (N:1): 一個圖片屬於一個商品
  - 外鍵：`ProductImage.product_id` → `Product.id`
  - 刪除策略：`ON DELETE CASCADE`（商品刪除時，圖片一併刪除）

### 業務規則

- 每個商品可有多張圖片（無嚴格數量限制，建議不超過 10 張）
- 第一張上傳的圖片自動設為 `is_primary=True`
- 圖片儲存路徑：`media/products/{product_id}/{timestamp}_{filename}`
- 圖片格式限制：jpg, jpeg, png, webp
- 單檔大小限制：5MB

---

## 6. ProductTag (關聯表)

**說明**: Product 與 Tag 的多對多關聯表。

### 欄位定義

| 欄位名稱 | 類型 | 約束 | 說明 |
|---------|------|------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵 |
| `product_id` | INTEGER | FOREIGN KEY, NOT NULL | 商品 ID |
| `tag_id` | INTEGER | FOREIGN KEY, NOT NULL | 標籤 ID |
| UNIQUE(product_id, tag_id) | - | UNIQUE | 防止重複關聯 |

### 關聯關係

- **Product** (N:1): 外鍵 → `Product.id`, `ON DELETE CASCADE`
- **Tag** (N:1): 外鍵 → `Tag.id`, `ON DELETE CASCADE`

### 業務規則

- 同一商品與同一標籤只能關聯一次（UNIQUE 約束）

---

## 7. Contact (聯絡表單)

**說明**: 代表訪客提交的聯絡表單資料。

### 欄位定義

| 欄位名稱 | 類型 | 約束 | 說明 |
|---------|------|------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵 |
| `name` | VARCHAR(100) | NOT NULL | 訪客姓名 |
| `email` | VARCHAR(255) | NOT NULL | 電子郵件 |
| `message` | TEXT | NOT NULL | 訊息內容 |
| `is_read` | BOOLEAN | DEFAULT FALSE | 是否已讀 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 提交時間 |

### 驗證規則

- `name`: 2-100 字元，必填
- `email`: 必須符合 email 格式，必填
- `message`: 10-2000 字元，必填

### 業務規則

- 所有欄位都必須填寫
- Email 必須符合格式驗證
- 訊息長度必須在 10-2000 字元之間
- 提交後自動設定 `is_read=False`
- 管理員可透過 API 標記為已讀

### 狀態轉換

- **提交** → `is_read=False` (預設)
- **標記已讀** → `is_read=True`

---

## 索引設計

### 效能優化索引

```sql
-- Product 查詢優化
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_product_active ON products(is_active);
CREATE INDEX idx_product_sort ON products(sort_order DESC, updated_at DESC);

-- 搜尋優化
CREATE INDEX idx_product_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_product_description_search ON products USING gin(to_tsvector('english', description));

-- ProductImage 查詢優化
CREATE INDEX idx_product_image_product ON product_images(product_id);
CREATE INDEX idx_product_image_primary ON product_images(product_id, is_primary);

-- ProductTag 查詢優化
CREATE INDEX idx_product_tag_product ON product_tags(product_id);
CREATE INDEX idx_product_tag_tag ON product_tags(tag_id);

-- Contact 查詢優化
CREATE INDEX idx_contact_read ON contacts(is_read);
CREATE INDEX idx_contact_created ON contacts(created_at DESC);
```

---

## 資料完整性約束

### 外鍵約束

- `Product.category_id` → `Category.id` (ON DELETE SET NULL)
- `ProductImage.product_id` → `Product.id` (ON DELETE CASCADE)
- `ProductTag.product_id` → `Product.id` (ON DELETE CASCADE)
- `ProductTag.tag_id` → `Tag.id` (ON DELETE CASCADE)

### 唯一性約束

- `User.username` (UNIQUE)
- `User.email` (UNIQUE)
- `Category.name` (UNIQUE)
- `Category.slug` (UNIQUE)
- `Tag.name` (UNIQUE)
- `Tag.slug` (UNIQUE)
- `Product.slug` (UNIQUE)
- `ProductTag(product_id, tag_id)` (UNIQUE)

### 檢查約束

- `Product.price` > 0

---

## 資料遷移策略

### 初始遷移順序

1. **User** (獨立，無依賴)
2. **Category** (獨立，無依賴)
3. **Tag** (獨立，無依賴)
4. **Product** (依賴 Category)
5. **ProductImage** (依賴 Product)
6. **ProductTag** (依賴 Product 和 Tag)
7. **Contact** (獨立，無依賴)

### 資料種子

MVP 階段需要建立：
- 至少 1 個管理員帳戶
- 初始分類和標籤（可選）
- 樣本商品資料（用於測試）

---

## 資料模型驗證測試

所有模型需要驗證：
- ✅ 欄位驗證規則正確執行
- ✅ 外鍵約束正常運作
- ✅ 唯一性約束防止重複
- ✅ 檢查約束（如 price > 0）正常運作
- ✅ 軟刪除機制（is_active）正確
- ✅ 時間戳記自動更新

