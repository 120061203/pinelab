# 圖片使用指南

## 📁 圖片存放位置

### 後端圖片（推薦）

**存放路徑：** `backend/media/products/{product_id}/`

```
backend/
└── media/
    └── products/
        ├── 1/              # 商品 ID 1 的圖片
        │   ├── product-1-main.jpg
        │   ├── product-1-detail-1.jpg
        │   └── product-1-detail-2.jpg
        ├── 2/              # 商品 ID 2 的圖片
        │   └── ...
```

**訪問 URL：** `http://localhost:8000/media/products/{product_id}/{filename}`

### 前端公開圖片（用於 Mock 資料或靜態資源）

**存放路徑：** `frontend/public/images/`

```
frontend/
└── public/
    └── images/
        ├── products/      # 商品圖片
        │   ├── product-1.jpg
        │   ├── product-2.jpg
        │   └── ...
        └── placeholders/  # 佔位圖片
            └── no-image.png
```

**訪問 URL：** `http://localhost:3000/images/{filename}`

---

## 📐 圖片尺寸建議

### 1. 商品列表卡片圖片（ProductCard）

**用途：** 商品列表頁面、首頁推薦商品

**建議尺寸：**
- **寬度：** 800px - 1200px
- **高度：** 450px - 675px（16:9 比例）
- **顯示尺寸：** 前端顯示為 `h-48` (192px 高度)，自動縮放寬度

**範例：** `800x450px`, `1024x576px`, `1200x675px`

### 2. 商品詳情頁主圖

**用途：** 商品詳情頁主要展示圖

**建議尺寸：**
- **寬度：** 1200px - 1600px
- **高度：** 根據內容自適應（建議至少 800px）
- **顯示：** 響應式，自動適應容器寬度

**範例：** `1200x900px`, `1600x1200px`

### 3. 商品詳情頁縮圖

**用途：** 商品詳情頁的次要圖片（縮圖）

**建議尺寸：**
- **寬度：** 400px - 600px
- **高度：** 400px - 600px（1:1 或接近正方形）
- **顯示尺寸：** 前端顯示為 `h-24` (96px)

**範例：** `400x400px`, `500x500px`, `600x600px`

---

## 🎨 圖片格式建議

### 推薦格式

1. **JPEG (.jpg/.jpeg)**
   - ✅ 適合：照片、複雜圖像
   - ✅ 檔案較小、載入快
   - ✅ 不支援透明背景

2. **PNG (.png)**
   - ✅ 適合：需要透明背景、簡單圖形
   - ✅ 品質較好但檔案較大
   - ✅ 支援透明背景

3. **WebP (.webp)**（可選，現代瀏覽器支援）
   - ✅ 檔案最小、品質好
   - ⚠️ 需要提供 JPEG 備用

### 不推薦

- ❌ GIF（僅適合動畫，不適合商品圖）
- ❌ BMP, TIFF（檔案太大）

---

## 📝 檔案命名規則

### 建議命名格式

```
{product-id}-{type}-{sequence}.{ext}

範例：
- 1-main.jpg          # 商品 1 的主圖
- 1-detail-1.jpg      # 商品 1 的詳情圖 1
- 1-detail-2.jpg      # 商品 1 的詳情圖 2
- 2-main.jpg          # 商品 2 的主圖
```

### 命名說明

- `{product-id}`: 商品 ID（數字）
- `{type}`: 圖片類型（main/detail/thumbnail）
- `{sequence}`: 順序編號（可選，從 1 開始）
- `{ext}`: 副檔名（jpg/png/webp）

---

## 🚀 如何使用

### 方式一：透過後端 API 上傳（生產環境）

1. **準備圖片檔案**，放置在本機
2. **使用管理員 API** 上傳：

```bash
# 登入取得 JWT token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'

# 上傳圖片（使用圖片 URL）
curl -X POST http://localhost:8000/api/admin/products/1/upload_image/ \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "/media/products/1/product-1-main.jpg",
    "is_primary": true,
    "sort_order": 0
  }'
```

### 方式二：直接放置檔案（開發環境）

1. **建立商品資料夾**：

```bash
mkdir -p backend/media/products/1
mkdir -p backend/media/products/2
# ... 依此類推
```

2. **放置圖片檔案**到對應資料夾

3. **在資料庫中設定圖片路徑**：

```python
# 透過 Django Admin 或 API
ProductImage.objects.create(
    product_id=1,
    image_url='/media/products/1/product-1-main.jpg',
    is_primary=True,
    sort_order=0
)
```

### 方式三：使用前端公開資料夾（Mock 資料）

1. **放置圖片**到 `frontend/public/images/products/`

2. **在 Mock 資料中使用**：

```typescript
// frontend/src/mocks/products.ts
{
  id: 1,
  primary_image: '/images/products/product-1.jpg',
  // ...
}
```

---

## 🛠️ 圖片優化建議

### 1. 壓縮圖片

使用工具壓縮圖片以減少檔案大小：

**線上工具：**
- [TinyPNG](https://tinypng.com/) - PNG/JPEG 壓縮
- [Squoosh](https://squoosh.app/) - 多格式壓縮

**命令列工具：**
```bash
# 使用 ImageMagick 壓縮
convert input.jpg -quality 85 -resize 1200x output.jpg
```

### 2. 生成多尺寸版本

為不同用途生成不同尺寸（可選，目前前端會自動縮放）：

- 列表縮圖：800x450px
- 詳情主圖：1600x1200px
- 縮圖：500x500px

### 3. 響應式圖片（進階）

可使用 Next.js 的 `next/image` 元件自動優化：

```tsx
import Image from 'next/image'

<Image
  src={product.primary_image}
  alt={product.name}
  width={800}
  height={450}
  layout="responsive"
/>
```

---

## 📋 檢查清單

建立商品圖片前，確認：

- [ ] 圖片尺寸符合建議（寬度至少 800px）
- [ ] 圖片格式為 JPG 或 PNG
- [ ] 檔案已壓縮（建議 < 500KB）
- [ ] 檔案名稱清晰有意義
- [ ] 主圖已標記 `is_primary=True`
- [ ] 圖片路徑已正確設定在資料庫中

---

## 💡 範例：建立假資料圖片

### 快速建立測試圖片

1. **使用佔位圖片服務**（開發階段）：

```typescript
// 暫時使用佔位圖片
image_url: 'https://via.placeholder.com/800x450?text=Product+1'
```

2. **使用真實圖片**：

```bash
# 下載範例圖片（使用 Unsplash 等免費圖庫）
# 建議尺寸：1200x800px

# 放置到後端 media 資料夾
mkdir -p backend/media/products/1
# 下載並命名
wget https://example.com/image.jpg -O backend/media/products/1/product-1-main.jpg
```

---

## 🔗 相關檔案

- 圖片處理邏輯：`backend/src/apps/products/image_handler.py`
- 圖片模型：`backend/src/apps/products/models.py`
- 前端圖片顯示：`frontend/src/components/ProductCard.tsx`
- 商品詳情頁：`frontend/src/app/products/[id]/page.tsx`

---

**最後更新：** 2025-11-03

