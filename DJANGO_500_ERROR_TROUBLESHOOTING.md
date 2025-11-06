# Django 500 錯誤診斷指南

當 Django admin 頁面出現 500 錯誤時，請按照以下步驟診斷：

---

## 🔍 步驟 1：檢查 Zeabur 後端服務日誌

在 Zeabur Dashboard 中：
1. 進入後端服務（`dj backend`）
2. 點擊「**記錄**」或「**Logs**」標籤
3. 查看最新的錯誤訊息

常見錯誤訊息：

### 錯誤 1：WhiteNoise 相關
```
ValueError: Missing staticfiles manifest entry for...
```
**解決方案**：已在 `settings.py` 中改為使用 `CompressedStaticFilesStorage`，重新部署即可。

### 錯誤 2：資料庫連接錯誤
```
django.db.utils.OperationalError: could not connect to server
```
**解決方案**：檢查 `DATABASE_URL` 環境變數是否正確。

### 錯誤 3：靜態文件收集失敗
```
OSError: [Errno 2] No such file or directory: '/app/staticfiles'
```
**解決方案**：Dockerfile 已改進，會自動創建目錄並繼續啟動。

---

## 🔧 步驟 2：檢查環境變數

確認以下環境變數已正確設定：

### 必填項目
```
DEBUG=False
SECRET_KEY=your-strong-secret-key
ALLOWED_HOSTS=pinelab-backend.zeabur.app
DATABASE_URL=postgresql://root:password@host:port/zeabur
```

### 選填項目（有預設值）
```
CORS_ALLOWED_ORIGINS=https://your-frontend.zeabur.app
CSRF_TRUSTED_ORIGINS=https://pinelab-backend.zeabur.app
```

---

## 🛠️ 步驟 3：常見解決方案

### 方案 A：啟用 DEBUG 模式（臨時，用於診斷）

在 Zeabur 後端服務環境變數中：
```
DEBUG=True
```

**⚠️ 注意**：這會顯示詳細錯誤訊息，但會暴露敏感資訊。僅用於診斷，找到問題後立即改回 `False`。

### 方案 B：檢查 WhiteNoise 配置

如果使用 `CompressedManifestStaticFilesStorage` 出現問題，可以：

1. **使用環境變數切換**（推薦）：
   ```
   USE_COMPRESSED_MANIFEST=False
   ```
   這會使用 `CompressedStaticFilesStorage`（更寬鬆，不要求 manifest 文件）

2. **或確保 collectstatic 成功執行**：
   檢查 Dockerfile 中的 `collectstatic` 命令是否正常執行

### 方案 C：檢查資料庫連接

測試資料庫連接：
```bash
# 在 Zeabur 後端服務的 Shell 中執行
python manage.py check --database default
```

### 方案 D：檢查靜態文件

```bash
# 在 Zeabur 後端服務的 Shell 中執行
python manage.py collectstatic --noinput
ls -la /app/staticfiles
```

---

## 📋 步驟 4：檢查服務狀態

在 Zeabur Dashboard 中：
1. 檢查後端服務是否為「**運行中**」狀態
2. 檢查健康檢查是否通過
3. 檢查資源使用是否正常（CPU、記憶體）

---

## 🐛 常見錯誤和解決方案

### 1. ValueError: Missing staticfiles manifest entry

**原因**：使用了 `CompressedManifestStaticFilesStorage` 但沒有運行 `collectstatic`

**解決方案**：
- 使用 `USE_COMPRESSED_MANIFEST=False`（已設定為預設）
- 或確保 Dockerfile 中的 `collectstatic` 成功執行

### 2. django.db.utils.OperationalError

**原因**：資料庫連接失敗

**解決方案**：
- 檢查 `DATABASE_URL` 是否正確
- 檢查資料庫服務是否運行
- 檢查網路連接

### 3. TemplateDoesNotExist

**原因**：模板文件缺失

**解決方案**：
- 檢查應用程式是否正確安裝在 `INSTALLED_APPS` 中
- 檢查文件是否正確複製到容器

### 4. ImproperlyConfigured

**原因**：配置錯誤

**解決方案**：
- 檢查 `settings.py` 中的配置
- 檢查環境變數是否正確設定

---

## 📝 快速診斷命令

在 Zeabur 後端服務的 Shell 中執行：

```bash
# 1. 檢查 Django 配置
python manage.py check

# 2. 檢查資料庫連接
python manage.py check --database default

# 3. 檢查靜態文件
python manage.py collectstatic --noinput --dry-run

# 4. 測試 admin 頁面（如果可能）
python manage.py shell
>>> from django.contrib import admin
>>> admin.site.urls
```

---

## 💡 建議的調試流程

1. **啟用 DEBUG=True**（臨時）
   - 查看詳細錯誤訊息
   - 記錄錯誤的具體內容

2. **檢查日誌**
   - 查看 Zeabur 後端服務的日誌
   - 查找錯誤堆疊追蹤

3. **檢查環境變數**
   - 確認所有必要的環境變數都已設定
   - 確認值是否正確

4. **測試資料庫連接**
   - 使用 `python manage.py check --database default`

5. **測試靜態文件**
   - 手動執行 `collectstatic`
   - 檢查文件是否正確生成

6. **修復問題**
   - 根據錯誤訊息修復
   - 重新部署服務

7. **關閉 DEBUG**
   - 問題解決後，將 `DEBUG=False`

---

## 📞 如果問題仍然存在

請提供：
1. 完整的錯誤堆疊追蹤（從 Zeabur 日誌中複製）
2. 環境變數列表（隱藏敏感資訊）
3. 服務狀態資訊
4. 任何相關的配置變更

這樣可以更準確地診斷問題。

