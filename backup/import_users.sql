-- 從 Zeabur 備份匯入用戶資料到本地 users 表
-- 只匯入資料，不改變表結構

-- 從 auth_user 資料轉換並插入到 users 表
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
    (1, 'pbkdf2_sha256$600000$in3jNdWUn9ky1REi8TeLTI$g+gcfzaUN58uab3r9NnCZMs6Qo5BBqdUMUNGPOU6+R8=', '2025-11-06 03:07:05.560557+00', false, 'songlin.chen', '', '', 'ccssll120061203@gmail.com', true, true, '2025-11-03 06:18:40.023288+00')
) AS auth_user_data(id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.id = auth_user_data.id OR users.username = auth_user_data.username);

-- 顯示匯入結果
SELECT id, username, email, role, is_super_admin FROM users;

