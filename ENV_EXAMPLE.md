# 環境變數設定範例

本文件說明如何設定環境變數，特別是郵件相關設定。

## 後端環境變數

### 資料庫設定
```bash
DATABASE_URL=postgresql://pinelab_user:pinelab_password@db:5432/pinelab_db
DB_NAME=pinelab_db
DB_USER=pinelab_user
DB_PASSWORD=pinelab_password
DB_HOST=db
DB_PORT=5432
```

### Django 核心設定
```bash
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 前端 URL（用於郵件中的重設密碼連結）
```bash
FRONTEND_URL=http://localhost:3000
```

## 郵件設定

### 開發測試用（信件內容會顯示在終端機，不會實際發送）

```bash
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

使用此設定時，所有郵件內容會直接顯示在 Django 的終端機輸出中，方便開發測試。

### 實際發送郵件用（需要設定 SMTP 伺服器）

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

### Gmail 使用說明

1. 啟用兩步驟驗證
2. 前往 [Google 帳戶設定](https://myaccount.google.com/apppasswords) 產生「應用程式密碼」
3. 將應用程式密碼填入 `EMAIL_HOST_PASSWORD`（**不是**你的登入密碼）

### 其他郵件服務商範例

#### SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

#### Mailgun
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=postmaster@yourdomain.mailgun.org
EMAIL_HOST_PASSWORD=your-mailgun-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

#### AWS SES
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-ses-smtp-username
EMAIL_HOST_PASSWORD=your-ses-smtp-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

## 前端環境變數

在 `frontend/.env.local` 中設定：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_SECRET_KEY=your-api-secret-key-here
```

## 使用方式

### 本機開發

1. 複製此文件內容到 `.env` 或 `docker-compose.yml` 的 `environment` 區塊
2. 根據需求選擇郵件後端（console 或 SMTP）
3. 填入實際的設定值

### Docker Compose

在 `docker-compose.yml` 的 `backend` service 的 `environment` 區塊中設定這些變數。

### Zeabur 部署

在 Zeabur 的環境變數設定頁面中，逐一新增這些環境變數。

