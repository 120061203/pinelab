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
| **backend** | Django REST Framework | 主系統（Auth、Product、Contact、Admin） | ✅ 單元測試（Model、View、Serializer）<br>✅ API 端點測試 |
| **db** | PostgreSQL | 儲存層 | ✅ Schema migration 測試<br>✅ 數據一致性測試 |
| **infra** | Docker Compose + Zeabur | 容器編排與部署 | ✅ Container health check<br>✅ CI/CD workflow 驗證 |

---
核心目標：
- 提供品牌形象頁面（首頁、聯絡我們）  
- 商品展示
- 篩選、分類、搜尋商品  
- 支援 RWD（桌機 / 手機自適應）  
- 前端優先開發，並以產品頁面為 MVP 起點

**MVP 階段說明：**
- ✅ 需要後端 API（Django）
- ✅ 需要 Auth 功能（僅管理員後台，不需使用者後台）
- ❌ 暫時不需要 AI 推薦功能
- ✅ 前端使用 Mock 資料進行開發
- ✅ 所有 API 請求需實作 MD5 簽章驗證（不含登入/註冊端點）  
---
## 🧠 模組細化規格

### 1️⃣ Auth 模組（Django）
**功能：**
- 管理員登入、登出
- JWT 驗證機制
- 權限控制（僅 Admin 後台使用）

**注意事項：**
- ❌ MVP 階段不需要使用者註冊/登入功能
- ✅ 僅提供管理員後台認證功能

**可測試規範：**
- [x] POST `/api/auth/login/` → 成功返回 JWT Token（管理員）  
- [x] GET `/api/users/me/` → Token 驗證正確時回傳管理員個資  
- [x] 未帶 Token 時回傳 401 Unauthorized  
- [x] 登入/註冊端點不需 MD5 簽章驗證  

---

### 2️⃣ Product 模組（Django）
**功能：**
- 商品 CRUD、上傳圖片、分類標籤  
- 列表查詢與搜尋
- **分類管理**：分類可在後台管理（CRUD）
- **價格篩選**：支援自由輸入價格區間（min_price, max_price）

**可測試規範：**
- [x] GET `/api/products/` → 回傳商品清單（支援分類、價格區間、關鍵字搜尋）  
- [x] GET `/api/products/{id}/` → 回傳單一商品詳情
- [x] POST `/api/products/`（Admin）→ 成功建立商品  
- [x] PATCH `/api/products/{id}/` → 修改商品資訊  
- [x] GET `/api/categories/` → 回傳所有分類列表（後台可管理）
- [x] 權限錯誤回傳 403  
- [x] 所有端點需包含 MD5 簽章驗證（GET `/api/products/` 公開端點除外）  

---


### 3️⃣ Contact 模組（Django）
**功能：**
- 接收聯絡表單資料並儲存至資料庫
- 表單欄位：姓名、Email、訊息內容

**可測試規範：**
- [x] POST `/api/contact/` → 成功儲存聯絡表單  
- [x] 必填欄位驗證（姓名、Email、訊息內容）  
- [x] Email 格式驗證  
- [x] 成功回傳 201 Created  
- [x] 需包含 MD5 簽章驗證

---

### 4️⃣ AI / Recommendation 模組（FastAPI）
**狀態：** ❌ MVP 階段暫不實作，未來擴充功能  

**功能：**
- 根據使用者當下頁面推薦商品  
- 可擴展 AI 內容生成功能  

**可測試規範：**
- [ ] POST `/api/recommendations/` → 回傳商品 ID 陣列  
- [ ] 輸入不完整 → 回傳 422  
- [ ] 響應時間 < 500ms（負載測試）  

---

### 5️⃣ Database 模組（PostgreSQL）
**功能：**
- 儲存所有模組資料（users, products, contacts, categories）

**資料表結構：**
- `users` - 使用者（僅管理員）
- `products` - 商品
- `categories` - 商品分類（後台可管理）
- `contacts` - 聯絡表單資料
- ❌ `orders` - 已移除（不需訂單功能）

**可測試規範：**
- [x] Migration 正確執行  
- [x] FK 與 constraint 正常  
- [x] JSONB 欄位可查詢  
- [x] Transaction rollback 正常

---


## 🧩 前端頁面規格

### 1️⃣ 首頁（`/`）
- Hero 區塊（品牌介紹）  
- 最新商品展示（最多 6 筆）  
- 導向「商品頁」按鈕  
- Footer：公司資訊、社群連結  

**RWD 行為：**
- 手機版採垂直堆疊布局  
- 圖片自適應縮放  

---

### 2️⃣ 聯絡我們（`/contact`）
- 聯絡表單欄位：
  - 姓名（必填）
  - Email（必填，需驗證格式）
  - 訊息內容（必填）
- 表單送出後回傳成功提示  
- 送出資料會呼叫 `POST /api/contact/` 儲存（需包含 MD5 簽章）

**API 對應：**
| Method | Endpoint | 功能 |
|--------|-----------|------|
| POST | `/api/contact/` | 提交聯絡表單（需 MD5 簽章驗證） |

**RWD 行為：**
- 表單單欄式布局  
- 手機螢幕下自動縮排  

---

### 3️⃣ 商品頁（`/products`）
- 商品清單（圖片 / 名稱 / 價格）  
- 篩選條件：
  - 分類（Category）- 從後台管理的分類中選擇
  - 價格區間（Price Range）- 可自由輸入最小/最大價格
  - 搜尋（關鍵字查詢）
- 支援分頁顯示  
- 點擊商品導向 `/products/[id]`

**API 對應：**
| Method | Endpoint | 功能 |
|--------|-----------|------|
| GET | `/api/products/` | 取得商品清單，可帶篩選參數（category, min_price, max_price, search） |
| GET | `/api/products/{id}/` | 取得單一商品詳情 |
| GET | `/api/categories/` | 取得所有分類列表 |

**RWD 行為：**
- 桌機 4 欄、平板 2 欄、手機 1 欄  
- Filter bar 可摺疊

---

### 4️⃣ 商品詳情頁（`/products/[id]`）
- 完整商品資訊：圖片、名稱、價格、分類、標籤、詳細描述  
- 相關商品推薦區塊（推薦同標籤與分類的商品）
- 導回商品列表按鈕

**API 對應：**
| Method | Endpoint | 功能 |
|--------|-----------|------|
| GET | `/api/products/{id}/` | 取得單一商品詳情 |
| GET | `/api/products/?category={category}&tags={tags}` | 取得相關商品（同分類與標籤） |

**注意事項：**
- MVP 階段相關商品推薦可使用前端邏輯實作（不需 AI 推薦服務）
- 前端使用 Mock 資料時，相關商品可從同分類商品中隨機選取

**RWD 行為：**
- 手機版圖片與資訊垂直堆疊  
- 相關商品區塊響應式網格布局  


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
---

## 🔐 API 安全規範

### MD5 簽章驗證
- ✅ 所有 API 請求需實作 MD5 簽章驗證（詳見 `API_spec.md`）
- ❌ 登入/註冊端點（`POST /api/auth/login/`）不需 MD5 簽章
- ✅ 前端需在所有 API 請求中實作簽章生成邏輯

### 前端 Mock 資料
- MVP 階段前端可使用 Mock 資料進行開發
- Mock 資料格式需符合後端 API 回應格式，以便後續整合

---

規格建立日期:2025/11/03 10:13  
最後更新日期:2025/11/03 10:30

