"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminGetUsers, adminDeleteUser, adminCancelUserDeletion, adminSendPasswordReset } from "@/lib/admin-api";
import { Table, Th, Td, Pagination } from "@/components/admin/table/Table";
import { useToast } from "@/components/admin/feedback/ToastProvider";
import ConfirmModal from "@/components/admin/modals/ConfirmModal";
import { useAdminAuth } from "@/lib/admin-auth";
import { useRBAC } from "@/lib/rbac";

type UserRow = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role: 'admin' | 'editor' | 'analyst';
  role_display?: string;
  is_super_admin: boolean;
  is_active: boolean;
  deletion_scheduled_at?: string;
  deletion_requested_by?: number;
  deletion_requested_by_username?: string;
  created_at?: string;
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAdminAuth();
  const { hasRole } = useRBAC();
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [pendingCancelDeletion, setPendingCancelDeletion] = useState<number | null>(null);
  const [sendingPasswordReset, setSendingPasswordReset] = useState<number | null>(null);
  const [emailPopoverId, setEmailPopoverId] = useState<number | null>(null);

  // 檢查權限
  const canManageUsers = hasRole(['admin', 'editor']);
  const canViewUsers = hasRole(['admin', 'editor', 'analyst']);
  const canEdit = hasRole(['admin', 'editor']);
  const canDelete = hasRole(['admin', 'editor']);
  const canSendPasswordReset = hasRole(['admin']); // T089: 僅管理員可發送密碼重設信

  const load = async (pageNum = 1, searchQuery = "", role = "") => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page: pageNum };
      if (searchQuery) params.search = searchQuery;
      if (role) params.role = role;
      
      const res: any = await adminGetUsers(params);
      const data = res?.data || res?.results || res || [];
      const list = Array.isArray(data) ? data : (data?.results || []);
      setItems(list as UserRow[]);
      
      const count = res?.count || data?.count || list.length;
      setTotalPages(Math.max(1, Math.ceil((count || 0) / 20)));
    } catch (e: any) {
      setError(e?.message || "載入失敗");
      addToast({ type: 'error', message: e?.message || "載入失敗" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewUsers) {
      load(page, search, roleFilter);
    }
  }, [page, search, roleFilter, canViewUsers]);

  const handleDelete = async (id: number) => {
    try {
      const res: any = await adminDeleteUser(id);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: res?.data?.message || '帳號已刪除' });
        load(page, search, roleFilter);
      } else {
        addToast({ type: 'error', message: res?.message || '刪除失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '刪除失敗' });
    } finally {
      setPendingDelete(null);
    }
  };

  const handleCancelDeletion = async (id: number) => {
    try {
      const res: any = await adminCancelUserDeletion(id);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '刪除已取消' });
        load(page, search, roleFilter);
      } else {
        addToast({ type: 'error', message: res?.message || '取消失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '取消失敗' });
    } finally {
      setPendingCancelDeletion(null);
    }
  };

  const handleSendPasswordReset = async (id: number) => {
    setSendingPasswordReset(id);
    try {
      const res: any = await adminSendPasswordReset(id);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: res?.data?.message || '密碼重設信已發送' });
      } else {
        addToast({ type: 'error', message: res?.message || '發送失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '發送失敗' });
    } finally {
      setSendingPasswordReset(null);
    }
  };

  const formatDeletionCountdown = (deletionDate: string) => {
    const now = new Date();
    const deletion = new Date(deletionDate);
    const diff = deletion.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diff < 0) return '已過期';
    if (days > 0) return `${days} 天 ${hours} 小時後`;
    return `${hours} 小時後`;
  };

  const getDisplayName = (user: UserRow) => {
    // 亞洲姓名顯示習慣：姓氏在前，名字在後
    if (user.first_name || user.last_name) {
      return `${user.last_name || ''}${user.first_name ? ' ' + user.first_name : ''}`.trim() || user.username;
    }
    return user.username;
  };

  const getRoleDisplay = (user: UserRow) => {
    if (user.is_super_admin) return '主管理員';
    return user.role_display || user.role;
  };

  const maskEmail = (email: string | undefined): string => {
    if (!email) return '-';
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email; // 如果格式不正確，返回原郵箱
    
    // 如果本地部分少於4個字符，只顯示第一個字符
    if (localPart.length <= 4) {
      return `${localPart[0]}***@${domain}`;
    }
    
    // 顯示前2碼、***、後2碼、@、域名
    const firstTwo = localPart.substring(0, 2);
    const lastTwo = localPart.substring(localPart.length - 2);
    return `${firstTwo}***${lastTwo}@${domain}`;
  };

  const toggleEmailPopover = (id: number) => {
    setEmailPopoverId((prev) => (prev === id ? null : id));
  };

  const copyEmail = async (email?: string) => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      addToast({ type: 'success', message: '已複製郵箱地址' });
    } catch (e) {
      addToast({ type: 'error', message: '複製失敗，請手動複製' });
    }
  };

  if (!canViewUsers) {
    return (
      <div className="p-6">
        <p className="text-red-600">您沒有權限查看此頁面</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">帳號管理</h1>
        {canManageUsers && (
          <Link
            href="/admin-portal/users/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            新增帳號
          </Link>
        )}
      </div>

      {/* 搜尋和篩選 */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="搜尋姓名、郵箱..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(1, search, roleFilter)}
          className="px-4 py-2 border rounded flex-1"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            load(1, search, e.target.value);
          }}
          className="px-4 py-2 border rounded"
        >
          <option value="">全部角色</option>
          <option value="admin">管理員</option>
          <option value="editor">編輯者</option>
          <option value="analyst">分析師</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">載入中...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">沒有帳號</div>
      ) : (
        <>
          <Table>
            <colgroup>
              <col className="w-48" />
              <col className="w-[340px]" />
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-28" />
              {canEdit && <col className="w-[220px]" />}
            </colgroup>
            <thead>
              <tr>
                <Th>姓名</Th>
                <Th>郵箱</Th>
                <Th>角色</Th>
                <Th>狀態</Th>
                <Th>建立時間</Th>
                {canEdit && <Th>操作</Th>}
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id} className={!user.is_active ? 'opacity-50' : ''}>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="inline-block max-w-[200px] truncate">{getDisplayName(user)}</span>
                      {user.is_super_admin && (
                        <span 
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                          title="只有主管理員可以修改主管理員的帳號"
                        >
                          主管理員
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="relative flex items-center gap-2">
                      <span className="inline-block align-middle">{maskEmail(user.email)}</span>
                      <button
                        type="button"
                        onClick={() => toggleEmailPopover(user.id)}
                        className="text-gray-500 hover:text-gray-700"
                        title={emailPopoverId === user.id ? '隱藏郵箱' : '顯示完整郵箱'}
                      >
                        {emailPopoverId === user.id ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      {emailPopoverId === user.id && (
                        <div className="absolute left-0 top-full mt-1 z-20 w-[320px] max-w-[80vw] bg-white border rounded shadow p-3">
                          <div className="text-sm break-all mb-2">{user.email || '-'}</div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => copyEmail(user.email || '')}
                              className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                            >
                              複製郵箱
                            </button>
                            <button
                              type="button"
                              onClick={() => setEmailPopoverId(null)}
                              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              關閉
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <span className="inline-block truncate align-middle">{getRoleDisplay(user)}</span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {user.deletion_scheduled_at ? (
                      <div className="space-y-1">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                          刪除中（7天猶豫期）
                        </span>
                        <div className="text-xs text-gray-500">
                          {formatDeletionCountdown(user.deletion_scheduled_at)}
                        </div>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_active ? '啟用' : '停用'}
                      </span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString('zh-TW')
                      : '-'}
                  </Td>
                  {canEdit && (
                    <Td className="whitespace-nowrap">
                      <div className="flex gap-2 flex-nowrap">
                        <Link
                          href={`/admin-portal/users/${user.id}`}
                          className={`px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm ${
                            user.is_super_admin && !currentUser?.is_super_admin
                              ? 'opacity-50 cursor-not-allowed pointer-events-none'
                              : ''
                          }`}
                          title={user.is_super_admin && !currentUser?.is_super_admin 
                            ? '只有主管理員可以編輯主管理員' 
                            : '編輯'}
                        >
                          編輯
                        </Link>
                        {canSendPasswordReset && user.email && (
                          <button
                            onClick={() => handleSendPasswordReset(user.id)}
                            disabled={sendingPasswordReset === user.id}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="發送密碼重設信"
                          >
                            {sendingPasswordReset === user.id ? '發送中...' : '發送重設密碼信'}
                          </button>
                        )}
                        {user.deletion_scheduled_at ? (
                          <button
                            onClick={() => setPendingCancelDeletion(user.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                          >
                            取消刪除
                          </button>
                        ) : (
                          <button
                            onClick={() => setPendingDelete(user.id)}
                            disabled={user.is_super_admin}
                            className={`px-3 py-1 rounded text-sm ${
                              user.is_super_admin
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={user.is_super_admin ? '主管理員不能被刪除' : '刪除'}
                          >
                            刪除
                          </button>
                        )}
                      </div>
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={setPage}
            />
          )}
        </>
      )}

      {/* 刪除確認對話框 */}
      <ConfirmModal
        open={pendingDelete !== null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && handleDelete(pendingDelete)}
        title="確認刪除"
        message="確定要刪除這個帳號嗎？管理員刪除管理員時會進入7天猶豫期。"
      />

      {/* 取消刪除確認對話框 */}
      <ConfirmModal
        open={pendingCancelDeletion !== null}
        onCancel={() => setPendingCancelDeletion(null)}
        onConfirm={() => pendingCancelDeletion && handleCancelDeletion(pendingCancelDeletion)}
        title="確認取消刪除"
        message="確定要取消這個帳號的刪除嗎？"
      />
    </div>
  );
}

