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

驗收標準（可獨立驗收）：
- 能建立/編輯/刪除商品；可上傳圖片、設定主圖與排序。

---

## 第 5 階段：使用者故事 3 - 分類與標籤管理 (P2)

- [ ] T025 [US3] 分類列表與 CRUD 於 frontend/src/app/admin-portal/categories/page.tsx
- [ ] T026 [US3] 標籤列表與 CRUD 於 frontend/src/app/admin-portal/tags/page.tsx
- [ ] T027 [P] [US3] 分類/標籤表單（含驗證）於 frontend/src/components/admin/dicts/

驗收標準（可獨立驗收）：
- 能新增/修改/刪除分類與標籤；刪除被引用分類時顯示阻擋提示。

---

## 第 6 階段：使用者故事 4 - 聯絡表單管理 (P2)

- [ ] T028 [US4] 聯絡表單列表（搜尋/分頁）於 frontend/src/app/admin-portal/contacts/page.tsx
- [ ] T029 [US4] 聯絡表單詳情（抽屜/頁面）於 frontend/src/components/admin/contacts/ContactDetail.tsx
- [ ] T030 [US4] 已讀/未讀動作 API 於 frontend/src/lib/admin-api.ts

驗收標準（可獨立驗收）：
- 能查看聯絡表單並切換已讀狀態。

---

## 第 7 階段：使用者故事 5 - 清單搜尋/篩選/排序 (P3)

- [ ] T031 [US5] 共用篩選列（關鍵字/分類/標籤/價格）於 frontend/src/components/admin/filters/FilterBar.tsx
- [ ] T032 [US5] 將篩選條件保存到 URL Query 於 frontend/src/lib/url-state.ts

驗收標準（可獨立驗收）：
- 搜尋/篩選/排序可用，刷新仍保留狀態。

---

## 第 8 階段：Dashboard（圖表與指標）

- [ ] T033 [US1] Dashboard 卡片（總覽）於 frontend/src/components/admin/dashboard/Cards.tsx
- [ ] T034 [P] [US1] 趨勢圖（30 天）於 frontend/src/components/admin/dashboard/Trends.tsx
- [ ] T035 [P] [US1] 健康度區塊於 frontend/src/components/admin/dashboard/Health.tsx
- [ ] T036 後端 Dashboard 指標端點 GET /api/admin/dashboard/metrics/ 於 backend/src/apps/products/admin_views.py

Acceptance (independent):
- 顯示總覽、趨勢、健康度指標；API 回傳資料正確。

---

## 第 9 階段：RBAC 與導覽控制

- [ ] T037 將 RBAC 套用到路由與選單於 frontend/src/lib/rbac.ts
- [ ] T038 隱藏/禁用未授權的操作按鈕於 frontend/src/components/admin/**

---

## 第 10 階段：收尾與共用優化（Polish & Cross-Cutting）

- [ ] T039 載入/空/錯誤狀態盤點於 frontend/src/app/admin-portal/**
- [ ] T040 危險操作確認對話框於 frontend/src/components/admin/modals/ConfirmModal.tsx
- [ ] T041 i18n 文案集中管理（zh-TW 基線）於 frontend/src/lib/i18n.ts
- [ ] T042 無障礙檢查（焦點/ARIA/標籤）於 frontend/src/components/admin/**

---

## 依賴與順序
- 故事順序：US1 → US2 →（US3 與 US4 並行）→ US5 → Dashboard/RBAC → Polish

## 並行建議
- T019/T020/T023 可並行（不同檔案層）。
- US3 與 US4 可在 US2 完成後並行。

## MVP 建議
- 僅涵蓋 US1（登入與存取控制）+ US2（商品基本 CRUD 與圖片上傳）。

