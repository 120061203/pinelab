# 技術研究與決策：松果創意 Pinelab 企業官網

**建立日期**: 2025-11-03  
**狀態**: 已完成  
**基礎文件**: SDD/TECHNICAL_DECISIONS.md

## 概述

本文件整合並記錄所有技術決策，這些決策已在 SDD 技術決策文件中經過 Senior Engineer 審查。所有決策都基於最佳實踐和專案需求。

---

## 1. API 設計規範

### 決策：採用 RESTful API 設計，使用清晰的端點命名

**決策**: 
- 公開端點：`GET /api/products/`, `GET /api/categories/`, `GET /api/tags/`
- 管理端點：統一使用 `/api/admin/` 前綴
- Auth 端點：`/api/auth/` 前綴

**理由**: 
- 清晰的命名規範有助於維護與擴展
- `/api/admin/` 前綴明確區分管理與公開端點
- 符合 RESTful 設計原則，業界標準

**替代方案考慮**: 
- GraphQL：考慮過但被拒絕，因為 RESTful 更簡單，符合 MVP 階段需求
- 混合路由：考慮過但被拒絕，統一前綴更易維護

---

## 2. API 回應格式標準

### 決策：採用統一的 JSON 回應格式

**決策**:
```json
{
  "status": "success",
  "data": { ... }
}
```

錯誤回應：
```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "錯誤訊息",
  "errors": { ... }
}
```

**理由**: 
- 統一的回應格式便於前端處理
- 明確的錯誤碼有助於除錯與問題追蹤
- 符合業界最佳實踐

**替代方案考慮**: 
- 直接返回資料：考慮過但被拒絕，統一格式更易錯誤處理
- 自訂格式：考慮過但被拒絕，標準格式降低學習成本

---

## 3. 安全性設計

### 決策：使用 HMAC-SHA256 簽章（建議升級自 MD5）

**決策**: 
使用 HMAC-SHA256 替代 MD5 進行 API 請求簽章驗證。

**理由**: 
- MD5 已存在碰撞漏洞，不適合安全應用
- HMAC-SHA256 是業界標準，更安全可靠
- Django 內建支援，實作成本低

**實作方式**:
```python
import hmac
import hashlib

def generate_signature(params, secret_key):
    sorted_params = sorted(params.items())
    query_string = '&'.join([f"{k}={v}" for k, v in sorted_params])
    query_string += f"&key={secret_key}"
    signature = hmac.new(
        secret_key.encode(),
        query_string.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature
```

**替代方案考慮**: 
- MD5：原始規格使用，但安全性不足
- OAuth2：考慮過但過於複雜，不適合 MVP
- JWT 簽章：已在 JWT token 中使用，API 請求簽章使用 HMAC-SHA256

### 決策：JWT Token 設定

**決策**: 
- Access Token 過期時間：24 小時
- Algorithm: HS256
- MVP 階段不實作 Refresh Token（簡化實作）

**理由**: 
- 24 小時過期時間平衡安全性與使用者體驗
- MVP 階段不需 refresh token，簡化實作成本
- 未來可擴充 refresh token 機制

**替代方案考慮**: 
- 更短的過期時間（如 1 小時）：考慮過但會影響使用者體驗
- Refresh token：考慮過但 MVP 階段不必要

---

## 4. 資料庫設計

### 決策：關聯關係設計

**決策**:
- Product ↔ Category：一對多（一個商品屬於一個分類）
- Product ↔ Tag：多對多（一個商品可有多個標籤）
- Product ↔ ProductImage：一對多（一個商品有多張圖片）

**理由**: 
- 簡化初期實作（Category 一對多比多對多更簡單）
- Tag 多對多符合標籤的靈活特性
- 未來可擴充至多分類（如需要）

**替代方案考慮**: 
- Category 多對多：考慮過但增加複雜度，初期不需要
- Tag 一對多：考慮過但不符合標籤使用場景

### 決策：資料表 Schema 設計

**決策**: 
採用 PostgreSQL，包含以下關鍵設計：
- 使用 `slug` 欄位支援 SEO 友善 URL
- `sort_order` 使用整數，預設 0（數字越大越優先）
- `is_active` 軟刪除機制（保留資料，僅隱藏）
- `ON DELETE SET NULL`（分類刪除時，商品分類設為 NULL）
- `ON DELETE CASCADE`（商品刪除時，圖片與標籤關聯一併刪除）

**理由**: 
- Slug 提升 SEO 和 URL 可讀性
- 軟刪除機制保護資料完整性
- 適當的外鍵約束確保資料一致性

**替代方案考慮**: 
- 硬刪除：考慮過但資料遺失風險高
- 不使用 slug：考慮過但影響 SEO

---

## 5. 商品排序邏輯

### 決策：雙層排序機制

**決策**: 
排序優先級：
1. `sort_order` DESC（數字越大越前）
2. 若 `sort_order` 相同，則 `updated_at` DESC（最新在前）

**理由**: 
- `sort_order` 為 0 時，自動依 `updated_at` 排序
- 管理員可透過調整 `sort_order` 控制顯示順序
- 提供靈活性同時保持預設行為

**替代方案考慮**: 
- 僅使用 sort_order：考慮過但缺乏預設排序機制
- 僅使用 updated_at：考慮過但無法手動控制

---

## 6. 圖片處理

### 決策：圖片上傳與儲存策略

**決策**: 
- 允許格式：`jpg, jpeg, png, webp`
- 單檔大小上限：5MB
- 儲存位置：本地檔案系統 `media/products/{product_id}/`
- 驗證機制：副檔名 + 檔案大小 + MIME type

**理由**: 
- 5MB 限制平衡品質與效能
- 本地儲存簡化 MVP 實作
- 多重驗證確保安全性

**替代方案考慮**: 
- 雲端儲存（S3, Cloudinary）：考慮過但延後至未來階段
- 更大的檔案限制：考慮過但影響效能
- 僅副檔名驗證：考慮過但不安全

---

## 7. 分類/標籤刪除策略

### 決策：保護性刪除策略

**決策**: 
- 分類刪除：若有商品使用該分類 → 不允許刪除（回傳 400 錯誤）
- 標籤刪除：允許刪除（CASCADE 自動移除關聯），但提供警告

**理由**: 
- 分類是核心屬性，需保護資料完整性
- 標籤較彈性，允許刪除不影響商品本身
- 明確的錯誤訊息幫助管理員理解問題

**替代方案考慮**: 
- 強制刪除所有關聯商品：考慮過但資料遺失風險高
- 自動遷移至預設分類：考慮過但可能不符合管理員意圖

---

## 8. 環境變數配置

### 決策：完整的環境變數清單

**決策**: 
必需環境變數：
```
SECRET_KEY=...
DEBUG=True
DATABASE_URL=...
API_SECRET_KEY=...  # 用於 HMAC-SHA256 簽章
JWT_SECRET_KEY=...
MEDIA_ROOT=/app/media
MEDIA_URL=/media/
CORS_ALLOWED_ORIGINS=...
```

**理由**: 
- 明確的環境變數配置便於部署與維護
- 分離敏感資訊與程式碼
- 符合 12-Factor App 原則

---

## 9. 分頁設定

### 決策：分頁預設值

**決策**: 
- 每頁筆數：20
- 最大筆數：100（防止大量查詢）

**理由**: 
- 20 筆平衡載入速度與使用者體驗
- 100 筆上限防止性能問題
- 符合常見 Web 應用最佳實踐

**替代方案考慮**: 
- 更大的預設值：考慮過但影響載入速度
- 無上限：考慮過但安全風險高

---

## 總結

所有技術決策都基於：
1. **簡化原則**：選擇最簡單但有效的解決方案
2. **安全性**：優先考慮安全性（如 HMAC-SHA256）
3. **可擴充性**：設計允許未來擴充（如雲端儲存、Refresh Token）
4. **業界標準**：採用業界認可的最佳實踐

所有決策已記錄在 `SDD/TECHNICAL_DECISIONS.md` 中，並經過 Senior Engineer 審查。

**無需要澄清的項目**：所有技術決策都已明確，可以直接進入 Phase 1 設計階段。

