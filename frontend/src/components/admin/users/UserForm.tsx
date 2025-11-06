"use client";

import React, { useState, useEffect } from 'react';
import { adminCreateUser, adminUpdateUser, adminGetUsers } from '@/lib/admin-api';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import { useAdminAuth } from '@/lib/admin-auth';
import { useRBAC } from '@/lib/rbac';

type UserFormProps = {
  initial?: any;
  onSaved: () => void;
};

export default function UserForm({ initial, onSaved }: UserFormProps) {
  const { addToast } = useToast();
  const { user: currentUser } = useAdminAuth();
  const { hasRole } = useRBAC();
  const isAdmin = hasRole(['admin']);
  const isEditor = hasRole(['editor']);
  
  // T090: 檢查是否為編輯主管理員且當前用戶非主管理員
  const isEditingSuperAdmin = initial?.is_super_admin && !currentUser?.is_super_admin;

  const [firstName, setFirstName] = useState(initial?.first_name || '');
  const [lastName, setLastName] = useState(initial?.last_name || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'analyst'>(initial?.role || 'editor');
  const [isSuperAdmin, setIsSuperAdmin] = useState(initial?.is_super_admin || false);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [hasExistingSuperAdmin, setHasExistingSuperAdmin] = useState(false);
  const [checkingSuperAdmin, setCheckingSuperAdmin] = useState(false);

  // 檢查是否已有主管理員
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (isSuperAdmin && !initial?.id) {
        // 只在新增帳號且選擇主管理員時檢查
        setCheckingSuperAdmin(true);
        try {
          const res: any = await adminGetUsers({ is_super_admin: true });
          const data = res?.data || res?.results || res || [];
          const list = Array.isArray(data) ? data : (data?.results || []);
          const existingSuperAdmin = list.filter((u: any) => u.is_super_admin && u.id !== initial?.id);
          setHasExistingSuperAdmin(existingSuperAdmin.length > 0);
        } catch (e) {
          console.error('Failed to check super admin:', e);
        } finally {
          setCheckingSuperAdmin(false);
        }
      } else {
        setHasExistingSuperAdmin(false);
      }
    };
    checkSuperAdmin();
  }, [isSuperAdmin, initial?.id]);

  // 當 initial prop 變化時，更新表單狀態
  useEffect(() => {
    if (initial) {
      setFirstName(initial.first_name || '');
      setLastName(initial.last_name || '');
      setEmail(initial.email || '');
      setRole(initial.role || 'editor');
      setIsSuperAdmin(initial.is_super_admin || false);
      setIsActive(initial.is_active ?? true);
      // 編輯時不預填密碼
      setPassword('');
      setConfirmPassword('');
    } else {
      // 重置表單
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('editor');
      setIsSuperAdmin(false);
      setIsActive(true);
    }
  }, [initial]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    // 至少8個字元
    return password.length >= 8;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 驗證
    if (!email || !validateEmail(email)) {
      addToast({ type: 'error', message: '請輸入有效的郵箱地址' });
      return;
    }

    const isNew = !initial?.id;
    if (isNew && !password) {
      addToast({ type: 'error', message: '新增帳號時必須設定密碼' });
      return;
    }

    if (password && !validatePassword(password)) {
      addToast({ type: 'error', message: '密碼至少需要8個字元' });
      return;
    }

    if (password && password !== confirmPassword) {
      addToast({ type: 'error', message: '密碼和確認密碼不一致' });
      return;
    }

    if (isSuperAdmin && hasExistingSuperAdmin) {
      addToast({ type: 'error', message: '系統中只能有一位主管理員' });
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        is_super_admin: isSuperAdmin,
        is_active: isActive,
      };

      // 只有新增時或提供新密碼時才包含密碼
      if (isNew || password) {
        payload.password = password;
      }

      const res = isNew
        ? await adminCreateUser(payload)
        : await adminUpdateUser(initial.id, payload);

      if (res?.status === 'success' || res?.data) {
        addToast({ type: 'success', message: '帳號已儲存' });
        if (isNew) {
          // 新增成功後重置表單
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setRole('editor');
          setIsSuperAdmin(false);
          setIsActive(true);
        }
        onSaved();
      } else {
        addToast({ type: 'error', message: res?.message || '儲存失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '儲存失敗' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isEditingSuperAdmin && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ 警告：您正在嘗試編輯主管理員帳號，但您不是主管理員。只有主管理員可以修改主管理員的帳號。
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">名字</label>
          <input
            className={`w-full border rounded px-3 py-2 ${
              isEditingSuperAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isEditingSuperAdmin}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">姓氏</label>
          <input
            className={`w-full border rounded px-3 py-2 ${
              isEditingSuperAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isEditingSuperAdmin}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">郵箱 <span className="text-red-500">*</span></label>
        <input
          type="email"
          className={`w-full border rounded px-3 py-2 ${
            isEditingSuperAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isEditingSuperAdmin}
        />
      </div>

      {(!initial?.id || password) && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">
              {initial?.id ? '新密碼（留空則不修改）' : '密碼'} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!initial?.id}
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">至少8個字元</p>
          </div>

          {(!initial?.id || password) && (
            <div>
              <label className="block text-sm font-medium mb-1">確認密碼 <span className="text-red-500">*</span></label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!initial?.id || !!password}
                minLength={8}
              />
            </div>
          )}
        </>
      )}

      {!initial?.id && (
        <button
          type="button"
          onClick={() => {
            if (!password) {
              setPassword('');
              setConfirmPassword('');
            } else {
              setPassword('');
              setConfirmPassword('');
            }
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          {password ? '清除密碼欄位' : '設定密碼'}
        </button>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">角色 <span className="text-red-500">*</span></label>
        <select
          className={`w-full border rounded px-3 py-2 ${
            isEditingSuperAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          value={role}
          onChange={(e) => {
            const newRole = e.target.value as 'admin' | 'editor' | 'analyst';
            setRole(newRole);
            // 編輯者不能選擇管理員角色
            if (isEditor && newRole === 'admin') {
              addToast({ type: 'error', message: '編輯者不能設定管理員角色' });
              setRole('editor');
            }
            // 非管理員角色不能是主管理員
            if (newRole !== 'admin') {
              setIsSuperAdmin(false);
            }
          }}
          disabled={isEditingSuperAdmin || (isEditor && role === 'admin')}
        >
          <option value="editor">編輯者</option>
          <option value="analyst">分析師</option>
          {isAdmin && <option value="admin">管理員</option>}
        </select>
        {isEditor && role !== 'admin' && (
          <p className="text-xs text-gray-500 mt-1">編輯者不能新增管理員角色</p>
        )}
        {isEditingSuperAdmin && (
          <p className="text-xs text-red-600 mt-1">只有主管理員可以修改主管理員的角色</p>
        )}
      </div>

      {isAdmin && role === 'admin' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="superAdmin"
              type="checkbox"
              checked={isSuperAdmin}
              onChange={(e) => setIsSuperAdmin(e.target.checked)}
              disabled={checkingSuperAdmin || isEditingSuperAdmin}
            />
            <label htmlFor="superAdmin" className="text-sm font-medium">設為主管理員</label>
          </div>
          {checkingSuperAdmin && (
            <p className="text-xs text-gray-500">檢查中...</p>
          )}
          {hasExistingSuperAdmin && (
            <p className="text-xs text-red-600">
              ⚠️ 系統已有主管理員，無法再設定主管理員
            </p>
          )}
          {isSuperAdmin && !hasExistingSuperAdmin && (
            <p className="text-xs text-yellow-600">
              ⚠️ 系統中只能有一位主管理員
            </p>
          )}
          {isEditingSuperAdmin && (
            <p className="text-xs text-red-600">
              ⚠️ 只有主管理員可以修改主管理員狀態
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          id="active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          disabled={isEditingSuperAdmin}
        />
        <label htmlFor="active" className="text-sm">啟用</label>
      </div>
      {isEditingSuperAdmin && (
        <p className="text-xs text-red-600">只有主管理員可以修改主管理員的啟用狀態</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || (isSuperAdmin && hasExistingSuperAdmin) || isEditingSuperAdmin}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? '儲存中…' : '儲存'}
        </button>
      </div>
      {isEditingSuperAdmin && (
        <p className="text-xs text-red-600">您沒有權限儲存主管理員的修改</p>
      )}
    </form>
  );
}

