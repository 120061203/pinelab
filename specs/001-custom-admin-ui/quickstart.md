# Quickstart: Admin Portal（自訂後台）

## 前置條件
- 後端服務已啟動：`cd infra && docker-compose up -d`
- 有管理員帳號可登入（見 `ADMIN_LOGIN.md`）

## 啟動開發
- 前端（Next.js）：`cd frontend && npm run dev`
- 後端 API：`http://localhost:8000/api`
- 後台路由預設：`http://localhost:3000/admin-portal`

## 環境變數（前端）
- `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api`
- 管理端 Token 由登入流程取得並儲存在前端（建議安全儲存）

## 檔案直傳測試
1. 於後台 Products 編輯頁選擇檔案或拖放上傳。
2. 成功後回傳相對路徑，圖片列表可見並可調整排序/主圖。

## Dashboard 測試
- 造資料：建立一些商品與聯絡表單。
- 開啟 `/admin-portal/dashboard` 檢查總覽、趨勢、健康度是否顯示。

## 常見問題
- 無法登入：確認管理員帳號、Token 是否過期。
- 上傳失敗：檢查大小（≤5MB）與格式（jpg/jpeg/png/webp），查看後端日誌。
- 無資料圖表：新增商品或提交聯絡表單後重整。
