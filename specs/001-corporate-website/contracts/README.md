# API 合約文件

本目錄包含 Pinelab 企業官網的 API 規範文件。

## 文件結構

- `openapi.yaml` - OpenAPI 3.0 規範，定義所有 API 端點
- `README.md` - 本文件，API 使用說明

## API 概述

### 基礎資訊

- **Base URL**: `https://api.pinelab.example.com/api` (生產環境)
- **開發環境**: `http://localhost:8000/api`
- **版本**: v1
- **格式**: JSON

### 認證方式

1. **公開端點**: 無需認證
   - `GET /api/products/`
   - `GET /api/products/{id}/`
   - `GET /api/categories/`
   - `GET /api/tags/`

2. **聯絡表單**: 需 HMAC-SHA256 簽章
   - `POST /api/contact/`

3. **管理端點**: 需 JWT Token + HMAC-SHA256 簽章
   - 所有 `/api/admin/*` 端點

4. **認證端點**: 僅需帳密
   - `POST /api/auth/login/`
   - `GET /api/auth/me/`

### 回應格式

**成功回應**:
```json
{
  "status": "success",
  "data": { ... }
}
```

**錯誤回應**:
```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "錯誤訊息",
  "errors": {
    "field_name": ["錯誤詳情"]
  }
}
```

### HTTP 狀態碼

- `200 OK` - 成功取得資源
- `201 Created` - 成功建立資源
- `204 No Content` - 成功刪除
- `400 Bad Request` - 請求參數錯誤
- `401 Unauthorized` - 未認證
- `403 Forbidden` - 無權限
- `404 Not Found` - 資源不存在
- `422 Unprocessable Entity` - 資料驗證失敗
- `500 Internal Server Error` - 伺服器錯誤

### HMAC-SHA256 簽章生成

1. 將所有參數按 key 排序（ASCII 順序）
2. 將所有 key=value 用 `&` 連接成字串
3. 在最後加上 `&key={API_SECRET_KEY}`
4. 將整段字串做 HMAC-SHA256 並轉為小寫十六進位字串

**範例**:
```
參數: { "name": "商品", "price": 1000, "timestamp": 1699001234 }
排序後: price=1000&name=商品&timestamp=1699001234
加上 key: price=1000&name=商品&timestamp=1699001234&key=SECRET_KEY
HMAC-SHA256: a1b2c3d4...
```

### JWT Token 使用

在 Header 中攜帶 JWT Token:
```
Authorization: Bearer {jwt_token}
```

## API 端點清單

### 公開端點

- `GET /api/products/` - 取得商品列表
- `GET /api/products/{id}/` - 取得商品詳情
- `GET /api/categories/` - 取得分類列表
- `GET /api/tags/` - 取得標籤列表
- `POST /api/contact/` - 提交聯絡表單（需簽章）

### 認證端點

- `POST /api/auth/login/` - 管理員登入
- `GET /api/auth/me/` - 取得當前使用者資訊

### 管理端點（需 JWT + 簽章）

#### 商品管理
- `GET /api/admin/products/` - 取得所有商品
- `POST /api/admin/products/` - 建立商品
- `PATCH /api/admin/products/{id}/` - 更新商品
- `DELETE /api/admin/products/{id}/` - 刪除商品
- `POST /api/admin/products/{id}/images/` - 新增商品圖片
- `DELETE /api/admin/products/{id}/images/{image_id}/` - 刪除商品圖片

#### 分類管理
- `GET /api/admin/categories/` - 取得所有分類
- `POST /api/admin/categories/` - 建立分類
- `PATCH /api/admin/categories/{id}/` - 更新分類
- `DELETE /api/admin/categories/{id}/` - 刪除分類

#### 標籤管理
- `GET /api/admin/tags/` - 取得所有標籤
- `POST /api/admin/tags/` - 建立標籤
- `PATCH /api/admin/tags/{id}/` - 更新標籤
- `DELETE /api/admin/tags/{id}/` - 刪除標籤

#### 聯絡表單管理
- `GET /api/admin/contacts/` - 取得所有聯絡表單
- `GET /api/admin/contacts/{id}/` - 取得單一聯絡表單

## 詳細 API 規範

請參閱 `openapi.yaml` 文件以獲取完整的 API 規範，包括：
- 請求/回應結構
- 參數定義
- 驗證規則
- 範例請求與回應

## 測試

### 使用 Postman

1. 匯入 `openapi.yaml` 到 Postman
2. 設定環境變數：
   - `base_url`: API 基礎 URL
   - `api_secret_key`: API 密鑰
   - `jwt_token`: JWT Token（管理員端點使用）

### 使用 curl

範例請求：
```bash
# 取得商品列表
curl -X GET "http://localhost:8000/api/products/"

# 提交聯絡表單（需簽章）
curl -X POST "http://localhost:8000/api/contact/" \
  -H "Content-Type: application/json" \
  -d '{"name":"測試","email":"test@example.com","message":"測試訊息","sign":"...","timestamp":...}'
```

## 版本控制

當前版本：v1

未來版本更新將透過 URL 路徑或 Header 指定版本號。

