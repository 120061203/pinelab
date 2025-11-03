# Research: 自訂後台前端介面（Admin Portal）

**Date**: 2025-11-03  
**Scope**: RBAC（Admin/Editor/Analyst）、圖片檔案直傳、Dashboard 指標

## Decisions

1) RBAC 模型
- Decision: 採三角色 RBAC（Admin/Editor/Analyst），前端路由守衛與 UI 控制，後端以 JWT claim/權限驗證。
- Rationale: 與現有單一管理員擴充相容，易於前端導覽/按鈕級別權限控制。
- Alternatives: 細粒度資源型 ACL（複雜度高，超出當前需求）。

2) 圖片檔案直傳
- Decision: 前端支援拖放/選檔，呼叫管理 API 直傳；後端將檔案存於 /media/products/{id}/，回傳可用相對路徑。
- Rationale: 與現有媒體架構一致；最小變更即可交付。
- Alternatives: 直傳雲端（S3、GCS），需額外雲端配置與憑證管理（後續可擴充）。

3) Dashboard 指標
- Decision: 採用內容總覽 + 30 天趨勢 + 內容健康度三區塊（商品、分類、標籤、聯絡；商品/聯絡趨勢；無圖片/未分類/標籤覆蓋率）。
- Rationale: 與資料表可得欄位吻合，直接可量測；可逐步擴充。
- Alternatives: 寫入行為分析（事件追蹤），需前端事件管線，非當前必要。

## Best Practices
- RBAC：前端以 route-level + component-level guard；權限來源統一於 auth context；避免在多處分支判斷。
- 上傳：限制大小與格式；顯示進度；失敗可重試；成功後 cache busting（附加查詢參數）。
- Dashboard：懶載入圖表；空資料顯示佔位與引導；時間區間可切換但預設 30 天。

## Open Items
- 無（已由使用者澄清）。
