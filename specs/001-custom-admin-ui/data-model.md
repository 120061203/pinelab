# Data Model: 自訂後台前端介面（Admin Portal）

**Branch**: 001-custom-admin-ui  
**Updated**: 2025-11-03

## Entities

### AdminUser
- id: number
- username: string
- role: enum('admin','editor','analyst')

Validation:
- username 2-150 chars；role 必填

### AdminSession
- accessToken: string（含到期）
- refreshToken: string（可選）
- role: enum 同上

### Product
- id, name(2-200), slug(unique), description(0-5000), price(>0, 2 decimals), sort_order(int, default 0), is_active(bool)
- category?: Category
- tags: Tag[]
- images: ProductImage[]（至少 0，多張）

### ProductImage
- id
- image_url: string（相對路徑 /media/products/{id}/... 或完整 URL）
- is_primary: boolean（每商品建議唯一）
- sort_order: int（升冪顯示）

Invariants:
- 同一 product 下 image_url 不重覆（建議）
- 同一 product 僅一張 is_primary=true（前端驗證 + 後端守護）

### Category
- id, name(unique, 1-100), description(0-1000), sort_order(int), is_active(bool)

### Tag
- id, name(unique, 1-50)

### Contact
- id, name(1-100), email(valid), message(min 10), is_read(bool), created_at

## Relations
- Product — Category: N:1（刪除 category 時提示/阻擋）
- Product — Tag: M:N
- Product — ProductImage: 1:N

## Derived Metrics（Dashboard）
- totals: products, categories, tags, contacts_unread
- trends (30d): products_created_daily[], contacts_created_daily[]
- health: products_no_image, products_no_category, products_tag_coverage_ratio

