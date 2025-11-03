# Tasks: 松果創意 Pinelab 企業官網

**Input**: Design documents from `/specs/001-corporate-website/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: ✅ **包含測試任務** - 用戶明確要求拆解測試程式碼的任務清單

**Organization**: 任務按使用者故事組織，使每個故事可獨立實作與測試。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可並行執行（不同檔案，無依賴）
- **[Story]**: 任務所屬的使用者故事（如 US1, US2, US3）
- 描述中包含確切的檔案路徑

---

## Phase 1: Setup (專案初始化)

**目的**: 專案初始化與基本結構建立

- [x] T001 建立專案目錄結構（backend/, frontend/, infra/, db/）
- [x] T002 初始化後端 Django 專案結構在 backend/src/pinelab/
- [x] T003 [P] 建立後端 requirements.txt 包含 Django 4.2+, DRF, pytest, pytest-django
- [x] T004 [P] 初始化前端 Next.js 專案在 frontend/ 使用 TypeScript 模板
- [ ] T005 [P] 配置後端 .env.example 與環境變數管理
- [ ] T006 [P] 配置前端 .env.example 與環境變數管理
- [x] T007 [P] 設定後端 pytest.ini 和測試配置
- [x] T008 [P] 設定前端 Jest 和 React Testing Library 配置
- [x] T009 建立 Docker Compose 開發環境配置在 infra/docker-compose.yml
- [x] T010 建立 .gitignore 排除不需要的檔案

---

## Phase 2: Foundational (阻塞基礎設施) ⚠️

**目的**: 核心基礎設施，必須在所有使用者故事之前完成

**⚠️ 關鍵**: 此階段未完成前，無法開始任何使用者故事

- [x] T011 設定 PostgreSQL 資料庫連線與 Django settings.py 資料庫配置
- [x] T012 [P] 建立 Django apps 目錄結構（auth/, products/, categories/, tags/, contacts/）
- [x] T013 [P] 實作 Django User 模型擴充（使用 Django AbstractUser）
- [x] T014 [P] 實作核心 HMAC-SHA256 簽章驗證模組在 backend/src/core/signatures.py
- [x] T015 [P] 實作 JWT 認證中間件在 backend/src/core/authentication.py
- [x] T016 [P] 實作權限控制模組在 backend/src/core/permissions.py
- [x] T017 設定 Django REST Framework 全域配置與回應格式
- [x] T018 設定 CORS 配置（django-cors-headers）支援前端跨域請求
- [x] T019 設定媒體檔案儲存配置（MEDIA_ROOT, MEDIA_URL）
- [x] T020 建立基礎錯誤處理與例外處理機制
- [x] T021 [P] 建立基礎測試工具類別（TestClient, 測試 Fixture）在 backend/tests/conftest.py
- [x] T022 [P] 建立前端 API 客戶端基礎結構在 frontend/src/lib/api.ts
- [x] T023 [P] 建立前端簽章生成工具在 frontend/src/lib/signatures.ts
- [x] T024 建立資料庫遷移框架與初始遷移

**檢查點**: 基礎設施就緒 - 使用者故事實作現在可以開始

---

## Phase 3: User Story 1 - 瀏覽與發現商品 (Priority: P1) 🎯 MVP

**目標**: 訪客可以瀏覽和發現商品，透過首頁品牌展示、商品列表、篩選搜尋和商品詳情頁面。

**獨立測試**: 訪問首頁和商品頁、查看商品列表、套用篩選和存取商品詳情可以完整測試此故事。

### 測試 - User Story 1 (先寫測試，確保失敗)

- [x] T025 [P] [US1] 編寫 Category 模型單元測試在 backend/tests/unit/test_category_model.py
- [x] T026 [P] [US1] 編寫 Tag 模型單元測試在 backend/tests/unit/test_tag_model.py
- [x] T027 [P] [US1] 編寫 Product 模型單元測試在 backend/tests/unit/test_product_model.py
- [x] T028 [P] [US1] 編寫 ProductImage 模型單元測試在 backend/tests/unit/test_product_image_model.py
- [x] T029 [P] [US1] 編寫 ProductTag 關聯模型單元測試在 backend/tests/unit/test_product_tag_model.py
- [x] T030 [P] [US1] 編寫 Category Serializer 測試在 backend/tests/unit/test_category_serializer.py
- [x] T031 [P] [US1] 編寫 Tag Serializer 測試在 backend/tests/unit/test_tag_serializer.py
- [x] T032 [P] [US1] 編寫 Product Serializer 測試在 backend/tests/unit/test_product_serializer.py
- [x] T033 [P] [US1] 編寫 GET /api/categories/ API 整合測試在 backend/tests/integration/test_categories_api.py
- [x] T034 [P] [US1] 編寫 GET /api/tags/ API 整合測試在 backend/tests/integration/test_tags_api.py
- [x] T035 [P] [US1] 編寫 GET /api/products/ API 整合測試（含篩選、搜尋、排序）在 backend/tests/integration/test_products_api.py
- [x] T036 [P] [US1] 編寫 GET /api/products/{id}/ API 整合測試在 backend/tests/integration/test_product_detail_api.py
- [x] T037 [P] [US1] 編寫商品篩選邏輯單元測試（分類、標籤、價格區間）在 backend/tests/unit/test_product_filters.py
- [x] T038 [P] [US1] 編寫商品搜尋邏輯單元測試在 backend/tests/unit/test_product_search.py
- [x] T039 [P] [US1] 編寫相關商品推薦邏輯測試在 backend/tests/unit/test_product_recommendations.py
- [x] T040 [P] [US1] 編寫首頁元件測試在 frontend/tests/unit/components/HomePage.test.tsx
- [x] T041 [P] [US1] 編寫商品列表頁元件測試在 frontend/tests/unit/components/ProductList.test.tsx
- [x] T042 [P] [US1] 編寫商品詳情頁元件測試在 frontend/tests/unit/components/ProductDetail.test.tsx
- [x] T043 [P] [US1] 編寫 ProductCard 元件測試在 frontend/tests/unit/components/ProductCard.test.tsx
- [x] T044 [P] [US1] 編寫 ProductFilter 元件測試在 frontend/tests/unit/components/ProductFilter.test.tsx
- [x] T045 [P] [US1] 編寫 API 客戶端測試（商品列表、詳情）在 frontend/tests/unit/lib/api.test.ts
- [x] T046 [P] [US1] 編寫首頁整合測試（E2E）在 frontend/tests/integration/pages/home.test.tsx
- [x] T047 [P] [US1] 編寫商品列表頁整合測試在 frontend/tests/integration/pages/products.test.tsx
- [x] T048 [P] [US1] 編寫商品詳情頁整合測試在 frontend/tests/integration/pages/product-detail.test.tsx

### 實作 - User Story 1

- [x] T049 [P] [US1] 建立 Category 模型在 backend/src/apps/categories/models.py
- [x] T050 [P] [US1] 建立 Tag 模型在 backend/src/apps/tags/models.py
- [x] T051 [US1] 建立 Product 模型在 backend/src/apps/products/models.py（依賴 T049）
- [x] T052 [US1] 建立 ProductImage 模型在 backend/src/apps/products/models.py（依賴 T051）
- [x] T053 [US1] 建立 ProductTag 關聯模型在 backend/src/apps/products/models.py（依賴 T050, T051）
- [x] T054 [US1] 建立資料庫遷移檔案並執行遷移
- [x] T055 [P] [US1] 實作 Category Serializer 在 backend/src/apps/categories/serializers.py
- [x] T056 [P] [US1] 實作 Tag Serializer 在 backend/src/apps/tags/serializers.py
- [x] T057 [US1] 實作 Product Serializer 在 backend/src/apps/products/serializers.py（依賴 T055, T056）
- [x] T058 [P] [US1] 實作 Category ViewSet 在 backend/src/apps/categories/views.py
- [x] T059 [P] [US1] 實作 Tag ViewSet 在 backend/src/apps/tags/views.py
- [x] T060 [US1] 實作 Product FilterSet 支援分類、標籤、價格、搜尋在 backend/src/apps/products/filters.py
- [x] T061 [US1] 實作 Product ViewSet 在 backend/src/apps/products/views.py（依賴 T057, T060）
- [x] T062 [US1] 設定 Category URL 路由在 backend/src/apps/categories/urls.py
- [x] T063 [US1] 設定 Tag URL 路由在 backend/src/apps/tags/urls.py
- [x] T064 [US1] 設定 Product URL 路由在 backend/src/apps/products/urls.py
- [x] T065 [US1] 註冊所有 apps URLs 到主 urls.py
- [x] T066 [P] [US1] 建立前端 TypeScript 型別定義（Product, Category, Tag）在 frontend/src/types/product.ts, category.ts, tag.ts
- [x] T067 [P] [US1] 實作 API 客戶端方法（getProducts, getProduct, getCategories, getTags）在 frontend/src/lib/api.ts
- [x] T068 [P] [US1] 建立首頁元件在 frontend/src/app/page.tsx
- [x] T069 [P] [US1] 建立商品列表頁在 frontend/src/app/products/page.tsx
- [x] T070 [P] [US1] 建立商品詳情頁在 frontend/src/app/products/[id]/page.tsx
- [x] T071 [P] [US1] 建立 ProductCard 元件在 frontend/src/components/ProductCard.tsx
- [x] T072 [P] [US1] 建立 ProductFilter 元件在 frontend/src/components/ProductFilter.tsx
- [x] T073 [US1] 建立相關商品推薦元件在 frontend/src/components/RelatedProducts.tsx
- [x] T074 [US1] 實作首頁最新商品顯示邏輯（最多 6 筆，依更新時間）
- [x] T075 [US1] 實作商品列表篩選功能（分類、標籤、價格區間）
- [x] T076 [US1] 實作商品搜尋功能（提交後搜尋模式）
- [x] T077 [US1] 實作商品排序功能（sort_order 或 updated_at）
- [x] T078 [US1] 實作商品詳情頁相關商品推薦邏輯
- [x] T079 [US1] 實作響應式設計（桌面 4 欄、平板 2 欄、手機 1 欄）

**檢查點**: User Story 1 應可完整運作並獨立測試

---

## Phase 4: User Story 2 - 聯絡企業 (Priority: P2)

**目標**: 訪客可以透過提交聯絡表單聯絡企業，系統驗證輸入並安全儲存。

**獨立測試**: 填寫並提交聯絡表單、驗證驗證規則和確認成功提交可以完整測試此故事。

### 測試 - User Story 2 (先寫測試，確保失敗)

- [x] T080 [P] [US2] 編寫 Contact 模型單元測試在 backend/tests/unit/test_contact_model.py
- [x] T081 [P] [US2] 編寫 Contact Serializer 測試（含驗證規則）在 backend/tests/unit/test_contact_serializer.py
- [x] T082 [P] [US2] 編寫 POST /api/contact/ API 整合測試（含簽章驗證）在 backend/tests/integration/test_contact_api.py
- [x] T083 [P] [US2] 編寫聯絡表單驗證測試（必填欄位、Email 格式、訊息長度）在 backend/tests/unit/test_contact_serializer.py
- [x] T084 [P] [US2] 編寫 HMAC-SHA256 簽章驗證測試在 backend/tests/unit/test_signature_validation.py
- [x] T085 [P] [US2] 編寫 ContactForm 元件測試在 frontend/tests/unit/components/ContactForm.test.tsx
- [x] T086 [P] [US2] 編寫表單驗證邏輯測試在 frontend/tests/unit/lib/form-validation.test.ts
- [x] T087 [P] [US2] 編寫聯絡表單 API 呼叫測試在 frontend/tests/unit/lib/api-contact.test.ts
- [x] T088 [P] [US2] 編寫聯絡頁面整合測試在 frontend/tests/integration/pages/contact.test.tsx
- [x] T089 [P] [US2] 編寫簽章生成功能測試在 frontend/tests/unit/lib/signatures.test.ts

### 實作 - User Story 2

- [x] T090 [P] [US2] 建立 Contact 模型在 backend/src/apps/contacts/models.py
- [x] T091 [US2] 建立資料庫遷移檔案並執行遷移
- [x] T092 [P] [US2] 實作 Contact Serializer 含驗證規則在 backend/src/apps/contacts/serializers.py
- [x] T093 [US2] 實作 Contact ViewSet 含簽章驗證在 backend/src/apps/contacts/views.py
- [x] T094 [US2] 設定 Contact URL 路由在 backend/src/apps/contacts/urls.py
- [x] T095 [US2] 註冊 Contact URLs 到主 urls.py
- [x] T096 [P] [US2] 建立前端 Contact TypeScript 型別定義在 frontend/src/types/contact.ts
- [x] T097 [P] [US2] 實作 API 客戶端 submitContact 方法在 frontend/src/lib/api.ts
- [x] T098 [P] [US2] 實作前端表單驗證工具在 frontend/src/components/ContactForm.tsx
- [x] T099 [P] [US2] 建立聯絡頁面在 frontend/src/app/contact/page.tsx
- [x] T100 [P] [US2] 建立 ContactForm 元件在 frontend/src/components/ContactForm.tsx
- [x] T101 [US2] 實作表單提交與簽章生成邏輯
- [x] T102 [US2] 實作表單驗證與錯誤訊息顯示
- [x] T103 [US2] 實作成功提交後的確認訊息

**檢查點**: User Stories 1 和 2 應可獨立運作

---

## Phase 5: User Story 3 - 管理內容（管理員）(Priority: P3)

**目標**: 授權的管理員可以透過後端 API 管理網站內容，包括商品、分類、標籤和聯絡表單。

**獨立測試**: 進行身份驗證的 API 請求來建立、讀取、更新和刪除內容實體可以完整測試此故事。

### 測試 - User Story 3 (先寫測試，確保失敗)

- [ ] T104 [P] [US3] 編寫 JWT 認證測試在 backend/tests/unit/test_jwt_authentication.py
- [ ] T105 [P] [US3] 編寫管理員權限測試在 backend/tests/unit/test_admin_permissions.py
- [ ] T106 [P] [US3] 編寫 POST /api/auth/login/ API 整合測試在 backend/tests/integration/test_auth_login.py
- [ ] T107 [P] [US3] 編寫 GET /api/auth/me/ API 整合測試在 backend/tests/integration/test_auth_me.py
- [ ] T108 [P] [US3] 編寫管理端點認證測試（401 未認證、403 無權限）在 backend/tests/integration/test_admin_auth.py
- [ ] T109 [P] [US3] 編寫 POST /api/admin/products/ API 整合測試在 backend/tests/integration/test_admin_products_create.py
- [ ] T110 [P] [US3] 編寫 PATCH /api/admin/products/{id}/ API 整合測試在 backend/tests/integration/test_admin_products_update.py
- [ ] T111 [P] [US3] 編寫 DELETE /api/admin/products/{id}/ API 整合測試在 backend/tests/integration/test_admin_products_delete.py
- [ ] T112 [P] [US3] 編寫 POST /api/admin/products/{id}/images/ API 整合測試在 backend/tests/integration/test_admin_product_images.py
- [ ] T113 [P] [US3] 編寫分類管理 API 測試（CRUD）在 backend/tests/integration/test_admin_categories.py
- [ ] T114 [P] [US3] 編寫標籤管理 API 測試（CRUD）在 backend/tests/integration/test_admin_tags.py
- [ ] T115 [P] [US3] 編寫分類刪除保護測試（有關聯商品時不允許刪除）在 backend/tests/unit/test_category_delete_protection.py
- [ ] T116 [P] [US3] 編寫聯絡表單管理 API 測試在 backend/tests/integration/test_admin_contacts.py
- [ ] T117 [P] [US3] 編寫圖片上傳驗證測試（格式、大小、MIME type）在 backend/tests/unit/test_image_upload_validation.py
- [ ] T118 [P] [US3] 編寫商品排序調整測試在 backend/tests/integration/test_product_sort_order.py

### 實作 - User Story 3

- [ ] T119 [US3] 實作 JWT Token 生成與驗證在 backend/src/core/authentication.py
- [ ] T120 [US3] 實作管理員權限檢查在 backend/src/core/permissions.py
- [ ] T121 [P] [US3] 實作 Auth ViewSet（login, me）在 backend/src/apps/auth/views.py
- [ ] T122 [US3] 設定 Auth URL 路由在 backend/src/apps/auth/urls.py
- [ ] T123 [US3] 註冊 Auth URLs 到主 urls.py
- [ ] T124 [US3] 實作管理員 Product ViewSet（CRUD + 圖片上傳）在 backend/src/apps/products/admin_views.py
- [ ] T125 [US3] 實作管理員 Category ViewSet（CRUD + 刪除保護）在 backend/src/apps/categories/admin_views.py
- [ ] T126 [US3] 實作管理員 Tag ViewSet（CRUD）在 backend/src/apps/tags/admin_views.py
- [ ] T127 [US3] 實作管理員 Contact ViewSet（讀取）在 backend/src/apps/contacts/admin_views.py
- [ ] T128 [US3] 實作圖片上傳處理邏輯（驗證、儲存、路徑生成）在 backend/src/apps/products/image_handler.py
- [ ] T129 [US3] 設定所有管理端點 URL 路由（/api/admin/*）
- [ ] T130 [US3] 實作管理端點簽章驗證中間件
- [ ] T131 [P] [US3] 建立前端認證工具（login, token 管理）在 frontend/src/lib/auth.ts
- [ ] T132 [P] [US3] 實作前端管理 API 客戶端方法在 frontend/src/lib/admin-api.ts

**檢查點**: 所有使用者故事應可獨立運作

---

## Phase 6: Polish & Cross-Cutting Concerns

**目的**: 影響多個使用者故事的改進

- [ ] T133 [P] 實作 Footer 元件含社群連結在 frontend/src/components/Footer.tsx
- [ ] T134 [P] 實作根布局元件在 frontend/src/app/layout.tsx
- [ ] T135 [P] 建立響應式設計通用樣式與工具類別在 frontend/src/styles/responsive.css
- [ ] T136 [P] 實作錯誤邊界處理元件在 frontend/src/components/ErrorBoundary.tsx
- [ ] T137 [P] 實作 404 錯誤頁面在 frontend/src/app/not-found.tsx
- [ ] T138 [P] 實作載入狀態元件在 frontend/src/components/Loading.tsx
- [ ] T139 實作全域錯誤處理與日誌記錄
- [ ] T140 [P] 建立 Mock 資料檔案（products, categories, tags）在 frontend/src/mocks/
- [ ] T141 [P] 實作 Mock API 服務（MVP 階段使用）在 frontend/src/lib/mock-api.ts
- [ ] T142 實作資料庫索引優化（根據 data-model.md）
- [ ] T143 實作 API 回應快取機制（可選優化）
- [ ] T144 [P] 編寫端到端整合測試（Docker Compose test containers）
- [ ] T145 [P] 設定 CI/CD pipeline（GitHub Actions）在 infra/.github/workflows/ci.yml
- [ ] T146 驗證 quickstart.md 中的所有步驟
- [ ] T147 [P] 更新專案文件（README, API 文件）
- [ ] T148 程式碼清理與重構
- [ ] T149 效能優化（查詢優化、圖片壓縮等）
- [ ] T150 安全性強化（輸入清理、SQL 注入防護等）

---

## Dependencies & Execution Order

### Phase 依賴關係

- **Setup (Phase 1)**: 無依賴 - 可立即開始
- **Foundational (Phase 2)**: 依賴 Setup 完成 - **阻塞所有使用者故事**
- **User Stories (Phase 3+)**: 全部依賴 Foundational 階段完成
  - 使用者故事可並行進行（如有足夠人力）
  - 或按優先級順序執行（P1 → P2 → P3）
- **Polish (Phase 6)**: 依賴所有期望的使用者故事完成

### 使用者故事依賴關係

- **User Story 1 (P1)**: Foundational (Phase 2) 完成後可開始 - 不依賴其他故事
- **User Story 2 (P2)**: Foundational (Phase 2) 完成後可開始 - 可整合 US1 但應可獨立測試
- **User Story 3 (P3)**: Foundational (Phase 2) 完成後可開始 - 可整合 US1/US2 但應可獨立測試

### 每個使用者故事內部

- **測試必須先寫並失敗**，然後再實作
- 模型先於服務
- 服務先於端點
- 核心實作先於整合
- 故事完成後再進入下一個優先級

### 並行執行機會

- 所有 Setup 任務標記 [P] 可並行執行
- 所有 Foundational 任務標記 [P] 可並行執行（在 Phase 2 內）
- Foundational 階段完成後，所有使用者故事可並行開始（如團隊容量允許）
- 使用者故事內標記 [P] 的所有測試可並行執行
- 使用者故事內標記 [P] 的模型可並行執行
- 不同使用者故事可由不同團隊成員並行進行

---

## Parallel Example: User Story 1

```bash
# 並行執行 User Story 1 的所有模型測試：
T025: Category 模型測試
T026: Tag 模型測試  
T027: Product 模型測試
T028: ProductImage 模型測試
T029: ProductTag 模型測試

# 並行執行 User Story 1 的所有模型實作：
T049: Category 模型
T050: Tag 模型

# 並行執行前端元件測試：
T040: 首頁元件測試
T041: 商品列表頁元件測試
T042: 商品詳情頁元件測試
T043: ProductCard 元件測試
T044: ProductFilter 元件測試
```

---

## Implementation Strategy

### MVP First (僅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（關鍵 - 阻塞所有故事）
3. 完成 Phase 3: User Story 1
4. **停止並驗證**: 獨立測試 User Story 1
5. 如準備就緒，可部署/展示

### 漸進式交付

1. 完成 Setup + Foundational → 基礎就緒
2. 加入 User Story 1 → 獨立測試 → 部署/展示（MVP！）
3. 加入 User Story 2 → 獨立測試 → 部署/展示
4. 加入 User Story 3 → 獨立測試 → 部署/展示
5. 每個故事增加價值而不破壞之前的故事

### 並行團隊策略

多人開發時：

1. 團隊共同完成 Setup + Foundational
2. Foundational 完成後：
   - 開發者 A: User Story 1（測試與實作）
   - 開發者 B: User Story 2（測試與實作）
   - 開發者 C: User Story 3（測試與實作）
3. 故事獨立完成與整合

---

## 任務統計

- **總任務數**: 150
- **Phase 1 (Setup)**: 10 個任務
- **Phase 2 (Foundational)**: 14 個任務
- **Phase 3 (User Story 1)**: 55 個任務（24 測試 + 31 實作）
- **Phase 4 (User Story 2)**: 24 個任務（10 測試 + 14 實作）
- **Phase 5 (User Story 3)**: 33 個任務（15 測試 + 18 實作）
- **Phase 6 (Polish)**: 18 個任務

### 測試任務統計

- **總測試任務數**: 49
- **後端測試**: 35
- **前端測試**: 14
- **單元測試**: 25
- **整合測試**: 24

### 建議 MVP 範圍

**僅包含 User Story 1 (Phase 1 + 2 + 3)**：
- Setup: 10 任務
- Foundational: 14 任務  
- User Story 1: 55 任務
- **MVP 總計**: 79 任務

---

## Notes

- [P] 任務 = 不同檔案，無依賴，可並行
- [Story] 標籤將任務映射到特定使用者故事以便追蹤
- 每個使用者故事應可獨立完成與測試
- 實作前驗證測試失敗
- 每個任務或邏輯群組後提交
- 在任何檢查點停止以獨立驗證故事
- 避免：模糊任務、相同檔案衝突、破壞獨立性的跨故事依賴

