# Research: 網站設定管理

**Feature**: 002-site-settings  
**Date**: 2025-01-27

## Research Tasks

### 1. Django Singleton Pattern for SiteSettings

**Task**: 研究如何在 Django 中實作單例模式的 SiteSettings 模型

**Decision**: 使用 Django 的 `get_or_create()` 方法配合唯一約束，確保系統中只存在一筆 SiteSettings 記錄

**Rationale**: 
- Django ORM 原生支援，無需額外依賴
- 簡單可靠，符合 Django 最佳實踐
- 可透過資料庫約束確保唯一性

**Implementation Approach**:
- 在模型中添加 `unique=True` 約束（使用 CharField 作為唯一標識，如 `key='site_settings'`）
- 使用 `SiteSettings.objects.get_or_create(key='site_settings')` 確保單例
- 提供類別方法 `SiteSettings.get_instance()` 方便存取

**Alternatives Considered**:
- 使用 Django 的 `settings.py` 配置：不適合動態更新，需要重啟服務
- 使用 Redis 快取：增加複雜度，不符合 MVP 需求
- 使用單獨的配置表：與現有架構不一致

**References**:
- Django ORM `get_or_create()` documentation
- 現有專案中的類似模式（如 User 模型）

---

### 2. Icon Font Library Selection

**Task**: 選擇適合的圖標字體庫（Font Awesome vs Material Icons）

**Decision**: 支援兩種圖標字體庫（Font Awesome 和 Material Icons），由前端整合，後端僅儲存圖標名稱字串

**Rationale**:
- 提供最大靈活性，管理員可選擇偏好的圖標庫
- 後端不依賴特定圖標庫，降低耦合
- 前端可根據需求選擇或同時支援多個圖標庫

**Implementation Approach**:
- 後端儲存圖標類型（`icon_type`: 'fontawesome' | 'material' | 'custom'）和圖標值（`icon_value`: 圖標名稱或檔案 URL）
- 前端整合 Font Awesome 和 Material Icons CDN 或 npm 套件
- 前端根據 `icon_type` 渲染對應的圖標

**Alternatives Considered**:
- 僅支援單一圖標庫：限制管理員選擇
- 後端管理圖標庫：增加後端複雜度，不符合職責分離原則

**References**:
- Font Awesome: https://fontawesome.com/
- Material Icons: https://fonts.google.com/icons
- Next.js 圖標整合最佳實踐

---

### 3. Image Upload Handling in Django

**Task**: 研究 Django 中圖片上傳和儲存的最佳實踐

**Decision**: 使用 Django 的 `FileField` 和 `ImageField`，配合 Pillow 進行圖片驗證，儲存到 `media/site/` 目錄

**Rationale**:
- 與現有專案模式一致（商品圖片使用相同方式）
- Pillow 已包含在專案依賴中
- 本地檔案系統儲存符合 MVP 需求，未來可擴展至雲端儲存

**Implementation Approach**:
- 使用 `ImageField` 配合 `upload_to='site/'` 參數
- 在 Serializer 中驗證檔案格式和大小
- 使用 Django 的 `MEDIA_URL` 和 `MEDIA_ROOT` 設定
- 提供統一的檔案上傳處理函數

**File Size Limits**:
- Logo: ≤ 2MB (SVG)
- Hero橫幅: ≤ 5MB (jpg, jpeg, png, webp)
- 服務圖標: ≤ 1MB (SVG, PNG)

**Alternatives Considered**:
- 使用第三方儲存服務（AWS S3, Cloudinary）：增加複雜度和成本，MVP 階段不必要
- 使用 Base64 編碼儲存：不適合大檔案，增加資料庫負擔

**References**:
- Django FileField/ImageField documentation
- 現有專案中的 `apps/products/models.py` (ProductImage 模型)
- Pillow image validation best practices

---

### 4. News and Service Management Patterns

**Task**: 研究內容管理（News、Service）的資料模型和 API 設計模式

**Decision**: 遵循現有專案的 CRUD 模式，使用 Django REST Framework ViewSets 和 Serializers

**Rationale**:
- 與現有商品、分類、標籤管理保持一致
- DRF ViewSets 提供標準化的 CRUD 操作
- 符合 RESTful API 設計原則

**Implementation Approach**:
- News 模型：標題、內容、發布日期、發布狀態（草稿/已發布）
- Service 模型：標題、描述、圖標類型、圖標值、排序順序
- 使用 `ModelViewSet` 提供完整 CRUD
- 公開 API 使用 `ReadOnlyModelViewSet`，管理 API 使用 `ModelViewSet`
- 實作統一的回應格式（status/data/message）

**State Management**:
- News 使用 `status` 欄位（choices: 'draft', 'published'）
- 公開 API 只返回 `status='published'` 且發布日期 ≤ 當前日期的消息

**Alternatives Considered**:
- 使用狀態機庫（django-fsm）：過度設計，簡單的 choices 欄位足夠
- 使用軟刪除：不符合需求，刪除應該是真刪除

**References**:
- 現有專案中的 `apps/products/admin_views.py` (ProductAdminViewSet)
- Django REST Framework ViewSets documentation
- 現有專案的統一 API 回應格式

---

### 5. Frontend State Management for Site Settings

**Task**: 研究前端如何管理和快取網站設定資料

**Decision**: 使用 React Context 或簡單的狀態管理，配合 API 快取策略

**Rationale**:
- 網站設定是全局資料，適合使用 Context
- 設定變更頻率低，可適當快取
- 符合 Next.js App Router 的資料獲取模式

**Implementation Approach**:
- 在首頁使用 `fetch` 獲取網站設定（可配合 Next.js 的 `revalidate` 進行 ISR）
- 在 admin portal 使用 React Query 或類似庫管理狀態
- 設定變更後可選擇立即重新獲取或等待下次頁面載入

**Caching Strategy**:
- 公開 API：可設定適當的 Cache-Control headers
- 管理 API：不快取，確保即時更新

**Alternatives Considered**:
- 使用 Redux/Zustand：過度設計，Context 足夠
- 完全無快取：可能影響效能，不必要

**References**:
- Next.js App Router data fetching
- React Context API
- 現有專案的前端資料獲取模式

---

## Summary

所有技術決策均基於現有專案架構和最佳實踐，確保：
1. **一致性**: 與現有程式碼風格和模式保持一致
2. **簡單性**: 避免過度設計，符合 MVP 需求
3. **可擴展性**: 為未來擴展（如雲端儲存、多語言）預留空間
4. **可測試性**: 遵循 TDD 原則，確保高測試覆蓋率

