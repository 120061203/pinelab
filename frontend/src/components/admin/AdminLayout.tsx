"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { useAdminAuth } from "@/lib/admin-auth";
import { navVisible, useRBAC } from "@/lib/rbac";
import { adminCancelImpersonation, adminImpersonateUser, adminGetUsers } from "@/lib/admin-api";
import { useToast } from "@/components/admin/feedback/ToastProvider";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user, setTokens, setUser } = useAdminAuth();
  const { hasRole, role } = useRBAC();
  const { addToast } = useToast();
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalUser, setOriginalUser] = useState<any>(null);
  const [showImpersonateMenu, setShowImpersonateMenu] = useState(false);

  // 檢查是否正在身份切換（從 JWT token 中解析）
  React.useEffect(() => {
    // TODO: 從 JWT token 中檢查是否有 impersonate_role 和 original_user_id
    // 這裡先簡單檢查，實際應該從 token 解析
    const checkImpersonation = () => {
      // 可以從 localStorage 或 context 中獲取身份切換狀態
      // 暫時簡化處理
    };
    checkImpersonation();
  }, []);

  const handleCancelImpersonation = async () => {
    try {
      const res: any = await adminCancelImpersonation();
      if (res?.status === 'success' && res?.data) {
        setTokens({ access: res.data.access, refresh: res.data.refresh });
        setUser(res.data.user);
        setIsImpersonating(false);
        setOriginalUser(null);
        addToast({ type: 'success', message: '已取消身份切換' });
        router.refresh();
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '取消身份切換失敗' });
    }
  };

  const canManageUsers = hasRole(['admin', 'editor']);
  const canImpersonate = hasRole(['admin']);

  return (
    <ProtectedRoute>
      {/* 身份切換提示橫幅 */}
      {isImpersonating && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-yellow-800 font-medium">
              ⚠️ 您正在以 {role === 'editor' ? '編輯者' : '分析師'} 身份操作
            </span>
          </div>
          <button
            onClick={handleCancelImpersonation}
            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
          >
            取消身份切換
          </button>
        </div>
      )}

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-r p-4 space-y-2">
          <h2 className="font-semibold mb-3">Admin Portal</h2>
          <nav className="flex flex-col gap-2 text-sm">
            {navVisible(user?.role as any, 'dashboard') && (
              <Link href="/admin-portal/dashboard">Dashboard</Link>
            )}
            {navVisible(user?.role as any, 'products') && (
              <Link href="/admin-portal/products">Products</Link>
            )}
            {navVisible(user?.role as any, 'categories') && (
              <Link href="/admin-portal/categories">Categories</Link>
            )}
            {navVisible(user?.role as any, 'tags') && (
              <Link href="/admin-portal/tags">Tags</Link>
            )}
            {navVisible(user?.role as any, 'contacts') && (
              <Link href="/admin-portal/contacts">Contacts</Link>
            )}
            
            {/* 帳號管理（管理員和編輯者可見） */}
            {canManageUsers && (
              <Link href="/admin-portal/users">帳號管理</Link>
            )}

            {/* 個人設定（所有使用者可見） */}
            <div className="mt-2 pt-2 border-t">
              <div className="font-medium text-gray-700 mb-1">個人設定</div>
              <Link href="/admin-portal/account/profile" className="block ml-2 text-gray-600">
                編輯帳號資訊
              </Link>
              <Link href="/admin-portal/account/profile" className="block ml-2 text-gray-600">
                變更密碼
              </Link>
            </div>

            {/* 身份切換（僅管理員可見） */}
            {canImpersonate && (
              <div className="mt-2 pt-2 border-t">
                <div className="font-medium text-gray-700 mb-1">身份切換</div>
                <Link href="/admin-portal/users/impersonate" className="block ml-2 text-gray-600">
                  切換身份
                </Link>
              </div>
            )}

            <button onClick={logout} className="text-left text-red-600 mt-4">
              登出
            </button>
          </nav>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}


