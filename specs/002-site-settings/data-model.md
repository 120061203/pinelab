# 資料模型設計：網站設定管理

**建立日期**: 2025-01-27  
**狀態**: 設計完成  
**基礎文件**: specs/002-site-settings/spec.md

## 概述

本文件定義網站設定管理功能的資料模型，包括三個核心實體：SiteSettings（網站設定，單例）、News（最新消息）、Service（服務項目）。所有設計基於 PostgreSQL 資料庫，遵循 Django ORM 模式。

---

## 實體關係圖

```
SiteSettings (單例)
  │
  └─── (無直接關聯，但邏輯上關聯)
        │
        ├─── News (最新消息) - 獨立實體
        │
        └─── Service (服務項目) - 獨立實體
```

---

## 1. SiteSettings (網站設定)

**說明**: 代表網站的全局設定資訊，採用單例模式，系統中只存在一筆記錄。

### 欄位定義

| 欄位名稱 | 類型 | 約束 | 說明 |
|---------|------|------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵 |
| `key` | VARCHAR(50) | UNIQUE, NOT NULL, DEFAULT 'site_settings' | 唯一標識（用於單例模式） |
| `brand_name` | VARCHAR(200) | NULL | 品牌名稱 |
| `brand_slogan` | VARCHAR(500) | NULL | 品牌標語 |
| `logo_url` | VARCHAR(500) | NULL | Logo URL（SVG格式，用於頁首導航欄） |
| `hero_banner_url` | VARCHAR(500) | NULL | Hero橫幅 URL（用於首頁頂部） |
| `shopee_link` | VARCHAR(500) | NULL | 蝦皮私訊連結 |
| `line_at_link` | VARCHAR(500) | NULL | Line@ 連結 |
| `mall_link` | VARCHAR(500) | NULL | 商城連結 |
| `fan_page_link` | VARCHAR(500) | NULL | 粉絲團連結 |
| `blog_link` | VARCHAR(500) | NULL | 部落格連結 |
| `show_price` | BOOLEAN | DEFAULT TRUE | 是否顯示商品價格 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 更新時間 |

### 驗證規則

- `brand_name`: 最大 200 字元，可選
- `brand_slogan`: 最大 500 字元，可選
- `logo_url`: 必須是有效的 URL 或相對路徑，格式必須是 SVG
- `hero_banner_url`: 必須是有效的 URL 或相對路徑，格式必須是 jpg, jpeg, png, webp
- 所有連結欄位：必須是有效的 HTTP/HTTPS URL 格式（如果提供）
- `key`: 固定值 'site_settings'，用於確保單例

### 業務規則

- 系統中只存在一筆 SiteSettings 記錄（透過 `key='site_settings'` 唯一約束確保）
- 使用 `SiteSettings.objects.get_or_create(key='site_settings')` 確保單例
- 所有欄位都是可選的，未設定時前端顯示預設值或佔位符
- Logo 和 Hero橫幅上傳後，舊檔案應被刪除（避免磁碟空間浪費）

### 類別方法

```python
@classmethod
def get_instance(cls):
    """取得單例實例，如果不存在則建立"""
    instance, created = cls.objects.get_or_create(key='site_settings')
    return instance
```

---

## 2. News (最新消息)

**說明**: 代表網站的最新消息/公告，支援草稿和已發布兩種狀態。

### 欄位定義

| 欄位名稱 | 類型 | 約束 | 說明 |
|---------|------|------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵 |
| `title` | VARCHAR(200) | NOT NULL | 標題 |
| `content` | TEXT | NOT NULL | 內容（最大 5000 字元） |
| `publish_date` | DATE | NOT NULL | 發布日期（可設定未來日期） |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | 發布狀態（'draft' 或 'published'） |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 更新時間 |

### 驗證規則

- `title`: 必填，最大 200 字元
- `content`: 必填，最大 5000 字元
- `publish_date`: 必填，可以是未來日期（預約發布）
- `status`: 必填，只能是 'draft' 或 'published'

### 業務規則

- 公開 API 只返回 `status='published'` 且 `publish_date <= 當前日期` 的消息
- 管理 API 可以查看和編輯所有消息（包括草稿）
- 消息按 `publish_date` 降序排列（最新的在前）
- 首頁最多顯示 N 則消息（可配置，預設 5 則）

### 狀態轉換

- **建立** → `status='draft'` (預設)
- **發布** → `status='published'` (管理員手動切換)
- **撤回** → `status='draft'` (管理員手動切換)

### 索引

- `status` (用於篩選已發布消息)
- `publish_date` (用於排序)
- `-publish_date, status` (複合索引，優化公開 API 查詢)

---

## 3. Service (服務項目)

**說明**: 代表網站提供的服務項目，以卡片形式顯示在首頁。

### 欄位定義

| 欄位名稱 | 類型 | 約束 | 說明 |
|---------|------|------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵 |
| `title` | VARCHAR(100) | NOT NULL | 標題 |
| `description` | VARCHAR(500) | NOT NULL | 描述 |
| `icon_type` | VARCHAR(20) | NULL | 圖標類型（'fontawesome', 'material', 'custom'） |
| `icon_value` | VARCHAR(500) | NULL | 圖標值（圖標名稱或檔案 URL） |
| `sort_order` | INTEGER | DEFAULT 0 | 排序順序（數字越大越前） |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 更新時間 |

### 驗證規則

- `title`: 必填，最大 100 字元
- `description`: 必填，最大 500 字元
- `icon_type`: 可選，只能是 'fontawesome', 'material', 'custom' 或 NULL
- `icon_value`: 
  - 如果 `icon_type` 為 'fontawesome' 或 'material'，必須是有效的圖標名稱
  - 如果 `icon_type` 為 'custom'，必須是有效的檔案 URL 或相對路徑
  - 如果 `icon_type` 為 NULL，`icon_value` 也必須為 NULL
- `sort_order`: 整數，預設 0

### 業務規則

- 服務項目按 `sort_order` 降序排列（數字越大越前），相同 `sort_order` 時按 `updated_at` 降序
- 圖標是可選的，未設定時卡片不顯示圖標
- 自訂圖標上傳後，檔案儲存在 `media/site/icons/` 目錄
- 自訂圖標可重複使用於多個服務項目（透過 URL 引用）

### 圖標處理邏輯

- **內建圖標字體** (`icon_type='fontawesome'` 或 `'material'`):
  - `icon_value` 儲存圖標名稱（如 'fa-home', 'shopping-cart'）
  - 前端根據 `icon_type` 使用對應的圖標字體庫渲染
  
- **自訂圖標** (`icon_type='custom'`):
  - `icon_value` 儲存檔案 URL（如 '/media/site/icons/custom-icon.svg'）
  - 前端直接顯示圖片

### 索引

- `sort_order` (用於排序)
- `-sort_order, -updated_at` (複合索引，優化查詢)

---

## 資料庫遷移策略

### 初始遷移

1. 建立 `site_settings` 表
2. 建立 `news` 表
3. 建立 `service` 表
4. 建立必要的索引
5. 建立 SiteSettings 單例記錄（key='site_settings'）

### 遷移腳本範例

```python
# migrations/0001_initial.py
from django.db import migrations, models

def create_site_settings(apps, schema_editor):
    SiteSettings = apps.get_model('site_settings', 'SiteSettings')
    SiteSettings.objects.get_or_create(key='site_settings')

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    
    operations = [
        migrations.CreateModel(...),
        migrations.RunPython(create_site_settings),
    ]
```

---

## 資料完整性約束

### 唯一性約束

- `SiteSettings.key`: UNIQUE（確保單例）
- `News`: 無唯一性約束（允許多則消息）
- `Service`: 無唯一性約束（允許多個服務項目）

### 外鍵約束

- 無外鍵關係（三個實體相互獨立）

### 檢查約束

- `News.status`: 只能是 'draft' 或 'published'
- `Service.icon_type`: 只能是 'fontawesome', 'material', 'custom' 或 NULL
- `SiteSettings.show_price`: BOOLEAN（資料庫層級確保）

---

## 效能考量

### 查詢優化

- SiteSettings: 使用 `get_or_create()` 配合唯一索引，查詢效率高
- News: 公開 API 使用複合索引 `(status, publish_date)` 優化篩選和排序
- Service: 使用 `sort_order` 索引優化排序查詢

### 快取策略

- SiteSettings: 可考慮使用 Django 快取（如 Redis）快取設定值，變更時清除快取
- News: 公開 API 可設定適當的 Cache-Control headers
- Service: 變更頻率低，可適當快取

---

## 安全性考量

### 資料驗證

- 所有 URL 欄位必須通過格式驗證（HTTP/HTTPS）
- 檔案上傳必須驗證格式和大小
- 文字欄位必須驗證長度限制

### 權限控制

- 公開 API: 無需身份驗證，只返回已發布內容
- 管理 API: 需要 JWT 身份驗證，僅管理員可存取

---

## 未來擴展考量

### 可能的擴展

- 多語言支援：為 SiteSettings、News、Service 添加多語言欄位
- 版本歷史：為 SiteSettings 添加版本歷史記錄
- 媒體管理：建立獨立的 Media 模型管理上傳的檔案
- 服務分類：為 Service 添加分類功能

### 設計預留

- 所有文字欄位使用 VARCHAR 而非 TEXT（除 News.content），為未來多語言預留空間
- `icon_type` 和 `icon_value` 設計靈活，可支援未來新增圖標庫類型

