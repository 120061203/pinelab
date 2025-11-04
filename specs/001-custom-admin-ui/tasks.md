# 任務清單：自訂後台前端介面（Admin Portal）

Branch: 001-custom-admin-ui  
Spec: ./spec.md  
Plan: ./plan.md  
Contracts: ./contracts/openapi.yaml

---

## 第 1 階段：初始化（Setup）

- [x] T001 Create admin portal base route at frontend/src/app/admin-portal/layout.tsx
- [x] T002 Create admin login page at frontend/src/app/admin-portal/login/page.tsx
- [x] T003 [P] Initialize admin auth context at frontend/src/lib/admin-auth.ts
- [x] T004 [P] Extend admin API client (JWT headers) at frontend/src/lib/admin-api.ts
- [x] T005 Configure protected route wrapper at frontend/src/components/admin/ProtectedRoute.tsx
- [x] T006 Add admin nav + breadcrumbs at frontend/src/components/admin/AdminLayout.tsx

## 第 2 階段：基礎建設（Foundational）

- [ ] T007 Add RBAC guard utilities (roles: admin|editor|analyst) at frontend/src/lib/rbac.ts
- [x] T007 Add RBAC guard utilities (roles: admin|editor|analyst) at frontend/src/lib/rbac.ts
- [x] T008 [P] Add toast/error boundary hooks at frontend/src/components/admin/feedback/
- [x] T009 [P] File upload helper with progress at frontend/src/lib/upload.ts
- [x] T010 Add admin routes to app-level nav visibility at frontend/src/app/layout.tsx
- [x] T011 Define shared table, filters, pagination at frontend/src/components/admin/table/

---

## 第 3 階段：使用者故事 1 - 登入與存取控制 (P1)

 - [x] T012 [US1] Build login form + validation at frontend/src/app/admin-portal/login/LoginForm.tsx
 - [x] T013 [US1] Implement login API call at frontend/src/lib/admin-api.ts
 - [x] T014 [US1] Persist tokens (access/refresh) securely at frontend/src/lib/admin-auth.ts
 - [x] T015 [US1] Implement route guard redirect to /admin-portal/login at frontend/src/components/admin/ProtectedRoute.tsx
 - [x] T016 [US1] Implement logout and token expiry handling at frontend/src/lib/admin-auth.ts
 - [x] T017 [US1] Create dashboard shell page at frontend/src/app/admin-portal/dashboard/page.tsx

驗收標準（可獨立驗收）：
- 登入成功跳轉 Dashboard；未登入訪問受保護路由會被導向登入。

---

## 第 4 階段：使用者故事 2 - 商品管理 (P1)

- [ ] T018 [US2] Products list page with search/sort/paginate at frontend/src/app/admin-portal/products/page.tsx
- [x] T018 [US2] Products list page with search/sort/paginate at frontend/src/app/admin-portal/products/page.tsx
- [x] T019 [P] [US2] Product form component (create/edit) at frontend/src/components/admin/products/ProductForm.tsx
- [x] T020 [P] [US2] Implement create/update/delete APIs at frontend/src/lib/admin-api.ts
- [x] T021 [US2] Product detail/edit page at frontend/src/app/admin-portal/products/[id]/page.tsx
- [x] T022 [US2] Image manager UI (list, set primary, sort) at frontend/src/components/admin/products/ImageManager.tsx
- [x] T023 [P] [US2] File upload UI (drag&drop, progress) at frontend/src/components/admin/products/ImageUpload.tsx
- [x] T024 [US2] Bind uploaded path to product images at frontend/src/components/admin/products/ImageManager.tsx
- [ ] T025 [US2] 上傳圖片時提供選擇主圖選項（checkbox）於 frontend/src/components/admin/products/ImageUpload.tsx
- [ ] T026 [US2] 圖片管理區塊提供設定/取消主圖功能於 frontend/src/components/admin/products/ImageManager.tsx
- [ ] T057 [US2] 商品列表頁添加刪除按鈕於 frontend/src/app/admin-portal/products/page.tsx
  - 每個商品行添加刪除按鈕
  - 點擊刪除按鈕時顯示確認對話框
  - 確認後調用刪除 API 並刷新列表
- [ ] T058 [US2] 商品列表頁添加批量修改功能於 frontend/src/app/admin-portal/products/page.tsx
  - 添加批量選擇功能（checkbox，支援全選/取消全選）
  - 添加「批量修改」按鈕和操作面板
  - 批量操作選項包括：
    - 修改商品啟用狀態（啟用/停用）
    - 隱藏商品（設定 is_hidden 狀態）
    - 刪除商品（批量刪除）
    - 暫存商品（設定為草稿狀態）
  - 每個操作都顯示確認對話框
  - 後端需支援批量更新商品狀態 API
- [ ] T059 [US2] 後端批量更新商品狀態 API 於 backend/src/apps/products/admin_views.py
  - 新增 API 端點：POST /api/admin/products/batch_update_status/
  - 接收商品 ID 列表和操作類型（enable/disable/hide/show/delete/draft）
  - 支援批量啟用、停用、隱藏、顯示、刪除、暫存等操作

驗收標準（可獨立驗收）：
- 能建立/編輯/刪除商品；可上傳圖片、設定主圖與排序。
- 商品列表頁每個商品都有刪除按鈕，點擊後可刪除商品。
- 商品列表頁支援批量選擇和批量修改（啟用狀態、隱藏、刪除、暫存）。
- 批量操作後商品狀態正確更新。

---

## 第 5 階段：使用者故事 3 - 分類與標籤管理 (P2)

 - [x] T025 [US3] 分類列表與 CRUD 於 frontend/src/app/admin-portal/categories/page.tsx
 - [x] T026 [US3] 標籤列表與 CRUD 於 frontend/src/app/admin-portal/tags/page.tsx
 - [x] T027 [P] [US3] 分類/標籤表單（含驗證）於 frontend/src/components/admin/dicts/
 - [ ] T056 [US3] 標籤表單添加取消按鈕於 frontend/src/components/admin/dicts/TagForm.tsx
   - 編輯模式下顯示取消按鈕
   - 點擊取消按鈕時重置表單並取消編輯狀態
   - 新增模式下取消按鈕可清空表單

驗收標準（可獨立驗收）：
- 能新增/修改/刪除分類與標籤；刪除被引用分類時顯示阻擋提示。
- 標籤表單提供取消按鈕，可取消編輯或清空表單。

---

## 第 6 階段：使用者故事 4 - 聯絡表單管理 (P2)

 - [x] T028 [US4] 聯絡表單列表（搜尋/分頁）於 frontend/src/app/admin-portal/contacts/page.tsx
 - [x] T029 [US4] 聯絡表單詳情（抽屜/頁面）於 frontend/src/components/admin/contacts/ContactDetail.tsx
 - [x] T030 [US4] 已讀/未讀動作 API 於 frontend/src/lib/admin-api.ts

驗收標準（可獨立驗收）：
- 能查看聯絡表單並切換已讀狀態。

---

## 第 7 階段：使用者故事 5 - 清單搜尋/篩選/排序 (P3)

 - [x] T031 [US5] 共用篩選列（關鍵字/分類/標籤/價格）於 frontend/src/components/admin/filters/FilterBar.tsx
 - [x] T032 [US5] 將篩選條件保存到 URL Query 於 frontend/src/lib/url-state.ts

驗收標準（可獨立驗收）：
- 搜尋/篩選/排序可用，刷新仍保留狀態。

---

## 第 8 階段：Dashboard（圖表與指標）

 - [x] T033 [US1] Dashboard 卡片（總覽）於 frontend/src/components/admin/dashboard/Cards.tsx
 - [x] T034 [P] [US1] 趨勢圖（30 天）於 frontend/src/components/admin/dashboard/Trends.tsx
 - [x] T035 [P] [US1] 健康度區塊於 frontend/src/components/admin/dashboard/Health.tsx
 - [x] T036 後端 Dashboard 指標端點 GET /api/admin/dashboard/metrics/ 於 backend/src/apps/products/admin_views.py

Acceptance (independent):
- 顯示總覽、趨勢、健康度指標；API 回傳資料正確。

---

## 第 9 階段：RBAC 與導覽控制

 - [x] T037 將 RBAC 套用到路由與選單於 frontend/src/lib/rbac.ts
 - [x] T038 隱藏/禁用未授權的操作按鈕於 frontend/src/components/admin/**

---

## 第 10 階段：收尾與共用優化（Polish & Cross-Cutting）

 - [x] T039 載入/空/錯誤狀態盤點於 frontend/src/app/admin-portal/**
 - [x] T040 危險操作確認對話框於 frontend/src/components/admin/modals/ConfirmModal.tsx
 - [x] T041 i18n 文案集中管理（zh-TW 基線）於 frontend/src/lib/i18n.ts
 - [x] T042 無障礙檢查（焦點/ARIA/標籤）於 frontend/src/components/admin/**

---

## 第 11 階段：前端商品列表按分類分組顯示 (P2)

 - [ ] T043 前端商品列表頁按分類分組顯示於 frontend/src/app/products/page.tsx
   - 將商品按分類分組，每個分類一個獨立區塊
   - 區塊標題顯示分類名稱
   - 當有新分類時，自動創建新的區塊（不與現有商品混在一起）
   - 區塊內商品按 sort_order 降序排列（數字越大越前）
   - 無分類商品顯示在「未分類」區塊中

 - [ ] T044 首頁商品列表按分類分組顯示於 frontend/src/app/page.tsx
   - 首頁「最新商品」區塊改為按分類分組顯示
   - 每個分類顯示該分類下的最新商品（按 sort_order 和 updated_at 排序）
   - 分類區塊順序按分類的 sort_order 降序排列

驗收標準（可獨立驗收）：
- 商品列表頁按分類分組，每個分類一個區塊
- 新增分類時自動創建新的區塊
- 區塊內商品順序正確（sort_order 降序）

---

## 第 12 階段：拖移排序功能 (P2)

 - [x] T045 後台商品列表拖移排序功能於 frontend/src/app/admin-portal/products/page.tsx
   - 使用拖移排序庫（@dnd-kit）
   - 商品列表支持拖移調整順序
   - 拖移後自動更新 sort_order 並調用 API 保存
   - 顯示拖移時的視覺反饋（高亮、預覽位置、拖移圖標）

 - [x] T046 後台分類列表拖移排序功能於 frontend/src/app/admin-portal/categories/page.tsx
   - 分類列表支持拖移調整順序
   - 拖移後自動更新 sort_order 並調用 API 保存

 - [x] T047 後台商品圖片拖移排序功能於 frontend/src/components/admin/products/ImageManager.tsx
   - 商品圖片支持拖移調整順序
   - 拖移後自動更新 sort_order 並調用 API 保存
   - 顯示圖片排序編號

 - [x] T048 後端批量更新排序 API 於 backend/src/apps/products/admin_views.py
   - 新增 API 端點：POST /api/admin/products/batch_update_sort/
   - 接收商品 ID 列表和對應的 sort_order，批量更新

 - [x] T049 後端批量更新分類排序 API 於 backend/src/apps/categories/admin_views.py
   - 新增 API 端點：POST /api/admin/categories/batch_update_sort/
   - 接收分類 ID 列表和對應的 sort_order，批量更新

 - [x] T050 後端批量更新商品圖片排序 API 於 backend/src/apps/products/admin_views.py
   - 新增 API 端點：POST /api/admin/products/{id}/images/batch_update_sort/
   - 接收圖片 ID 列表和對應的 sort_order，批量更新

驗收標準（可獨立驗收）：
- 管理員可通過拖移調整商品、分類、圖片的順序
- 拖移後順序自動保存到資料庫
- 前端列表顯示順序與拖移後的順序一致

---

## 第 13 階段：商品分類與標籤管理功能 (P2)

 - [x] T051 商品表單添加分類和標籤選擇功能於 frontend/src/components/admin/products/ProductForm.tsx
   - 添加分類下拉選單（可選，支援清空）
   - 添加標籤多選功能（checkbox 或 multi-select）
   - 載入所有啟用的分類和標籤供選擇
   - 商品建立/編輯時可指定分類和標籤
   - 表單提交時包含 category_id 和 tag_ids

 - [x] T052 分類頁面批量修改商品分類功能於 frontend/src/app/admin-portal/categories/page.tsx
   - 添加批量選擇功能（checkbox）
   - 添加「批量修改分類」按鈕和操作面板
   - 選擇多個商品後，可批量將它們移動到指定分類
   - 顯示操作確認對話框
   - 後端需支援批量更新商品分類 API

 - [x] T053 標籤頁面批量修改商品標籤功能於 frontend/src/app/admin-portal/tags/page.tsx
   - 添加批量選擇功能（checkbox）
   - 添加「批量添加/移除標籤」按鈕和操作面板
   - 選擇多個商品後，可批量添加或移除標籤
   - 顯示操作確認對話框
   - 後端需支援批量更新商品標籤 API

 - [x] T054 後端批量更新商品分類 API 於 backend/src/apps/products/admin_views.py
   - 新增 API 端點：POST /api/admin/products/batch_update_category/
   - 接收商品 ID 列表和目標分類 ID，批量更新
   - 支援清空分類（category_id 為 null）

 - [x] T055 後端批量更新商品標籤 API 於 backend/src/apps/products/admin_views.py
   - 新增 API 端點：POST /api/admin/products/batch_update_tags/
   - 接收商品 ID 列表和操作類型（add/remove/replace）以及標籤 ID 列表
   - 支援添加標籤、移除標籤、替換標籤三種操作

驗收標準（可獨立驗收）：
- 商品表單可選擇分類和標籤
- 分類和標籤頁面可批量選擇商品並修改
- 批量操作後商品分類/標籤正確更新
- 操作確認對話框正常運作

---

## 依賴與順序
- 故事順序：US1 → US2 →（US3 與 US4 並行）→ US5 → Dashboard/RBAC → Polish → 分類分組顯示 → 拖移排序 → 商品分類與標籤管理
- 第 11 階段（分類分組顯示）可在 US2 完成後進行
- 第 12 階段（拖移排序）建議在第 11 階段完成後進行，或可並行開發
- 第 13 階段（商品分類與標籤管理）可在 US2 完成後進行，與其他階段可並行

## 並行建議
- T019/T020/T023 可並行（不同檔案層）。
- US3 與 US4 可在 US2 完成後並行。
- T043 和 T044 可並行開發。
- T045、T046、T047 可並行開發（不同的拖移排序場景）。
- T051 可獨立開發（商品表單功能）。
- T052 和 T053 可並行開發（不同的批量操作場景）。
- T054 和 T055 可並行開發（不同的批量更新 API）。

## MVP 建議
- 僅涵蓋 US1（登入與存取控制）+ US2（商品基本 CRUD 與圖片上傳）。
- 分類分組顯示和拖移排序功能為增強功能，可在 MVP 後續版本中實現。

