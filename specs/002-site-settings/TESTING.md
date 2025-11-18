# 網站設定功能測試指南

## 資料庫遷移

### 使用 Docker（推薦）

1. **重新構建 Docker 映像以包含新代碼**：
```bash
cd /Users/songlin.chen/Documents/pinelab
docker-compose build backend
docker-compose restart backend
```

2. **執行遷移**：
```bash
docker-compose exec backend python manage.py migrate site_settings
```

或執行所有遷移：
```bash
docker-compose exec backend python manage.py migrate
```

### 本地開發環境

1. **啟動虛擬環境**：
```bash
cd backend
source venv/bin/activate  # 或 Windows: venv\Scripts\activate
```

2. **執行遷移**：
```bash
python manage.py migrate site_settings
```

## 後端測試

### 使用 Docker

```bash
# 執行所有 site_settings 相關測試
docker-compose exec backend pytest tests/unit/test_site_settings_model.py -v
docker-compose exec backend pytest tests/unit/test_site_settings_serializer.py -v
docker-compose exec backend pytest tests/integration/test_site_settings_api.py -v

# 執行所有測試並顯示覆蓋率
docker-compose exec backend pytest tests/ --cov=apps.site_settings --cov-report=html
```

### 本地開發環境

```bash
cd backend
source venv/bin/activate
pytest tests/unit/test_site_settings_model.py -v
pytest tests/unit/test_site_settings_serializer.py -v
pytest tests/integration/test_site_settings_api.py -v
```

## 前端測試

### 執行單元測試

```bash
cd frontend
npm test -- HeroSection.test.tsx
npm test -- NewsSection.test.tsx
npm test -- ServicesSection.test.tsx
```

### 執行整合測試

```bash
cd frontend
npm test -- home.test.tsx
```

### 執行所有測試

```bash
cd frontend
npm test
```

### 執行測試並顯示覆蓋率

```bash
cd frontend
npm run test:coverage
```

## 手動測試 API

### 公開 API

1. **取得網站設定**：
```bash
curl http://localhost:8000/api/site-settings/
```

2. **取得最新消息**：
```bash
curl http://localhost:8000/api/news/
curl http://localhost:8000/api/news/?limit=5
```

3. **取得服務項目**：
```bash
curl http://localhost:8000/api/services/
```

### 管理員 API（需要認證）

1. **登入取得 Token**：
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'
```

2. **取得網站設定（管理員）**：
```bash
curl http://localhost:8000/api/admin/site-settings/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. **更新網站設定**：
```bash
curl -X PUT http://localhost:8000/api/admin/site-settings/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_name": "測試品牌",
    "brand_slogan": "測試標語",
    "show_price": true
  }'
```

4. **建立最新消息**：
```bash
curl -X POST http://localhost:8000/api/admin/news/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "測試消息",
    "content": "這是測試內容",
    "publish_date": "2025-01-27",
    "status": "draft"
  }'
```

5. **建立服務項目**：
```bash
curl -X POST http://localhost:8000/api/admin/services/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "測試服務",
    "description": "服務描述",
    "icon_type": "fontawesome",
    "icon_value": "fa-home",
    "sort_order": 10
  }'
```

## 測試檢查清單

### 後端測試
- [ ] SiteSettings 模型單元測試
- [ ] News 模型單元測試
- [ ] Service 模型單元測試
- [ ] Serializer 單元測試
- [ ] 公開 API 整合測試
- [ ] 管理員 API 整合測試
- [ ] 檔案上傳測試
- [ ] 權限驗證測試

### 前端測試
- [ ] HeroSection 元件測試
- [ ] NewsSection 元件測試
- [ ] ServicesSection 元件測試
- [ ] Navigation 元件測試
- [ ] Footer 元件測試
- [ ] 首頁整合測試
- [ ] 管理頁面測試

### 手動測試
- [ ] 網站設定 CRUD
- [ ] 最新消息 CRUD
- [ ] 服務項目 CRUD
- [ ] 檔案上傳（Logo、Hero Banner、Service Icons）
- [ ] 價格顯示控制
- [ ] 外部連結顯示
- [ ] 響應式設計

