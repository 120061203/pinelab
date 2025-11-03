# 後台登入指南

## 🔐 Django Admin 後台

Django Admin 是網站的管理後台，用於管理商品、分類、標籤和聯絡表單。

### 後台網址

**開發環境：**
- **URL:** http://localhost:8000/admin

**生產環境：**
- **URL:** https://yourdomain.com/admin

---

## 📋 登入步驟

### 步驟 1: 確認管理員帳號是否存在

檢查是否已建立管理員帳號：

```bash
cd infra
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
admins = User.objects.filter(is_staff=True)
print('管理員數量:', admins.count())
for admin in admins:
    print(f'  - {admin.username} ({admin.email})')
"
```

### 步驟 2: 建立管理員帳號（如果還沒有）

如果沒有管理員帳號，需要先建立：

```bash
cd infra
docker-compose exec backend python manage.py createsuperuser
```

執行後會提示輸入：
1. **Username（使用者名稱）**: 例如 `admin`
2. **Email address（電子郵件）**: 例如 `admin@pinelab.com`（可選）
3. **Password（密碼）**: 輸入密碼（輸入時不會顯示）
4. **Password again（確認密碼）**: 再次輸入相同密碼

**範例：**
```
Username: admin
Email address: admin@pinelab.com
Password: ********
Password again: ********
Superuser created successfully.
```

### 步驟 3: 登入後台

1. **開啟瀏覽器**，訪問：http://localhost:8000/admin

2. **輸入登入資訊：**
   - **使用者名稱：** 剛才建立的管理員使用者名稱（例如 `admin`）
   - **密碼：** 剛才設定的密碼

3. **點擊「登入」按鈕**

---

## 🎯 後台功能

登入後，您可以在後台管理：

### 1. 使用者（Users）
- 查看、編輯使用者帳號

### 2. 商品（Products）
- 建立、編輯、刪除商品
- 設定商品名稱、描述、價格
- 管理商品分類和標籤
- 上傳商品圖片

### 3. 分類（Categories）
- 建立、編輯、刪除商品分類
- 設定分類排序順序

### 4. 標籤（Tags）
- 建立、編輯、刪除商品標籤

### 5. 聯絡表單（Contacts）
- 查看訪客提交的聯絡表單
- 標記已讀/未讀狀態

---

## 🔑 管理員 API 登入（JWT）

除了 Django Admin，您也可以使用 API 管理內容：

### 步驟 1: 登入取得 JWT Token

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'
```

**回應範例：**
```json
{
  "status": "success",
  "data": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@pinelab.com",
      "is_staff": true
    }
  }
}
```

### 步驟 2: 使用 Token 訪問管理 API

```bash
# 使用 access token 訪問管理 API
curl -X GET http://localhost:8000/api/admin/products/ \
  -H "Authorization: Bearer {your_access_token}"
```

**可用的管理 API 端點：**
- `GET /api/admin/products/` - 取得商品列表
- `POST /api/admin/products/` - 建立商品
- `PATCH /api/admin/products/{id}/` - 更新商品
- `DELETE /api/admin/products/{id}/` - 刪除商品
- `POST /api/admin/products/{id}/upload_image/` - 上傳商品圖片
- `GET /api/admin/categories/` - 管理分類
- `GET /api/admin/tags/` - 管理標籤
- `GET /api/admin/contact/` - 查看聯絡表單

---

## 🔄 重置管理員密碼

如果忘記密碼，可以重置：

```bash
cd infra
docker-compose exec backend python manage.py changepassword admin
```

（將 `admin` 替換為您的使用者名稱）

---

## 🛡️ 安全建議

1. **強密碼：** 使用至少 12 字元，包含大小寫、數字、符號
2. **定期更換：** 建議定期更新管理員密碼
3. **不要分享：** 管理員密碼應該保密
4. **生產環境：** 
   - 設定 `DEBUG=False`
   - 使用 HTTPS
   - 限制管理員 IP 訪問（可選）

---

## ❓ 常見問題

### Q: 登入時出現 "關係不存在" 錯誤？

**A:** 資料庫遷移尚未完成，執行：
```bash
cd infra
docker-compose exec backend python manage.py migrate
```

### Q: 忘記管理員使用者名稱？

**A:** 檢查現有管理員：
```bash
cd infra
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
for user in User.objects.filter(is_staff=True):
    print(user.username)
"
```

### Q: 無法訪問 http://localhost:8000/admin？

**A:** 確認：
1. Docker 容器正在運行：`docker-compose ps`
2. 後端服務正常：`curl http://localhost:8000/api/health/`
3. 查看後端日誌：`docker-compose logs backend`

---

## 📚 相關文件

- **建立管理員帳號詳細說明：** `CREATE_ADMIN.md`
- **API 文檔：** `specs/001-corporate-website/contracts/openapi.yaml`
- **快速開始：** `QUICKSTART.md`

---

**最後更新：** 2025-11-03

