-- 從 Zeabur 備份匯入所有資料到本地資料庫
-- 使用最新備份：zeabur_backup_20251107_120035.sql
-- 只匯入資料，不改變表結構

BEGIN;

-- 設定為僅資料模式（暫時關閉外鍵檢查）
SET session_replication_role='replica';

-- ============================================
-- 1. 匯入用戶資料（從 auth_user 轉換到 users）
-- ============================================
INSERT INTO users (
    id, password, last_login, is_superuser, username, 
    first_name, last_name, email, is_staff, is_active, date_joined,
    created_at, role, is_super_admin
)
SELECT 
    id,
    password,
    CASE WHEN last_login = '\N' THEN NULL ELSE last_login::timestamp with time zone END,
    is_superuser,
    username,
    COALESCE(NULLIF(first_name, ''), ''),
    COALESCE(NULLIF(last_name, ''), ''),
    CASE WHEN email = '\N' OR email = '' THEN NULL ELSE email END,
    is_staff,
    is_active,
    date_joined::timestamp with time zone,
    date_joined::timestamp with time zone AS created_at,
    CASE WHEN is_superuser THEN 'admin' ELSE 'editor' END AS role,
    is_superuser AS is_super_admin
FROM (
    VALUES 
    (1, 'pbkdf2_sha256$600000$in3jNdWUn9ky1REi8TeLTI$g+gcfzaUN58uab3r9NnCZMs6Qo5BBqdUMUNGPOU6+R8=', '2025-11-06 03:07:05.560557+00', true, 'songlin.chen', '', '', 'ccssll120061203@gmail.com', true, true, '2025-11-03 06:18:40.023288+00')
) AS auth_user_data(id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.id = auth_user_data.id OR users.username = auth_user_data.username);

-- ============================================
-- 2. 匯入分類資料
-- ============================================
INSERT INTO categories (id, name, slug, description, sort_order, is_active, created_at, updated_at)
VALUES
    (1, '熱門', 'category-1762219729', '111', 1, true, '2025-11-04 01:25:44.518142+00', '2025-11-04 01:42:10.810474+00'),
    (2, '即將推出', 'category-1762220411', '', 2, false, '2025-11-04 01:40:11.426557+00', '2025-11-04 03:32:35.412107+00'),
    (3, '即將下架', 'category-1762220420', '', 4, true, '2025-11-04 01:40:20.44749+00', '2025-11-04 01:40:30.56342+00'),
    (4, '測試排序', 'category-1762220442', '', 3, true, '2025-11-04 01:40:42.465059+00', '2025-11-04 01:40:42.46508+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. 匯入標籤資料
-- ============================================
INSERT INTO tags (id, name, slug, created_at, updated_at)
VALUES
    (1, '銷售No2', 'no2', '2025-11-04 02:53:00.678244+00', '2025-11-04 03:24:21.122013+00'),
    (15, '銷售No1', 'no1', '2025-11-04 03:24:08.818858+00', '2025-11-04 03:24:25.613194+00'),
    (16, '銷售No3', 'no3', '2025-11-04 06:37:50.224829+00', '2025-11-04 06:37:50.225007+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. 匯入產品資料
-- ============================================
INSERT INTO products (id, name, slug, description, price, sort_order, is_active, created_at, updated_at, category_id)
VALUES
    (1, '測試', 'product-1762226795', '非常值得購買', 150.00, 11, true, '2025-11-04 00:26:43.6079+00', '2025-11-04 03:26:49.427275+00', 1),
    (17, '測試', 'product-1762216287-3', '1111', 1111.00, 10, false, '2025-11-04 00:31:27.472063+00', '2025-11-04 00:31:27.47207+00', 1),
    (18, '測試', 'product-1762216287-4', '1111', 1111.00, 7, false, '2025-11-04 00:31:27.618057+00', '2025-11-04 00:31:27.618062+00', 1),
    (19, '測試', 'product-1762216287-5', '1111', 1111.00, 8, false, '2025-11-04 00:31:27.768475+00', '2025-11-04 02:51:01.257634+00', 3),
    (20, '測試', 'product-1762216287-6', '1111', 1111.00, 9, false, '2025-11-04 00:31:27.9092+00', '2025-11-04 02:50:54.185696+00', 3),
    (21, 'fa2', 'fa', '2efsafasdf', 1122.00, 12, true, '2025-11-04 00:31:37.795837+00', '2025-11-06 02:46:20.158418+00', 1),
    (22, 'fa', 'fa-1', '2efsafasdf', 1122.00, 13, true, '2025-11-04 00:43:35.932085+00', '2025-11-04 03:25:01.432683+00', 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. 匯入產品標籤關聯
-- ============================================
INSERT INTO product_tags (id, product_id, tag_id)
VALUES
    (3, 21, 1),
    (4, 22, 15)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. 匯入產品圖片
-- ============================================
INSERT INTO product_images (id, image_url, sort_order, is_primary, created_at, product_id)
VALUES
    (3, '/media/products/22/pass_trial_period-1_20251104_090108.png', 0, false, '2025-11-04 01:01:08.599257+00', 22),
    (4, '/media/products/22/2025-10-17-milestone-first-RD-meeting-1_20251104_090804.png', 0, false, '2025-11-04 01:08:04.830861+00', 22),
    (5, '/media/products/22/ansible-tutorial_20251104_090812.png', 0, false, '2025-11-04 01:08:12.755135+00', 22),
    (6, '/media/products/22/rabbit_20251104_092348.jpeg', 0, true, '2025-11-04 01:23:48.788653+00', 22),
    (7, '/media/products/22/dog_20251104_092401.jpeg', 0, false, '2025-11-04 01:24:01.783814+00', 22),
    (8, '/media/products/21/seastar_20251104_102845.jpeg', 0, false, '2025-11-04 02:28:45.595969+00', 21),
    (9, '/media/products/1/pass_trial_period-1_20251106_104659.png', 2, false, '2025-11-06 02:46:59.683621+00', 1),
    (10, '/media/products/1/2025-10-17-milestone-first-RD-meeting-1_20251106_104720.png', 3, false, '2025-11-06 02:47:20.022088+00', 1),
    (11, '/media/products/1/pass_trial_period-1_20251106_114750.png', 1, false, '2025-11-06 03:47:50.442317+00', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. 匯入聯絡表單
-- ============================================
INSERT INTO contacts (id, name, email, message, is_read, created_at)
VALUES
    (1, '測試', 'me@xsong.us', '你好你好你好你好你好', true, '2025-11-04 00:25:38.556049+00')
ON CONFLICT (id) DO NOTHING;

-- 恢復正常模式
SET session_replication_role='origin';

COMMIT;

-- 顯示匯入結果
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'tags', COUNT(*) FROM tags
UNION ALL SELECT 'contacts', COUNT(*) FROM contacts;

