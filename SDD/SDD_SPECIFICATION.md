# 松果創意官方網站 Pinelab SDD 規格文件

> **架構導向：** 前後端分離、模組化、可測試  
> **技術棧：** React (Next.js) + Django REST + FastAPI + PostgreSQL  
> **部署：** Docker Compose on Zeabur  
> **版本控制：** GitHub  
> **方法論：** Specification-Driven Development (SDD)

---

## 🧩 系統核心理念

1. **模組化 (Modular)**  
   - 每個模組只負責單一領域（SRP 原則）  
   - 可獨立開發、部署、測試  

2. **簡單化 (Simplicity)**  
   - 清晰的資料流：Next.js → Django REST / FastAPI → PostgreSQL  
   - 統一 API 規範與命名規則  
   - Docker Compose 管理所有服務  

3. **可測試 (Testable)**  
   - 每個模組需有明確的「行為規格 (Behavior Spec)」  
   - 前端與後端皆需具備自動化測試（Jest、Pytest）  
   - CI/CD pipeline 自動執行測試後才能部署  

---

## ⚙️ 核心模組結構

| 模組 | 技術 | 職責 | 可測試項目 |
|------|------|------|------------|
| **frontend** | Next.js (React + TypeScript) | 使用者介面、API 請求、SEO | ✅ 頁面渲染測試<br>✅ API 回應模擬<br>✅ 使用者流程測試 |
| **backend** | Django REST Framework | 主系統（Auth、Order、Payment、Admin） | ✅ 單元測試（Model、View、Serializer）<br>✅ API 端點測試 |
| **service** | FastAPI | 高效微服務（AI、推薦、分析） | ✅ API schema 驗證<br>✅ 模型推論測試 |
| **db** | PostgreSQL | 儲存層 | ✅ Schema migration 測試<br>✅ 數據一致性測試 |
| **infra** | Docker Compose + Zeabur | 容器編排與部署 | ✅ Container health check<br>✅ CI/CD workflow 驗證 |

---

## 🧠 模組細化規格

### 1️⃣ Auth 模組（Django）
**功能：**
- 使用者註冊、登入、登出
- JWT 驗證機制
- 權限控制（Admin / User）

**可測試規範：**
- [x] POST `/api/auth/register/` → 建立新使用者  
- [x] POST `/api/auth/login/` → 成功返回 JWT Token  
- [x] GET `/api/users/me/` → Token 驗證正確時回傳個資  
- [x] 未帶 Token 時回傳 401 Unauthorized  

---

### 2️⃣ Product 模組（Django）
**功能：**
- 商品 CRUD、上傳圖片、分類標籤  
- 列表查詢與搜尋  

**可測試規範：**
- [x] GET `/api/products/` → 回傳商品清單  
- [x] POST `/api/products/`（Admin）→ 成功建立商品  
- [x] PATCH `/api/products/{id}/` → 修改商品資訊  
- [x] 權限錯誤回傳 403  

---

### 3️⃣ Order 模組（Django）
**功能：**
- 建立訂單、金流整合（ECPay / Stripe）  
- 查詢歷史訂單  

**可測試規範：**
- [x] POST `/api/orders/` → 建立訂單成功  
- [x] 回傳正確金流連結（redirect_url）  
- [x] 支付完成後，訂單狀態更新為 "paid"  
- [x] 未登入使用者下單 → 回傳 401  

---

### 4️⃣ AI / Recommendation 模組（FastAPI）
**功能：**
- 根據使用者當下頁面推薦商品  
- 可擴展 AI 內容生成功能  

**可測試規範：**
- [x] POST `/api/recommendations/` → 回傳商品 ID 陣列  
- [x] 輸入不完整 → 回傳 422  
- [x] 響應時間 < 500ms（負載測試）  

---

### 5️⃣ Database 模組（PostgreSQL）
**功能：**
- 儲存所有模組資料（users, products, orders, logs）  

**可測試規範：**
- [x] Migration 正確執行  
- [x] FK 與 constraint 正常  
- [x] JSONB 欄位可查詢  
- [x] Transaction rollback 正常  

---

## 🧪 測試策略

| 類型 | 工具 | 說明 |
|------|------|------|
| 前端單元測試 | **Jest + React Testing Library** | 按鈕互動、API 呼叫模擬 |
| 後端單元測試 | **Pytest + Django Test Client** | API 回應驗證、資料庫寫入 |
| 整合測試 | **Docker Compose + Test Containers** | 多服務整合測試 |
| CI/CD 測試 | **GitHub Actions** | Push 時自動測試與部署 |
| 壓力測試 | **Locust / k6** | FastAPI 性能與延遲監控 |

---
規格建立日期:2025/11/03 09:50

