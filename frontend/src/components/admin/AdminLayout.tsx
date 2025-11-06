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

  // 檢查是否正在身份切換（從 JWT access token 解析 original_user_id/impersonate_role）
  React.useEffect(() => {
    const checkImpersonation = () => {
      if (typeof window === 'undefined') return;
      try {
        const token = localStorage.getItem('admin.access');
        if (!token) {
          setIsImpersonating(false);
          setOriginalUser(null);
          return;
        }
        const [, payloadB64] = token.split('.');
        if (!payloadB64) return;
        const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(decodeURIComponent(escape(payloadJson)));
        if (payload && payload.original_user_id) {
          setIsImpersonating(true);
          setOriginalUser({ id: payload.original_user_id });
        } else {
          setIsImpersonating(false);
          setOriginalUser(null);
        }
      } catch {
        // 忽略解析錯誤
      }
    };
    checkImpersonation();
  }, [user]);

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

  const canManageUsers = hasRole(['admin']);
  const canImpersonate = hasRole(['admin']);

  // 未登入：不要套用側欄版型，避免登入頁被擠壓
  if (!user) {
    return (
      <ProtectedRoute>
        <main className="p-6 w-full">{children}</main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {/* 身份切換提示橫幅 */}
      {isImpersonating && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-yellow-800 font-medium">
              ⚠️ 您正在以 {role === 'editor' ? '編輯者' : role === 'analyst' ? '分析師' : role === 'admin' ? '管理員' : role} 身份操作
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
              <div className="mt-2 pt-2 border-t">
                <div className="font-medium text-gray-700 mb-1">帳號管理</div>
                <Link href="/admin-portal/users" className="block ml-2 text-gray-600">
                  使用者管理
                </Link>
              </div>
            )}

            {/* 個人設定（需登入才顯示） */}
            <div className="mt-2 pt-2 border-t">
              <div className="font-medium text-gray-700 mb-1">個人設定</div>
              <Link href="/admin-portal/account/profile" className="block ml-2 text-gray-600">
                編輯帳號資訊
              </Link>
            </div>

            {/* 身份切換入口（僅管理員可見）；但取消按鈕由頂部橫幅提供，分析師也看得到 */}
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


