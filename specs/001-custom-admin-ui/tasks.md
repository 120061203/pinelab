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
- [x] T057 [US2] 商品列表頁添加刪除按鈕於 frontend/src/app/admin-portal/products/page.tsx
  - 每個商品行添加刪除按鈕
  - 點擊刪除按鈕時顯示確認對話框
  - 確認後調用刪除 API 並刷新列表
- [x] T058 [US2] 商品列表頁添加批量修改功能於 frontend/src/app/admin-portal/products/page.tsx
  - 添加批量選擇功能（checkbox，支援全選/取消全選）
  - 添加「批量修改」按鈕和操作面板
  - 批量操作選項包括：
    - 修改商品啟用狀態（啟用/停用）
    - 刪除商品（批量刪除）
  - 每個操作都顯示確認對話框
  - 後端需支援批量更新商品狀態 API
- [x] T059 [US2] 後端批量更新商品狀態 API 於 backend/src/apps/products/admin_views.py
  - 新增 API 端點：POST /api/admin/products/batch_update_status/
  - 接收商品 ID 列表和操作類型（enable/disable/delete）
  - 支援批量啟用、停用、刪除等操作
- [x] T060 [US2] 商品列表頁添加更多欄位於 frontend/src/app/admin-portal/products/page.tsx
  - 添加「更新時間」欄位，顯示商品最後更新時間
  - 添加「分類」欄位，顯示商品所屬分類名稱
  - 添加「標籤」欄位，顯示商品的所有標籤（以逗號分隔）
  - 價格欄位格式化：移除不必要的小數點（例如：150.00 顯示為 150，150.50 顯示為 150.5）
  - 確保表格欄位順序合理，可讀性良好

驗收標準（可獨立驗收）：
- 能建立/編輯/刪除商品；可上傳圖片、設定主圖與排序。
- 商品列表頁每個商品都有刪除按鈕，點擊後可刪除商品。
- 商品列表頁支援批量選擇和批量修改（啟用狀態、停用狀態、刪除）。
- 批量操作後商品狀態正確更新。
- 商品列表頁顯示更新時間、分類、標籤等欄位。
- 價格顯示格式正確（移除不必要的小數點）。

---

## 第 5 階段：使用者故事 3 - 分類與標籤管理 (P2)

 - [x] T025 [US3] 分類列表與 CRUD 於 frontend/src/app/admin-portal/categories/page.tsx
 - [x] T026 [US3] 標籤列表與 CRUD 於 frontend/src/app/admin-portal/tags/page.tsx
 - [x] T027 [P] [US3] 分類/標籤表單（含驗證）於 frontend/src/components/admin/dicts/
 - [x] T056 [US3] 標籤表單添加取消按鈕於 frontend/src/components/admin/dicts/TagForm.tsx
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

## 第 14 階段：使用者故事 6 - 帳號管理（管理員與編輯者）(P1)

### 故事目標
- 作為主管理員，我是系統的唯一最高權限擁有者，不能被其他管理員刪除，且系統中只能有一位主管理員。
- 作為普通管理員，我可以管理所有帳號（新增、編輯、刪除），包含姓名、密碼、郵箱、權限設定，但不能刪除主管理員。
- 作為管理員，我可以切換身份模擬其他角色（編輯者、分析師），以測試對應角色的功能權限。
- 作為管理員，我可以刪除其他普通管理員帳號，但需要經過7天的猶豫期，期間系統會發信通知被刪除的管理員。主管理員不能被刪除。
- 作為編輯者，我可以新增、修改、刪除帳號，但不能新增管理員角色，且無法切換身份。
- 作為分析師，我只能檢視帳號列表，不能新增、編輯、刪除任何帳號，但可以更新自己的帳號資訊（姓名、密碼、郵箱），且無法切換身份。
- 所有使用者都可以重新設定自己的密碼和透過郵箱重設忘記的密碼。

### 獨立測試標準
- 系統中只能有一位主管理員（is_super_admin=True），不能創建第二位主管理員。
- 主管理員不能被任何管理員刪除（包括自己），嘗試刪除時返回錯誤。
- 普通管理員可以新增/編輯/刪除所有角色帳號，包含普通管理員角色，但不能刪除主管理員。
- 管理員可以切換身份模擬編輯者或分析師，體驗對應角色的功能限制。
- 管理員刪除普通管理員時，會進入7天猶豫期，期間發送通知郵件給被刪除的管理員。
- 編輯者可以新增/編輯/刪除編輯者和分析師帳號，但無法新增管理員角色，且無法看到或使用身份切換功能。
- 分析師只能檢視帳號列表，無法新增/編輯/刪除任何帳號，但可以更新自己的帳號資訊，且無法看到或使用身份切換功能。
- 使用者可以透過郵箱接收密碼重設連結並成功重設密碼。
- 使用者可以重新設定自己的密碼（需提供舊密碼驗證）。

### 後端任務

- [ ] T061 [US6] 擴充 User 模型添加角色欄位於 backend/src/apps/auth/models.py
  - 添加 role 欄位（choices: 'admin', 'editor', 'analyst'），預設為 'editor'
  - 添加 is_super_admin 欄位（BooleanField, default=False, unique=True where is_super_admin=True，確保只有一位主管理員）
  - 添加 deletion_scheduled_at 欄位（DateTimeField, null=True, blank=True，用於7天猶豫期）
  - 添加 deletion_requested_by 欄位（ForeignKey to User, null=True，記錄刪除請求者）
  - 確保 first_name 和 last_name 欄位可用（Django User 已有）
  - 添加 email 唯一性驗證（如尚未存在）
  - 添加資料庫約束：透過 UniqueConstraint 或資料庫層級約束確保 is_super_admin=True 只能有一個
  - 創建並執行資料庫遷移

- [ ] T062 [US6] 創建帳號管理 ViewSet 於 backend/src/apps/auth/admin_views.py
  - 實現 UserAdminViewSet 繼承 ModelViewSet
  - 端點：GET /api/admin/users/（列表，支援搜尋/分頁）
  - 端點：POST /api/admin/users/（新增帳號）
  - 端點：GET /api/admin/users/{id}/（取得詳情）
  - 端點：PATCH /api/admin/users/{id}/（更新帳號）
  - 端點：DELETE /api/admin/users/{id}/（刪除帳號，管理員刪除管理員時進入猶豫期）
  - 自訂 action：POST /api/admin/users/{id}/cancel-deletion/（取消刪除，僅猶豫期內可用）
  - 實作權限檢查：管理員可操作所有人，編輯者不能新增管理員

- [ ] T063 [US6] 實現帳號權限檢查邏輯於 backend/src/apps/auth/admin_views.py
  - 在 create 方法中檢查：
    - 編輯者不能設定 role='admin'；分析師不能新增任何帳號
    - 如果嘗試創建 is_super_admin=True 的帳號，檢查是否已有主管理員，如有則拒絕
  - 在 update 方法中檢查：
    - 編輯者不能將現有帳號改為管理員；分析師只能更新自己的帳號
    - 不能將主管理員的 is_super_admin 改為 False（除非是將其他管理員改為主管理員，但需要先將現有主管理員改為普通管理員）
    - 不能同時設定多個帳號為 is_super_admin=True
  - 在 destroy 方法中檢查：
    - 分析師不能刪除任何帳號
    - 不能刪除主管理員（is_super_admin=True），返回明確錯誤（403 Forbidden）
    - 管理員刪除普通管理員時，不立即刪除，而是設定 deletion_scheduled_at = now() + 7 days
    - 管理員刪除非管理員帳號時，立即刪除（軟刪除或硬刪除）
  - 分析師更新自己帳號時，只能更新 name、email、password，不能修改 role
  - 返回明確的錯誤訊息（403 Forbidden）

- [ ] T064 [US6] 創建帳號序列化器於 backend/src/apps/auth/serializers.py
  - UserSerializer：用於列表和詳情（排除密碼欄位，包含 is_super_admin 標記）
  - UserCreateSerializer：用於新增（包含密碼，自動加密）
    - 驗證：如果 is_super_admin=True，檢查是否已有主管理員
  - UserUpdateSerializer：用於更新（可選更新密碼）
    - 驗證：修改 is_super_admin 時，確保唯一性約束
  - UserSelfUpdateSerializer：用於使用者更新自己的資訊（僅允許更新 name、email、password，不允許修改 role 和 is_super_admin）
  - 驗證：email 格式、密碼強度（至少 8 字元）、角色選擇、主管理員唯一性

- [ ] T065 [US6] 實現密碼重設請求端點於 backend/src/apps/auth/views.py
  - 端點：POST /api/auth/password-reset-request/
  - 接收 email，生成重設 token，發送郵件
  - 使用 Django 的 PasswordResetTokenGenerator
  - 返回成功訊息（不洩露 email 是否存在）

- [ ] T066 [US6] 實現密碼重設確認端點於 backend/src/apps/auth/views.py
  - 端點：POST /api/auth/password-reset-confirm/
  - 接收 token、email、新密碼
  - 驗證 token 有效性，更新密碼
  - 返回成功或錯誤訊息

- [ ] T067 [US6] 實現使用者自行重設密碼端點於 backend/src/apps/auth/views.py
  - 端點：POST /api/auth/change-password/
  - 需要 JWT 認證
  - 接收舊密碼、新密碼
  - 驗證舊密碼正確性，更新為新密碼
  - 返回成功或錯誤訊息

- [ ] T068 [US6] 配置郵件發送設定於 backend/src/pinelab/settings.py
  - 添加 EMAIL_BACKEND、EMAIL_HOST、EMAIL_PORT、EMAIL_USE_TLS 設定
  - 支援環境變數配置（EMAIL_HOST_USER、EMAIL_HOST_PASSWORD）
  - 開發環境可使用 console backend，生產環境使用 SMTP

- [ ] T069 [US6] 創建郵件模板於 backend/src/apps/auth/templates/emails/
  - password_reset.html：密碼重設郵件模板
    - 包含重設連結（包含 token）
    - 連結格式：{frontend_url}/admin-portal/reset-password?token={token}&email={email}
    - 提供清晰的使用說明
  - admin_deletion_notification.html：管理員刪除通知郵件模板
    - 包含刪除請求者資訊、刪除預定時間（7天後）
    - 包含取消刪除連結（包含取消 token）
    - 提醒被刪除的管理員在7天內聯繫系統管理員或取消刪除

- [ ] T070 [US6] 實現郵件發送服務於 backend/src/apps/auth/services.py
  - send_password_reset_email(email, token) 函數
  - send_admin_deletion_notification_email(user, requested_by, deletion_date) 函數
    - 發送管理員刪除通知郵件，包含刪除請求者、刪除預定時間、取消連結
  - 使用 Django 的 EmailMessage 發送 HTML 郵件
  - 處理發送失敗的情況

- [ ] T071 [US6] 添加帳號管理 URL 路由於 backend/src/apps/auth/admin_urls.py
  - 創建新檔案，定義 UserAdminViewSet 的 router
  - 添加自訂 action：PUT /api/admin/users/me/（更新自己的帳號資訊）
  - 添加自訂 action：POST /api/admin/users/{id}/impersonate/（切換身份，僅管理員可用）
  - 添加自訂 action：POST /api/admin/users/{id}/cancel-impersonation/（取消身份切換）
  - 添加自訂 action：POST /api/admin/users/{id}/cancel-deletion/（取消刪除，僅猶豫期內可用）
  - 在 backend/src/pinelab/urls.py 中包含此路由

### 前端任務

- [ ] T072 [P] [US6] 創建帳號管理列表頁於 frontend/src/app/admin-portal/users/page.tsx
  - 顯示帳號列表（姓名、郵箱、角色、主管理員標記、狀態、刪除預定時間）
  - 主管理員顯示特殊標記（例如「主管理員」徽章或圖標）
  - 支援搜尋（姓名、郵箱）、分頁
  - 添加「新增帳號」按鈕（僅管理員和編輯者可見，分析師不可見）
  - 每行有「編輯」和「刪除」按鈕（需權限檢查：分析師不可見）
  - 主管理員的「刪除」按鈕應禁用並顯示提示「主管理員不能被刪除」
  - 管理員刪除管理員時，顯示「刪除中（7天猶豫期）」標籤和「取消刪除」按鈕
  - 顯示刪除預定時間倒數計時
  - 分析師只能檢視列表，所有操作按鈕隱藏

- [ ] T073 [P] [US6] 創建帳號表單元件於 frontend/src/components/admin/users/UserForm.tsx
  - 表單欄位：姓名（first_name, last_name）、郵箱、密碼（新增時）、角色選擇、主管理員選項（僅管理員可見）
  - 主管理員選項：checkbox「設為主管理員」（僅在創建新管理員或編輯現有管理員時顯示）
  - 如果已有主管理員，顯示提示「系統已有主管理員，無法再設定主管理員」
  - 驗證：郵箱格式、密碼強度、必填欄位
  - 根據使用者角色隱藏/禁用角色選擇（編輯者不能選擇管理員）
  - 顯示載入狀態和錯誤訊息

- [ ] T074 [US6] 創建帳號新增/編輯頁面於 frontend/src/app/admin-portal/users/[id]/page.tsx
  - 使用 UserForm 元件
  - 處理新增和編輯模式
  - 成功後跳轉回列表頁

- [ ] T075 [P] [US6] 添加帳號管理 API 函數於 frontend/src/lib/admin-api.ts
  - adminGetUsers(params)：取得帳號列表
  - adminGetUser(id)：取得帳號詳情
  - adminCreateUser(data)：新增帳號（僅管理員和編輯者可用）
  - adminUpdateUser(id, data)：更新帳號（權限檢查：分析師只能更新自己的）
  - adminUpdateSelf(data)：更新自己的帳號資訊（所有角色可用，僅允許更新 name、email、password）
  - adminDeleteUser(id)：刪除帳號（僅管理員和編輯者可用，管理員刪除管理員時進入7天猶豫期）
  - adminCancelUserDeletion(id)：取消帳號刪除（僅猶豫期內可用）
  - adminImpersonateUser(id, role)：切換身份模擬其他角色（僅管理員可用）
  - adminCancelImpersonation()：取消身份切換（返回原始管理員身份）

- [ ] T076 [US6] 實現密碼重設請求頁面於 frontend/src/app/admin-portal/forgot-password/page.tsx
  - 表單：輸入郵箱
  - 提交後顯示成功訊息（不洩露郵箱是否存在）
  - 提供返回登入頁連結

- [ ] T077 [US6] 實現密碼重設確認頁面於 frontend/src/app/admin-portal/reset-password/page.tsx
  - 從 URL query 取得 token 和 email
  - 表單：新密碼、確認密碼
  - 驗證密碼強度和一致性
  - 提交後顯示成功訊息並導向登入頁

- [ ] T078 [US6] 實現個人帳號資訊管理頁面於 frontend/src/app/admin-portal/account/profile/page.tsx
  - 表單：姓名（first_name, last_name）、郵箱、密碼變更（可選）
  - 密碼變更區塊：舊密碼、新密碼、確認密碼（可選填）
  - 驗證：郵箱格式、舊密碼正確性（如變更密碼）、新密碼強度
  - 提交後顯示成功訊息
  - 分析師也可使用此頁面更新自己的資訊

- [ ] T079 [P] [US6] 添加密碼相關 API 函數於 frontend/src/lib/admin-api.ts
  - requestPasswordReset(email)：請求密碼重設
  - confirmPasswordReset(token, email, newPassword)：確認密碼重設
  - changePassword(oldPassword, newPassword)：變更密碼（需認證）

- [ ] T080 [US6] 在導航選單添加帳號管理入口於 frontend/src/components/admin/AdminLayout.tsx
  - 「帳號管理」選單項目：管理員和編輯者可見，分析師不可見
  - 添加「個人設定」選單項目（所有使用者可見）
  - 在個人設定中提供「變更密碼」和「編輯帳號資訊」連結
  - 「編輯帳號資訊」允許使用者更新自己的姓名、郵箱、密碼（分析師也可用）
  - 添加「身份切換」選單項目（僅管理員可見，顯示當前身份和切換選項）
  - 身份切換時，在頁面頂部顯示身份切換提示橫幅，並提供「取消切換」按鈕
  - 身份切換後，UI 和功能權限對應切換後的角色

- [ ] T081 [US6] 在登入頁添加「忘記密碼」連結於 frontend/src/app/admin-portal/login/page.tsx
  - 連結指向 /admin-portal/forgot-password
  - 樣式與登入表單一致

- [ ] T082 [US6] 實現身份切換功能頁面於 frontend/src/app/admin-portal/users/impersonate/page.tsx
  - 顯示當前身份切換狀態（如果正在模擬其他角色）
  - 提供身份切換下拉選單（編輯者、分析師），僅管理員可見
  - 選擇角色後切換身份，更新全域 auth context
  - 顯示「取消身份切換」按鈕，返回原始管理員身份
  - 身份切換時顯示醒目的提示橫幅

- [ ] T083 [US6] 實現管理員刪除猶豫期處理邏輯於 backend/src/apps/auth/admin_views.py
  - 創建 Celery 定時任務或 Django management command
  - 檢查 deletion_scheduled_at 已過期且未取消的帳號
  - 執行實際刪除操作（軟刪除或硬刪除）
  - 記錄刪除操作日誌
  - 可選：在刪除前再次發送最後提醒郵件

- [ ] T084 [US6] 實現取消刪除功能於 backend/src/apps/auth/admin_views.py
  - 端點：POST /api/admin/users/{id}/cancel-deletion/
  - 檢查 deletion_scheduled_at 是否在猶豫期內（7天內）
  - 清除 deletion_scheduled_at 欄位
  - 發送取消刪除通知郵件給被刪除的管理員
  - 返回成功訊息

- [ ] T085 [US6] 實現身份切換功能於 backend/src/apps/auth/admin_views.py
  - 端點：POST /api/admin/users/{id}/impersonate/
  - 檢查請求者是否為管理員
  - 檢查目標使用者是否存在且非管理員（管理員不能模擬管理員）
  - 在 JWT token 中添加 impersonate_role 和 original_user_id
  - 返回新的 token 和切換後的身份資訊
  - 端點：POST /api/admin/users/cancel-impersonation/
  - 清除 impersonate_role，返回原始管理員 token

驗收標準（可獨立驗證）：
- 系統中只能有一位主管理員，嘗試創建第二位主管理員時會顯示錯誤。
- 主管理員不能被任何管理員刪除（包括自己），刪除按鈕禁用並顯示提示訊息。
- 普通管理員可以新增/編輯/刪除所有角色帳號（除主管理員外）。
- 管理員可以切換身份模擬編輯者或分析師，體驗對應角色的功能限制，並可隨時取消切換。
- 管理員刪除普通管理員時，系統進入7天猶豫期，立即發送通知郵件給被刪除的管理員，包含取消連結。
- 猶豫期內可以取消刪除，取消後發送通知郵件。
- 7天後自動執行刪除（如果未取消）。
- 編輯者可以新增/編輯/刪除編輯者和分析師帳號，但無法新增管理員角色（UI 禁用並顯示提示），且無法看到或使用身份切換功能。
- 分析師只能檢視帳號列表，無法看到新增/編輯/刪除按鈕，但可以在個人設定中更新自己的帳號資訊（姓名、郵箱、密碼），且無法看到或使用身份切換功能。
- 使用者可以透過郵箱接收密碼重設連結並成功重設密碼。
- 使用者登入後可以在個人設定中重新設定自己的密碼和更新帳號資訊。
- 所有表單都有適當的驗證和錯誤提示。
- 帳號列表中清楚標示主管理員，與普通管理員區分。

---

## 依賴與順序
- 故事順序：US1 → US2 →（US3 與 US4 並行）→ US5 → Dashboard/RBAC → Polish → 分類分組顯示 → 拖移排序 → 商品分類與標籤管理 → US6（帳號管理）
- 第 11 階段（分類分組顯示）可在 US2 完成後進行
- 第 12 階段（拖移排序）建議在第 11 階段完成後進行，或可並行開發
- 第 13 階段（商品分類與標籤管理）可在 US2 完成後進行，與其他階段可並行
- 第 14 階段（帳號管理）建議在第 9 階段（RBAC）完成後進行，因為需要角色權限檢查

## 並行建議
- T019/T020/T023 可並行（不同檔案層）。
- US3 與 US4 可在 US2 完成後並行。
- T043 和 T044 可並行開發。
- T045、T046、T047 可並行開發（不同的拖移排序場景）。
- T051 可獨立開發（商品表單功能）。
- T052 和 T053 可並行開發（不同的批量操作場景）。
- T054 和 T055 可並行開發（不同的批量更新 API）。
- T072、T073、T075 可並行開發（前端不同元件）。
- T076、T077、T078 可並行開發（不同的密碼相關頁面）。

## MVP 建議
- 僅涵蓋 US1（登入與存取控制）+ US2（商品基本 CRUD 與圖片上傳）。
- 分類分組顯示和拖移排序功能為增強功能，可在 MVP 後續版本中實現。
- 帳號管理功能（US6）建議在 MVP 後續版本中實現，但可與其他功能並行開發。
