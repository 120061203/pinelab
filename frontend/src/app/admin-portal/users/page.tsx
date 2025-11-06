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
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
    }
    return user.username;
  };

  const getRoleDisplay = (user: UserRow) => {
    if (user.is_super_admin) return '主管理員';
    return user.role_display || user.role;
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
                  <Td>
                    <div className="flex items-center gap-2">
                      {getDisplayName(user)}
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
                  <Td>{user.email || '-'}</Td>
                  <Td>{getRoleDisplay(user)}</Td>
                  <Td>
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
                  <Td>
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString('zh-TW')
                      : '-'}
                  </Td>
                  {canEdit && (
                    <Td>
                      <div className="flex gap-2 flex-wrap">
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
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* 刪除確認對話框 */}
      <ConfirmModal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && handleDelete(pendingDelete)}
        title="確認刪除"
        message="確定要刪除這個帳號嗎？管理員刪除管理員時會進入7天猶豫期。"
      />

      {/* 取消刪除確認對話框 */}
      <ConfirmModal
        isOpen={pendingCancelDeletion !== null}
        onClose={() => setPendingCancelDeletion(null)}
        onConfirm={() => pendingCancelDeletion && handleCancelDeletion(pendingCancelDeletion)}
        title="確認取消刪除"
        message="確定要取消這個帳號的刪除嗎？"
      />
    </div>
  );
}

