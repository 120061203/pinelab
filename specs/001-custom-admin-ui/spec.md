# Feature Specification: 自訂後台前端介面（Admin Portal）

**Feature Branch**: `001-custom-admin-ui`  
**Created**: 2025-11-03  
**Status**: Draft  
**Input**: User description: "我不想用django的管理後台 而是為這個網站建立專用後台的前端介面"

## User Scenarios & Testing (mandatory)

### User Story 1 - 登入與存取控制 (Priority: P1)
- 作為管理員，我可以使用帳號密碼登入專用後台，成功後看到首頁儀表板。
- 為何此優先: 沒有登入無法存取任何管理功能，為所有流程前置條件。
- 獨立測試: 以有效/無效憑證嘗試登入；未登入訪問受保護頁面會被導向登入頁。
- 驗收情境：
  1. Given 未登入，When 訪問 /admin-portal/products，Then 導向 /admin-portal/login。
  2. Given 管理員帳密正確，When 提交登入，Then 進入儀表板並顯示使用者資訊。

### User Story 2 - 商品管理 (Priority: P1)
- 作為管理員，我可以在後台建立/編輯/刪除商品，包含名稱、描述、價格、分類、標籤、圖片排序與主圖設定。
- 為何此優先: 是網站核心內容管理需求。
- 獨立測試: 建立商品後可於前台/公開 API 查得；編輯與刪除回應正確，表單驗證錯誤可視化顯示。
- 驗收情境：
  1. Given 空白表單，When 按儲存，Then 顯示必填欄位提示。
  2. Given 完整有效資料，When 儲存，Then 顯示成功訊息並於列表可見。
  3. Given 已有多張圖片，When 調整 sort_order 與 is_primary，Then 顯示順序更新且主圖唯一。

### User Story 3 - 分類與標籤管理 (Priority: P2)
- 作為管理員，我可以 CRUD 分類與標籤，分類支援排序值，刪除時若關聯商品須阻擋或提示替代動作。
- 獨立測試: 建立/修改/刪除操作得到正確提示；被關聯的分類刪除時返回可理解的錯誤。

### User Story 4 - 聯絡表單管理 (Priority: P2)
- 作為管理員，我可以在後台瀏覽訪客聯絡表單、搜尋/篩選、標記已讀/未讀。
- 獨立測試: 列表分頁正確；標記已讀後可查詢到狀態變化。

### User Story 5 - 清單瀏覽、搜尋、篩選、排序 (Priority: P3)
- 作為管理員，我可在各管理清單使用關鍵字搜尋、依分類/標籤/價格區間篩選、依更新時間/排序值等排序。
- 獨立測試: 操作後 URL 查詢參數同步；重新整理維持狀態。

### Edge Cases
- 連線中斷或 API 失敗時呈現可重試的錯誤 UI。
- 權杖過期時自動登出並跳回登入頁；保留返回原頁的導向。
- 圖片 URL 無效或無法載入時提供佔位圖並允許更正。

## Requirements (mandatory)

### Functional Requirements
- FR-001: 後台需提供登入頁、登出功能、權杖保存與逾期處理（自動刷新或重新登入流程）。
- FR-002: 受保護頁面未登入時必須導向登入頁（路由保護）。
- FR-003: 提供商品 CRUD 介面，欄位含 name/slug/description/price/sort_order/category/tags/is_active、圖片列表（sort_order/is_primary）。
- FR-004: 提供圖片管理（新增、刪除、排序、主圖設定），支援輸入相對路徑/完整 URL，並支援「檔案直傳」將上傳檔案複製到對應產品目錄。
- FR-005: 提供分類 CRUD（含排序值）與刪除保護（若被商品使用則阻擋並提示）。
- FR-006: 提供標籤 CRUD。
- FR-007: 提供聯絡表單列表、細節檢視、標記已讀/未讀、分頁/搜尋/排序。
- FR-008: 清單頁支援搜尋、篩選（分類、標籤、價格區間）、排序（更新時間/排序值）。
- FR-009: 表單需有即時驗證與錯誤提示；提交期間顯示 loading 或 disabled 狀態。
- FR-010: 所有成功/失敗行為需顯示標準化提醒（toast/alert）。
- FR-011: 全站一致的導航（側邊欄/頂部列）、麵包屑與返回連結。
- FR-012: 響應式布局（桌機≥1024、平板≥768、手機＜768）。
- FR-013: 存取控制：只有 is_staff 管理員能登入並使用後台功能。
- FR-014: 審計需求：重要操作（建立/刪除）需有可追溯紀錄（前端至少顯示結果與操作人/時間）。
- FR-015: 錯誤情境需提供使用者可理解的訊息與重試按鈕。
- FR-016: 會話逾時或權杖失效時，需引導重新登入且不丟失原工作流程。
- FR-017: 支援基本的可用性：鍵盤操作、焦點樣式、表單可達性標籤。
- FR-018: 國際化可拓展（文案集中管理，預設繁中）。
- FR-019: 導航項目：Dashboard、Products、Categories、Tags、Contacts、Account。
- FR-020: Dashboard 顯示關鍵統計（商品數、分類數、未讀聯絡數、最近更新）。
- FR-021: 角色/權限（RBAC）：
  - 管理員（Admin）：擁有所有權限；可新增/管理其他管理帳號；可編輯內容；可檢視分析。
  - 編輯（Editor）：可新增/修改/刪除/更新內容；不可管理使用者；可檢視分析。
  - 分析師（Analyst）：僅可檢視圖表與報表；不可新增/修改/刪除/更新內容。
- FR-022: 依角色過濾導覽與操作：對無權限的路由/按鈕應隱藏或禁用並提示不足權限。
- FR-023: 重要操作需二次確認（刪除/大量變更），並記錄操作人與時間於操作日誌。
- FR-024: 檔案直傳：
  - 支援拖放/選檔；顯示上傳進度、成功/失敗提示。
  - 成功後回傳可存取的相對路徑供商品圖片綁定（例如 /media/products/{id}/file.jpg）。
  - 檔案大小與格式限制：單檔 ≤ 5MB；允許 jpg/jpeg/png/webp；超限時明確錯誤訊息。
  - 同批多檔上傳，保持使用者設定之 sort_order 與 is_primary。

### Dashboard Metrics（新增）
- 內容總覽：商品總數、分類總數、標籤總數、未讀聯絡數。
- 趨勢圖（最近 30 天）：
  - 商品建立數（每日）
  - 聯絡表單提交數（每日）
- 內容健康度：
  - 無圖片商品數與比例
  - 未分類商品數與比例
  - 標籤覆蓋率（有至少一個標籤的商品比例）

### Key Entities
- AdminSession（登入狀態/權杖、逾期時間、角色）
- Product（核心欄位、關聯 Category/Tag、Images）
- Category、Tag（字典資料）
- Contact（唯讀管理、狀態 is_read）

## Success Criteria (mandatory)
### Measurable Outcomes
- SC-001: 管理員首次登入到完成建立一筆商品 ≤ 2 分鐘，錯誤率 < 5%。
- SC-002: 清單頁搜尋/篩選/排序回應時間 P95 < 1 秒（資料量 1k 條內）。
- SC-003: 權杖逾期再登入流程成功率 ≥ 99%。
- SC-004: 後台核心路由（登入、商品列表、商品編輯）E2E 測試通過率 100%。

## Assumptions
- 使用既有後端 API 權限（JWT），不再使用 Django admin。
- 後台路由前綴為 `/admin-portal/*`，與公開網站分離。
- 角色採 RBAC（三種角色），依 Clarifications 定義權限。

## Clarifications
### Session 2025-11-03
- Q: 是否需要角色/權限細分？ → A: 需要：管理員、編輯、分析師。
  - 管理員：所有權限、可新增管理員、可編輯、可檢視分析。
  - 編輯：可新增/修改/刪除/更新內容；不可管理使用者；可見分析。
  - 分析師：僅可檢視圖表報表；不可新增/修改/刪除/更新內容。
- Q: 圖片是否支援檔案直傳？ → A: 支援檔案直傳，並將檔案複製至對應儲存位置（產品目錄）。
- Q: 是否需要 Dashboard 圖表與 KPI？ → A: 需要圖表；KPI 由大多數資料表欄位計算（見下列 FR 與 Success Criteria）。

### Updates Applied
- Functional Requirements 增補 RBAC（FR-021~FR-023）與檔案直傳（FR-004 擴充、FR-024）。
- User Stories：登入與導覽維持不變；商品圖片支持檔案直傳。
- Entities：AdminSession 加入角色資訊；Dashboard 新增度量說明。
