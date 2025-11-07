#!/usr/bin/env python
"""
從 Zeabur 備份文件匯入資料到本地資料庫
只匯入資料，不改變資料庫結構
"""
import os
import sys
import django
import re
from datetime import datetime

# 設定 Django 環境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pinelab.settings')
django.setup()

from django.db import connection, transaction
from apps.auth.models import User

def parse_backup_file(backup_file):
    """解析備份文件，提取資料"""
    data = {
        'auth_user': [],
        'categories': [],
        'products': [],
        'tags': [],
        'product_tags': [],
        'product_images': [],
        'contacts': [],
    }
    
    current_table = None
    current_data = []
    
    with open(backup_file, 'r', encoding='utf-8') as f:
        for line in f:
            # 檢測 COPY 語句開始
            if line.startswith('COPY public.'):
                match = re.search(r'COPY public\.(\w+)', line)
                if match:
                    table_name = match.group(1)
                    # 映射表名
                    if table_name == 'auth_user':
                        current_table = 'auth_user'
                    elif table_name in data:
                        current_table = table_name
                    else:
                        current_table = None
                    current_data = []
            
            # 檢測資料行（不是 COPY、不是 \.、不是註解）
            elif current_table and not line.startswith('\\') and not line.startswith('--') and line.strip():
                # 移除行尾的換行符
                line = line.rstrip('\n')
                if line and line != '\\.':
                    current_data.append(line)
            
            # 檢測 COPY 結束
            elif line.strip() == '\\.' and current_table:
                if current_table == 'auth_user':
                    data['auth_user'] = current_data
                elif current_table in data:
                    data[current_table] = current_data
                current_table = None
                current_data = []
    
    return data

def import_users(auth_user_data):
    """將 auth_user 資料匯入到 users 表"""
    if not auth_user_data:
        print("⚠️  沒有用戶資料需要匯入")
        return 0
    
    imported_count = 0
    
    with transaction.atomic():
        for line in auth_user_data:
            if not line.strip():
                continue
            
            # 解析 COPY 格式的資料
            # 格式：id\tpassword\tlast_login\tis_superuser\tusername\tfirst_name\tlast_name\temail\tis_staff\tis_active\tdate_joined
            parts = line.split('\t')
            
            if len(parts) < 11:
                print(f"⚠️  跳過格式不正確的行: {line[:50]}...")
                continue
            
            try:
                user_id = int(parts[0])
                password = parts[1]
                last_login = parts[2] if parts[2] != '\\N' else None
                is_superuser = parts[3] == 't'
                username = parts[4]
                first_name = parts[5] if parts[5] != '\\N' else ''
                last_name = parts[6] if parts[6] != '\\N' else ''
                email = parts[7] if parts[7] != '\\N' else None
                is_staff = parts[8] == 't'
                is_active = parts[9] == 't'
                date_joined = parts[10] if parts[10] != '\\N' else datetime.now()
                
                # 檢查用戶是否已存在
                if User.objects.filter(id=user_id).exists() or User.objects.filter(username=username).exists():
                    print(f"  ⚠️  用戶 {username} (ID: {user_id}) 已存在，跳過")
                    continue
                
                # 創建用戶
                user = User(
                    id=user_id,
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password=password,  # 直接使用 hash，不需要重新加密
                    is_staff=is_staff,
                    is_active=is_active,
                    is_superuser=is_superuser,
                    date_joined=date_joined if isinstance(date_joined, datetime) else datetime.fromisoformat(date_joined.replace('Z', '+00:00')),
                    last_login=datetime.fromisoformat(last_login.replace('Z', '+00:00')) if last_login else None,
                    # 自定義欄位
                    role='admin' if is_superuser else 'editor',
                    is_super_admin=is_superuser,
                    created_at=date_joined if isinstance(date_joined, datetime) else datetime.fromisoformat(date_joined.replace('Z', '+00:00')),
                )
                
                # 跳過驗證（因為我們直接設定 id）
                user.save(force_insert=True)
                
                print(f"  ✅ 已匯入用戶: {username} (ID: {user_id}, 角色: {user.role}, 主管理員: {user.is_super_admin})")
                imported_count += 1
                
            except Exception as e:
                print(f"  ❌ 匯入用戶失敗: {str(e)}")
                print(f"     資料: {line[:100]}...")
                continue
    
    return imported_count

def import_other_data(data):
    """匯入其他表的資料（categories, products, tags 等）"""
    # 這裡可以擴展匯入其他表的資料
    # 目前先只處理用戶資料
    pass

def main():
    backup_file = '../backup/zeabur_backup_20251107_091555.sql'
    
    if not os.path.exists(backup_file):
        print(f"❌ 備份文件不存在: {backup_file}")
        print("請確認備份文件路徑")
        return
    
    print(f"📂 讀取備份文件: {backup_file}")
    data = parse_backup_file(backup_file)
    
    print(f"\n📊 找到的資料:")
    print(f"  - 用戶: {len(data['auth_user'])} 筆")
    print(f"  - 分類: {len(data['categories'])} 筆")
    print(f"  - 產品: {len(data['products'])} 筆")
    print(f"  - 標籤: {len(data['tags'])} 筆")
    print(f"  - 聯絡表單: {len(data['contacts'])} 筆")
    
    # 匯入用戶
    print(f"\n🔄 開始匯入用戶資料...")
    imported = import_users(data['auth_user'])
    print(f"\n✅ 用戶匯入完成！共匯入 {imported} 個用戶")
    
    # TODO: 匯入其他表的資料
    print(f"\n⚠️  其他表的資料匯入功能待實現")

if __name__ == '__main__':
    main()

