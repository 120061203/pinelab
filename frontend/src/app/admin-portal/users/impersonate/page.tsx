"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminGetUsers, adminImpersonateUser, adminCancelImpersonation } from '@/lib/admin-api';
import { useAdminAuth } from '@/lib/admin-auth';
import { useRBAC } from '@/lib/rbac';
import { useToast } from '@/components/admin/feedback/ToastProvider';

type UserOption = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role: 'admin' | 'editor' | 'analyst';
};

export default function ImpersonatePage() {
  const router = useRouter();
  const { user: currentUser, setTokens, setUser } = useAdminAuth();
  const { hasRole, role } = useRBAC();
  const { addToast } = useToast();
  
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<'editor' | 'analyst'>('editor');
  const [impersonating, setImpersonating] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalUser, setOriginalUser] = useState<any>(null);

  const canImpersonate = hasRole(['admin']);

  useEffect(() => {
    if (!canImpersonate) {
      addToast({ type: 'error', message: '只有管理員可以使用身份切換功能' });
      router.push('/admin-portal/dashboard');
      return;
    }

    // 載入可切換的用戶列表（編輯者和分析師）
    const loadUsers = async () => {
      setLoading(true);
      try {
        const res: any = await adminGetUsers({ role: 'editor' });
        const editorRes: any = await adminGetUsers({ role: 'analyst' });
        
        const editorList = Array.isArray(editorRes?.data) ? editorRes.data : (editorRes?.data?.results || []);
        const analystList = Array.isArray(editorRes?.data) ? editorRes.data : (editorRes?.data?.results || []);
        
        // 合併編輯者和分析師列表
        const allUsers = [
          ...editorList.filter((u: any) => u.role === 'editor'),
          ...analystList.filter((u: any) => u.role === 'analyst'),
        ];
        
        setUsers(allUsers);
      } catch (e: any) {
        addToast({ type: 'error', message: e?.message || '載入用戶列表失敗' });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();

    // 檢查是否正在身份切換
    // TODO: 從 JWT token 中檢查是否有 impersonate_role
    // 這裡暫時簡化處理
  }, [canImpersonate, router, addToast]);

  const handleImpersonate = async () => {
    if (!selectedUserId) {
      addToast({ type: 'error', message: '請選擇要模擬的用戶' });
      return;
    }

    setImpersonating(true);
    try {
      const res: any = await adminImpersonateUser(selectedUserId, selectedRole);
      
      if (res?.status === 'success' && res?.data) {
        // 更新 tokens 和 user
        setTokens({ access: res.data.access, refresh: res.data.refresh });
        setUser(res.data.user);
        setIsImpersonating(true);
        setOriginalUser(currentUser);
        addToast({ type: 'success', message: `已切換為 ${selectedRole === 'editor' ? '編輯者' : '分析師'} 身份` });
        router.push('/admin-portal/dashboard');
      } else {
        addToast({ type: 'error', message: res?.message || '身份切換失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '身份切換失敗' });
    } finally {
      setImpersonating(false);
    }
  };

  const handleCancelImpersonation = async () => {
    try {
      const res: any = await adminCancelImpersonation();
      
      if (res?.status === 'success' && res?.data) {
        setTokens({ access: res.data.access, refresh: res.data.refresh });
        setUser(res.data.user);
        setIsImpersonating(false);
        setOriginalUser(null);
        addToast({ type: 'success', message: '已取消身份切換' });
        router.push('/admin-portal/dashboard');
      } else {
        addToast({ type: 'error', message: res?.message || '取消身份切換失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '取消身份切換失敗' });
    }
  };

  if (!canImpersonate) {
    return null; // 已經在 useEffect 中導向
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">載入中...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">身份切換</h1>
        <p className="text-gray-600 mt-1">以其他角色身份體驗系統功能</p>
      </div>

      {/* 身份切換狀態提示 */}
      {isImpersonating && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-200 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-800">
                ⚠️ 您正在以 {role === 'editor' ? '編輯者' : '分析師'} 身份操作
              </p>
              {originalUser && (
                <p className="text-sm text-yellow-700 mt-1">
                  原始身份：{originalUser.username} (管理員)
                </p>
              )}
            </div>
            <button
              onClick={handleCancelImpersonation}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              取消身份切換
            </button>
          </div>
        </div>
      )}

      {!isImpersonating && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">選擇要模擬的角色</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">角色</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'editor' | 'analyst')}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="editor">編輯者</option>
                  <option value="analyst">分析師</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  選擇要體驗的角色。您將以該角色的權限操作系統。
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">選擇用戶（可選）</label>
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">不指定用戶（使用角色切換）</option>
                  {users
                    .filter((u) => u.role === selectedRole)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.first_name || u.last_name
                          ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                          : u.username}{' '}
                        ({u.email || u.username})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  選擇特定用戶進行身份切換，或留空以僅切換角色
                </p>
              </div>

              <button
                onClick={handleImpersonate}
                disabled={impersonating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {impersonating ? '切換中...' : '切換身份'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-medium text-blue-900 mb-2">使用說明</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>身份切換功能僅供管理員使用</li>
              <li>您只能模擬編輯者或分析師角色，不能模擬其他管理員</li>
              <li>切換身份後，您將以該角色的權限操作系統</li>
              <li>可以隨時取消身份切換，返回原始管理員身份</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

