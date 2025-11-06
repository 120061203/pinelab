"use client";

import React, { useState, useEffect } from 'react';
import { adminUpdateSelf, changePassword } from '@/lib/admin-api';
import { useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import { useRouter } from 'next/navigation';
import { useRBAC } from '@/lib/rbac';
import PasswordInput from '@/components/admin/forms/PasswordInput';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAdminAuth();
  const { addToast } = useToast();
  const { role, hasRole } = useRBAC();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !validateEmail(email)) {
      addToast({ type: 'error', message: '請輸入有效的郵箱地址' });
      return;
    }

    setSaving(true);
    try {
      const res: any = await adminUpdateSelf({
        first_name: firstName,
        last_name: lastName,
        email,
      });

      if (res?.status === 'success' && res?.data) {
        // 更新本地用戶資訊
        setUser({ ...user, ...res.data });
        addToast({ type: 'success', message: '帳號資訊已更新' });
      } else {
        addToast({ type: 'error', message: res?.message || '更新失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '更新失敗' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      addToast({ type: 'error', message: '請填寫所有密碼欄位' });
      return;
    }

    if (!validatePassword(newPassword)) {
      addToast({ type: 'error', message: '新密碼至少需要8個字元' });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', message: '新密碼和確認密碼不一致' });
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      addToast({ type: 'success', message: '密碼已成功變更' });
      
      // 清除密碼欄位
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangePasswordMode(false);
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '密碼變更失敗' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-8">載入中...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">個人帳號資訊</h1>
        <p className="text-gray-600 mt-1">管理您的個人帳號資訊</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* 帳號資訊卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">帳號資訊</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium text-gray-700">使用者名稱</span>
              <span className="text-sm text-gray-900">{user.username}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium text-gray-700">角色</span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs rounded font-medium ${
                  role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : role === 'editor'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {role === 'admin' ? '管理員' : role === 'editor' ? '編輯者' : role === 'analyst' ? '分析師' : '未知'}
                </span>
                {user?.is_super_admin && (
                  <span className="px-3 py-1 text-xs rounded font-medium bg-yellow-100 text-yellow-800">
                    主管理員
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">帳號 ID</span>
              <span className="text-sm text-gray-900">#{user.id}</span>
            </div>
          </div>
        </div>

        {/* 基本資訊表單 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">基本資訊</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">名字</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">姓氏</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">郵箱 <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                className="w-full border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? '儲存中...' : '儲存基本資訊'}
              </button>
            </div>
          </form>
        </div>

        {/* 密碼變更區塊 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">密碼變更</h2>
            {!changePasswordMode && (
              <button
                type="button"
                onClick={() => setChangePasswordMode(true)}
                className="px-3 py-1 text-sm text-blue-600 hover:underline"
              >
                變更密碼
              </button>
            )}
          </div>

          {changePasswordMode ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">舊密碼 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    className="w-full border rounded px-3 py-2 pr-10"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showOldPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                label="新密碼"
                required={true}
                showStrength={true}
              />

              <div>
                <label className="block text-sm font-medium mb-1">確認新密碼 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="w-full border rounded px-3 py-2 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">密碼和確認密碼不一致</p>
                )}
                {newPassword && confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-600 mt-1">✓ 密碼確認一致</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {changingPassword ? '變更中...' : '變更密碼'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordMode(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500 text-sm">點擊「變更密碼」按鈕來更新您的密碼</p>
          )}
        </div>
      </div>
    </div>
  );
}

