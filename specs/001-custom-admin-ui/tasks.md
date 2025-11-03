# Tasks: 自訂後台前端介面（Admin Portal）

Branch: 001-custom-admin-ui  
Spec: ./spec.md  
Plan: ./plan.md  
Contracts: ./contracts/openapi.yaml

---

## Phase 1: Setup

- [x] T001 Create admin portal base route at frontend/src/app/admin-portal/layout.tsx
- [x] T002 Create admin login page at frontend/src/app/admin-portal/login/page.tsx
- [x] T003 [P] Initialize admin auth context at frontend/src/lib/admin-auth.ts
- [x] T004 [P] Extend admin API client (JWT headers) at frontend/src/lib/admin-api.ts
- [x] T005 Configure protected route wrapper at frontend/src/components/admin/ProtectedRoute.tsx
- [x] T006 Add admin nav + breadcrumbs at frontend/src/components/admin/AdminLayout.tsx

## Phase 2: Foundational

- [ ] T007 Add RBAC guard utilities (roles: admin|editor|analyst) at frontend/src/lib/rbac.ts
- [x] T007 Add RBAC guard utilities (roles: admin|editor|analyst) at frontend/src/lib/rbac.ts
- [x] T008 [P] Add toast/error boundary hooks at frontend/src/components/admin/feedback/
- [x] T009 [P] File upload helper with progress at frontend/src/lib/upload.ts
- [x] T010 Add admin routes to app-level nav visibility at frontend/src/app/layout.tsx
- [x] T011 Define shared table, filters, pagination at frontend/src/components/admin/table/

---

## Phase 3: User Story 1 - 登入與存取控制 (P1)

 - [x] T012 [US1] Build login form + validation at frontend/src/app/admin-portal/login/LoginForm.tsx
 - [x] T013 [US1] Implement login API call at frontend/src/lib/admin-api.ts
 - [x] T014 [US1] Persist tokens (access/refresh) securely at frontend/src/lib/admin-auth.ts
 - [x] T015 [US1] Implement route guard redirect to /admin-portal/login at frontend/src/components/admin/ProtectedRoute.tsx
 - [x] T016 [US1] Implement logout and token expiry handling at frontend/src/lib/admin-auth.ts
 - [x] T017 [US1] Create dashboard shell page at frontend/src/app/admin-portal/dashboard/page.tsx

Acceptance (independent):
- 登入成功跳轉 Dashboard；未登入訪問受保護路由會被導向登入。

---

## Phase 4: User Story 2 - 商品管理 (P1)

- [ ] T018 [US2] Products list page with search/sort/paginate at frontend/src/app/admin-portal/products/page.tsx
- [ ] T019 [P] [US2] Product form component (create/edit) at frontend/src/components/admin/products/ProductForm.tsx
- [ ] T020 [P] [US2] Implement create/update/delete APIs at frontend/src/lib/admin-api.ts
- [ ] T021 [US2] Product detail/edit page at frontend/src/app/admin-portal/products/[id]/page.tsx
- [ ] T022 [US2] Image manager UI (list, set primary, sort) at frontend/src/components/admin/products/ImageManager.tsx
- [ ] T023 [P] [US2] File upload UI (drag&drop, progress) at frontend/src/components/admin/products/ImageUpload.tsx
- [ ] T024 [US2] Bind uploaded path to product images at frontend/src/components/admin/products/ImageManager.tsx

Acceptance (independent):
- 能建立/編輯/刪除商品；可上傳圖片、設定主圖與排序。

---

## Phase 5: User Story 3 - 分類與標籤管理 (P2)

- [ ] T025 [US3] Categories list + CRUD at frontend/src/app/admin-portal/categories/page.tsx
- [ ] T026 [US3] Tags list + CRUD at frontend/src/app/admin-portal/tags/page.tsx
- [ ] T027 [P] [US3] Category/Tag forms with validation at frontend/src/components/admin/dicts/

Acceptance (independent):
- 能新增/修改/刪除分類與標籤；刪除被引用分類時顯示阻擋提示。

---

## Phase 6: User Story 4 - 聯絡表單管理 (P2)

- [ ] T028 [US4] Contacts list with search/paginate at frontend/src/app/admin-portal/contacts/page.tsx
- [ ] T029 [US4] Contact detail drawer/page at frontend/src/components/admin/contacts/ContactDetail.tsx
- [ ] T030 [US4] Mark read/unread actions at frontend/src/lib/admin-api.ts

Acceptance (independent):
- 能查看聯絡表單並切換已讀狀態。

---

## Phase 7: User Story 5 - 清單搜尋/篩選/排序 (P3)

- [ ] T031 [US5] Common filter bar (keywords/category/tag/price) at frontend/src/components/admin/filters/FilterBar.tsx
- [ ] T032 [US5] Persist filters to URL query at frontend/src/lib/url-state.ts

Acceptance (independent):
- 搜尋/篩選/排序可用，刷新仍保留狀態。

---

## Phase 8: Dashboard（圖表與指標）

- [ ] T033 [US1] Dashboard cards (totals) at frontend/src/components/admin/dashboard/Cards.tsx
- [ ] T034 [P] [US1] Trends chart (30d) at frontend/src/components/admin/dashboard/Trends.tsx
- [ ] T035 [P] [US1] Health metrics section at frontend/src/components/admin/dashboard/Health.tsx
- [ ] T036 Backend dashboard endpoint GET /api/admin/dashboard/metrics/ at backend/src/apps/products/admin_views.py

Acceptance (independent):
- 顯示總覽、趨勢、健康度指標；API 回傳資料正確。

---

## Phase 9: RBAC 與導覽控制

- [ ] T037 Apply RBAC to routes and menus at frontend/src/lib/rbac.ts
- [ ] T038 Hide/disable unauthorized actions/buttons at frontend/src/components/admin/**

---

## Phase 10: Polish & Cross-Cutting

- [ ] T039 Loading/empty/error states audit at frontend/src/app/admin-portal/**
- [ ] T040 Add confirmation modals for destructive actions at frontend/src/components/admin/modals/ConfirmModal.tsx
- [ ] T041 i18n strings centralization (zh-TW baseline) at frontend/src/lib/i18n.ts
- [ ] T042 Accessibility pass (focus/aria/labels) at frontend/src/components/admin/**

---

## Dependencies
- Story order: US1 → US2 → (US3 & US4 in parallel) → US5 → Dashboard/RBAC → Polish

## Parallel Execution Examples
- T019/T020/T023 可並行（不同檔案層）。
- US3 與 US4 可在 US2 完成後並行。

## MVP 建議
- 僅涵蓋 US1（登入與存取控制）+ US2（商品基本 CRUD 與圖片上傳）。

