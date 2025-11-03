# 建立管理員帳號指南

## 說明

Django 的管理員帳號**不會**自動建立，也沒有預設的帳號密碼。您需要透過命令手動建立。

## 方式一：使用 Docker Compose（推薦）

```bash
cd infra
docker-compose exec backend python manage.py createsuperuser
```

執行後會提示您輸入：
- **Username（使用者名稱）**: 例如 `admin`
- **Email address（電子郵件）**: 例如 `admin@pinelab.com`（可選）
- **Password（密碼）**: 輸入密碼（輸入時不會顯示）
- **Password again（確認密碼）**: 再次輸入相同密碼

## 方式二：非互動式建立（適用於自動化腳本）

```bash
cd infra
docker-compose exec -T backend python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_superuser(
    username='admin',
    email='admin@pinelab.com',
    password='your_password_here'
)
print('管理員帳號已建立')
EOF
```

⚠️ **注意**：在生產環境中，請使用環境變數或安全的密碼管理工具，不要將密碼寫在腳本中。

## 方式三：本地開發（不使用 Docker）

```bash
cd backend
python manage.py createsuperuser
```

## 登入 Django Admin

建立帳號後，您可以：

1. 訪問 http://localhost:8000/admin
2. 使用剛才建立的使用者名稱和密碼登入

## 檢查現有管理員

查看是否有管理員帳號：

```bash
cd infra
docker-compose exec backend python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
admins = User.objects.filter(is_staff=True)
print(f'管理員數量: {admins.count()}')
for admin in admins:
    print(f'  - {admin.username} ({admin.email})')
EOF
```

## 重置管理員密碼

如果您忘記密碼，可以重置：

```bash
cd infra
docker-compose exec backend python manage.py changepassword admin
```

（將 `admin` 替換為您的使用者名稱）

## 安全建議

1. **生產環境**：使用強密碼（至少 12 字元，包含大小寫、數字、符號）
2. **定期更換**：建議定期更新管理員密碼
3. **不要分享**：管理員密碼應該保密
4. **使用環境變數**：自動化建立時，從環境變數讀取密碼

---

**快速建立命令**：

```bash
# 進入容器並建立管理員
cd infra
docker-compose exec backend python manage.py createsuperuser
```

