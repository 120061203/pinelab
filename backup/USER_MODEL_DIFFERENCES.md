# auth_user vs 自定義 User 模型差異說明

## 概述

本專案使用了**自定義 User 模型**來擴充 Django 預設的 User 功能，主要差異如下：

---

## 1. 表名差異

| 項目 | Django 預設 | 自定義模型 |
|------|------------|-----------|
| **表名** | `auth_user` | `users` |
| **應用程式標籤** | `auth` | `custom_auth` |
| **模型位置** | `django.contrib.auth.models.User` | `apps.auth.models.User` |

---

## 2. 欄位差異

### Django 預設 `auth_user` 表欄位：
```sql
- id (integer)
- password
- last_login
- is_superuser
- username
- first_name
- last_name
- email
- is_staff
- is_active
- date_joined
```

### 自定義 `users` 表額外欄位：
```sql
✅ 繼承所有 auth_user 的欄位，並新增：
- created_at (timestamp) - 創建時間
- role (varchar(20)) - 角色：'admin', 'editor', 'analyst'
- is_super_admin (boolean) - 主管理員標記（唯一）
- deletion_scheduled_at (timestamp) - 刪除預定時間（7天猶豫期）
- deletion_requested_by_id (bigint) - 刪除請求者（外鍵指向 users.id）
```

---

## 3. 關聯表差異

| Django 預設 | 自定義模型 |
|------------|-----------|
| `auth_user_groups` | `users_groups` |
| `auth_user_user_permissions` | `users_user_permissions` |

---

## 4. 功能差異

### Django 預設 User：
- ✅ 基本認證功能
- ✅ 權限管理（is_superuser, is_staff）
- ❌ 沒有角色系統
- ❌ 沒有主管理員概念
- ❌ 沒有刪除猶豫期功能

### 自定義 User：
- ✅ **所有 Django 預設功能**
- ✅ **角色系統**：管理員、編輯者、分析師
- ✅ **主管理員**：唯一的主管理員，不能被刪除
- ✅ **刪除猶豫期**：7天猶豫期，可取消刪除
- ✅ **自定義欄位**：created_at, role, is_super_admin 等

---

## 5. 設定差異

### Django 預設（Zeabur 舊環境）：
```python
# settings.py
# 沒有 AUTH_USER_MODEL 設定，使用預設
```

### 自定義模型（本地新環境）：
```python
# settings.py
AUTH_USER_MODEL = 'custom_auth.User'  # 指向自定義模型
```

---

## 6. 資料遷移注意事項

⚠️ **重要**：從 Zeabur 的 `auth_user` 遷移到本地的 `users` 表時：

1. **表結構不同**：需要手動遷移資料
2. **欄位映射**：
   - `auth_user.*` → `users.*`（所有基本欄位）
   - 新增欄位需要設定預設值：
     - `role` → 根據 `is_superuser` 設定：`'admin'` 或 `'editor'`
     - `is_super_admin` → 等於 `is_superuser`
     - `created_at` → 等於 `date_joined`
3. **關聯表**：
   - `auth_user_groups` → `users_groups`
   - `auth_user_user_permissions` → `users_user_permissions`

---

## 7. 為什麼要使用自定義 User 模型？

1. **擴充功能**：添加角色系統、主管理員等業務邏輯
2. **靈活性**：可以隨時添加新欄位，不受 Django 預設限制
3. **業務需求**：符合專案的帳號管理需求（角色、刪除猶豫期等）

---

## 8. 當前狀態

- **Zeabur（生產環境）**：使用 Django 預設 `auth_user` 表
- **本地（開發環境）**：使用自定義 `users` 表

⚠️ **建議**：未來需要將 Zeabur 也遷移到自定義 User 模型，以保持一致性。

