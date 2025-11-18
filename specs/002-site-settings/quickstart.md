# 快速開始指南：網站設定管理

**建立日期**: 2025-01-27  
**適用對象**: 開發人員  
**功能分支**: `002-site-settings`

## 概述

本指南提供網站設定管理功能的實作快速開始步驟，包括後端模型建立、API 端點實作、前端頁面開發和測試。

---

## 前置需求

### 已完成的基礎設施

- ✅ Django 後端環境已設置
- ✅ Next.js 前端環境已設置
- ✅ PostgreSQL 資料庫已配置
- ✅ Admin Portal 已建立
- ✅ JWT 認證系統已實作

### 需要的新依賴

**後端**: 無新增依賴（使用現有 Django 和 DRF）

**前端**: 
- 圖標字體庫（選擇其一或兩者）:
  - `@fortawesome/fontawesome-free` (Font Awesome)
  - `@mui/icons-material` (Material Icons)

---

## 實作步驟

### 步驟 1: 建立 Django App

```bash
cd backend
python manage.py startapp site_settings src/apps/site_settings
```

### 步驟 2: 建立資料模型

在 `backend/src/apps/site_settings/models.py` 中定義三個模型：

1. **SiteSettings** (單例模式)
2. **News** (最新消息)
3. **Service** (服務項目)

參考 `data-model.md` 中的詳細定義。

### 步驟 3: 建立資料庫遷移

```bash
python manage.py makemigrations site_settings
python manage.py migrate site_settings
```

### 步驟 4: 建立 Serializers

在 `backend/src/apps/site_settings/` 中建立：

- `serializers.py` - 公開 API 序列化器
- `admin_serializers.py` - 管理 API 序列化器

### 步驟 5: 建立 ViewSets

在 `backend/src/apps/site_settings/` 中建立：

- `views.py` - 公開 API ViewSets
- `admin_views.py` - 管理 API ViewSets

### 步驟 6: 註冊 URL 路由

在 `backend/src/pinelab/urls.py` 中註冊：

```python
path('api/', include('apps.site_settings.urls')),
path('api/', include('apps.site_settings.admin_urls')),
```

### 步驟 7: 建立前端型別定義

在 `frontend/src/types/` 中建立：

- `site-settings.ts`
- `news.ts`
- `service.ts`

### 步驟 8: 建立 API 客戶端

在 `frontend/src/lib/` 中更新：

- `api.ts` - 新增公開 API 函數
- `admin-api.ts` - 新增管理 API 函數

### 步驟 9: 建立前端元件

在 `frontend/src/components/` 中建立：

- `HeroSection.tsx` - Hero section 元件
- `NewsSection.tsx` - 最新消息區塊
- `ServicesSection.tsx` - 服務項目區塊
- `admin/SiteSettingsForm.tsx` - 網站設定表單
- `admin/NewsForm.tsx` - 最新消息表單
- `admin/ServiceForm.tsx` - 服務項目表單

### 步驟 10: 建立管理頁面

在 `frontend/src/app/admin-portal/` 中建立：

- `site-settings/page.tsx` - 網站設定管理頁面
- `news/page.tsx` - 最新消息列表頁
- `news/[id]/page.tsx` - 最新消息編輯頁
- `services/page.tsx` - 服務項目列表頁
- `services/[id]/page.tsx` - 服務項目編輯頁

### 步驟 11: 更新首頁

在 `frontend/src/app/page.tsx` 中整合：

- 從 API 讀取網站設定
- 顯示 Hero section
- 顯示最新消息區塊
- 顯示服務項目區塊

### 步驟 12: 更新導航

在 `frontend/src/components/admin/AdminLayout.tsx` 中新增：

- 網站設定選單項目
- 最新消息選單項目
- 服務項目選單項目

---

## 開發順序建議

### Phase 1: 後端基礎（TDD）

1. ✅ 建立 SiteSettings 模型和遷移
2. ✅ 建立 News 模型和遷移
3. ✅ 建立 Service 模型和遷移
4. ✅ 編寫模型單元測試
5. ✅ 建立 Serializers
6. ✅ 建立 ViewSets
7. ✅ 編寫 API 整合測試

### Phase 2: 前端基礎

1. ✅ 建立型別定義
2. ✅ 建立 API 客戶端
3. ✅ 建立基礎元件（HeroSection, NewsSection, ServicesSection）
4. ✅ 更新首頁整合網站設定資料
5. ✅ 編寫元件單元測試

### Phase 3: 管理介面

1. ✅ 建立管理表單元件
2. ✅ 建立管理頁面
3. ✅ 整合檔案上傳功能
4. ✅ 整合圖標選擇器
5. ✅ 編寫 E2E 測試

---

## 測試策略

### 後端測試

```bash
# 執行單元測試
pytest backend/tests/unit/test_site_settings_models.py
pytest backend/tests/unit/test_site_settings_serializers.py

# 執行整合測試
pytest backend/tests/integration/test_site_settings_api.py

# 執行所有測試並生成覆蓋率報告
pytest backend/tests/ --cov=apps.site_settings --cov-report=html
```

### 前端測試

```bash
# 執行單元測試
npm test -- components/HeroSection.test.tsx
npm test -- components/NewsSection.test.tsx

# 執行所有測試並生成覆蓋率報告
npm run test:coverage
```

---

## 常見問題

### Q: 如何確保 SiteSettings 是單例？

A: 使用 `SiteSettings.objects.get_or_create(key='site_settings')` 並在模型中設定 `key` 欄位為 `unique=True`。

### Q: 如何處理圖片上傳？

A: 使用 Django 的 `ImageField` 和 `FileField`，在 Serializer 中驗證格式和大小，儲存到 `media/site/` 目錄。

### Q: 如何整合圖標字體庫？

A: 在 Next.js 中透過 CDN 或 npm 套件引入圖標字體，根據 `icon_type` 動態渲染對應圖標。

### Q: 如何處理價格顯示控制？

A: 在商品列表和詳情頁中，檢查 `siteSettings.show_price`，如果為 `false` 則不渲染價格元素。

---

## 下一步

完成實作後，參考 `tasks.md` 進行任務分解和追蹤。

---

## 參考文件

- [規格文件](./spec.md)
- [資料模型設計](./data-model.md)
- [API 合約](./contracts/openapi.yaml)
- [研究文件](./research.md)

