# Implementation Plan: 自訂後台前端介面（Admin Portal）

**Branch**: 001-custom-admin-ui  
**Spec**: ./spec.md  
**Status**: Plan (Phase 2 stops here)

## Technical Context
- 路由前綴：/admin-portal/*（與公開站分離）
- 認證：既有 JWT 登入端點；前端保存 access/refresh；逾期處理
- RBAC：Admin/Editor/Analyst（由 token/使用者資訊提供角色）
- 圖片直傳：呼叫管理上傳端點；後端儲存至 /media/products/{id}/；回傳相對路徑
- Dashboard：以現有資料表聚合計算，區間預設 30 天
- 非功能：P95 清單互動 < 1s（1k 筆）、E2E 覆蓋核心路由、易用性與可達性基本要求

## Constitution Check（excerpt）
- 程式品質：型別、自動化測試、Linter OK（前/後端各自遵循）
- 測試標準：TDD、覆蓋率 ≥ 80%、單元/整合/E2E 分層
- UX 一致：響應式、錯誤/載入/空狀態一致
- 效能：列表互動 P95 < 1s；後端 API P95 < 500ms（以既有後端為準）

結論：無阻斷性違反；實作時需保證測試與 UX 一致性落地。

## Phases

### Phase 0: Research（完成）
- 產出 ./research.md，決議 RBAC、直傳、Dashboard 指標。

### Phase 1: Design & Contracts（本分支交付）
1) Data Model（前端視角）
- AdminUser: id, username, role
- Product: id, name, slug, description, price, sort_order, is_active, category, tags, images[]
- ProductImage: id, image_url, is_primary, sort_order
- Category, Tag, Contact（同公開模型但加上管理欄位）

2) Contracts（管理端 API）
- Auth: POST /api/auth/login/
- Products: CRUD + POST /api/admin/products/{id}/upload_image/
- Categories/Tags: CRUD
- Contacts: 列表、詳情、標記已讀/未讀
- Dashboard: GET /api/admin/dashboard/metrics?range=30d

3) 前端路由與頁面
- /admin-portal/login
- /admin-portal/dashboard
- /admin-portal/products, /products/new, /products/{id}
- /admin-portal/categories, /tags, /contacts
- /admin-portal/account

4) 權限與導覽
- Route Guard + Nav Guard 依角色顯示/禁用

### Phase 2: Implementation Tasks（概要）
- Auth context 與 RBAC 守衛、Token 儲存/刷新
- Layout/Navigation、Breadcrumb、Toast/Error Boundary
- Products CRUD 表單 & 圖片直傳（拖放/進度）
- Categories/Tags CRUD；Contacts 列表/標記
- Dashboard 卡片與圖表（30 天趨勢）
- 測試：單元（元件/工具）、整合（頁面流程）、E2E（核心路由）

## Artifacts
- ./research.md（完成）
- ./data-model.md（待）
- ./contracts/openapi.yaml（待）
- ./quickstart.md（待）

