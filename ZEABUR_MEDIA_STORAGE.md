# Zeabur 媒體文件儲存配置指南

## 問題說明

在 Zeabur 上，Docker 容器內的文件系統是**臨時的**。當容器重啟、重建或部署新版本時，所有文件（包括上傳的圖片）都會丟失。

## 解決方案

### 方案一：使用 Zeabur 持久化儲存卷（推薦用於中小型項目）

Zeabur 支持為服務配置持久化儲存卷（Persistent Volume），將容器內的 `/app/media` 目錄掛載到持久化儲存。

#### 步驟：

1. **在 Zeabur 後端服務中配置 Volume**：
   - 進入 Zeabur Dashboard
   - 選擇你的後端服務
   - 進入 "Settings" 或 "Volumes" 標籤
   - 添加新的 Volume：
     - **Mount Path**: `/app/media`
     - **Volume Name**: `media-storage`（或自定義名稱）

2. **確保目錄存在**：
   - 在 Dockerfile 中，確保 `/app/media` 目錄在容器啟動時存在
   - 或者在 `settings.py` 中自動創建（已經實現）

3. **重新部署服務**：
   - 配置 Volume 後，重新部署後端服務
   - 上傳的圖片會持久化儲存在 Zeabur 的 Volume 中

#### 優點：
- ✅ 配置簡單，無需額外服務
- ✅ 文件直接在 Zeabur 平台管理
- ✅ 適合中小型項目

#### 缺點：
- ⚠️ Volume 大小有限制（取決於 Zeabur 方案）
- ⚠️ 備份需要手動處理
- ⚠️ 不適合大規模文件儲存

---

### 方案二：使用外部雲端儲存服務（推薦用於生產環境）

使用 AWS S3、Cloudinary、或其他雲端儲存服務，圖片儲存在外部，不依賴容器。

#### 使用 AWS S3（推薦）

1. **安裝依賴**：
   ```bash
   pip install django-storages boto3
   ```

2. **配置 `settings.py`**：
   ```python
   # 安裝 django-storages 後
   INSTALLED_APPS = [
       # ... 其他 apps
       'storages',
   ]
   
   # AWS S3 配置
   AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
   AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
   AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_S3_BUCKET_NAME')
   AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
   AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
   AWS_DEFAULT_ACL = 'public-read'
   
   # 使用 S3 儲存媒體文件
   DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
   ```

3. **設置 Zeabur 環境變數**：
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET_NAME=your-bucket-name
   AWS_S3_REGION_NAME=ap-northeast-1
   ```

#### 使用 Cloudinary（簡單快速）

1. **安裝依賴**：
   ```bash
   pip install django-cloudinary-storage
   ```

2. **配置 `settings.py`**：
   ```python
   INSTALLED_APPS = [
       # ... 其他 apps
       'cloudinary',
       'cloudinary_storage',
   ]
   
   # Cloudinary 配置
   CLOUDINARY_STORAGE = {
       'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
       'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
       'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
   }
   
   # 使用 Cloudinary 儲存媒體文件
   DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
   ```

3. **設置 Zeabur 環境變數**：
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

#### 優點：
- ✅ 文件儲存在雲端，不依賴容器
- ✅ 自動備份和 CDN 加速
- ✅ 適合大規模文件儲存
- ✅ 易於擴展

#### 缺點：
- ⚠️ 需要額外的服務和費用
- ⚠️ 需要配置第三方服務

---

## 當前配置狀態

當前代碼已經支持：
- ✅ 媒體文件路徑已正確配置：`/app/media`（在 Docker 中）
- ✅ 生產環境可以通過 Django 提供媒體文件
- ✅ 支持通過環境變數 `MEDIA_ROOT` 自定義路徑

## 建議

對於 MVP 階段：
- 推薦使用 **方案一（Zeabur Volume）**，配置簡單，無需額外費用

對於生產環境：
- 推薦使用 **方案二（雲端儲存）**，更可靠且易於擴展

---

## 快速檢查

配置完成後，驗證步驟：

1. **上傳一張測試圖片**
2. **檢查 Zeabur 日誌**，確認文件是否成功保存
3. **訪問圖片 URL**，例如：`https://pinelab-api.zeabur.app/media/products/1/image.jpg`
4. **重啟容器**，確認圖片仍然可以訪問（持久化成功）

---

## 故障排除

### 問題：上傳成功但圖片無法訪問

**檢查**：
- 確認 `urls.py` 中已配置媒體文件服務（已修正）
- 確認 `MEDIA_ROOT` 路徑正確（已修正）
- 檢查 Zeabur Volume 是否正確掛載（方案一）
- 檢查外部儲存服務配置（方案二）

### 問題：容器重啟後圖片丟失

**原因**：未配置持久化儲存

**解決**：
- 使用方案一配置 Zeabur Volume
- 或使用方案二遷移到雲端儲存

