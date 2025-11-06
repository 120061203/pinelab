#!/usr/bin/env python
"""
將 auth_user 表的資料遷移到 users 表（自定義 User 模型）
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pinelab.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()

def migrate_users():
    """將 auth_user 表的資料遷移到 users 表"""
    with connection.cursor() as cursor:
        # 檢查舊表資料
        cursor.execute("""
            SELECT id, username, email, password, first_name, last_name, 
                   is_staff, is_superuser, is_active, date_joined, last_login
            FROM auth_user
        """)
        old_users = cursor.fetchall()
        
        print(f"找到 {len(old_users)} 個使用者需要遷移\n")
        
        migrated_count = 0
        for user_data in old_users:
            user_id, username, email, password, first_name, last_name, \
            is_staff, is_superuser, is_active, date_joined, last_login = user_data
            
            # 檢查是否已存在
            if User.objects.filter(username=username).exists():
                print(f"  ⚠️  使用者 {username} 已存在，跳過")
                continue
            
            # 建立新使用者（先不設定密碼）
            try:
                user = User(
                    id=user_id,
                    username=username,
                    email=email or '',
                    first_name=first_name or '',
                    last_name=last_name or '',
                    is_staff=is_staff,
                    is_active=is_active,
                    date_joined=date_joined,
                    last_login=last_login,
                    # 設定角色：如果是 superuser，設為 admin 並設為主管理員
                    role='admin' if is_superuser else 'editor',
                    is_super_admin=is_superuser,
                )
                
                # 手動設定密碼 hash（直接從舊表複製）
                user.password = password
                user.save()
                
                print(f"  ✅ 已遷移使用者: {username} (ID: {user_id}, 角色: {user.role}, 主管理員: {user.is_super_admin})")
                migrated_count += 1
            except Exception as e:
                print(f"  ❌ 遷移使用者 {username} 失敗: {str(e)}")
        
        print(f"\n遷移完成！共遷移 {migrated_count} 個使用者")

if __name__ == '__main__':
    migrate_users()

