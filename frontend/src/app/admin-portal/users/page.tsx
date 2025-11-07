"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminGetUsers, adminCancelUserDeletion } from "@/lib/admin-api";
import { Table, Th, Td, Pagination } from "@/components/admin/table/Table";
import { useToast } from "@/components/admin/feedback/ToastProvider";
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
  const [hoveredEmailId, setHoveredEmailId] = useState<number | null>(null);
  const [cancellingDeletion, setCancellingDeletion] = useState<number | null>(null);

  // 檢查權限
  const canManageUsers = hasRole(['admin', 'editor']);
  const canViewUsers = hasRole(['admin', 'editor', 'analyst']);
  const canEdit = hasRole(['admin', 'editor']);

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

  const handleCancelDeletion = async (id: number) => {
    setCancellingDeletion(id);
    try {
      const res: any = await adminCancelUserDeletion(id);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '刪除已取消，帳號已還原' });
        load(page, search, roleFilter);
      } else {
        addToast({ type: 'error', message: res?.message || '取消失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '取消失敗' });
    } finally {
      setCancellingDeletion(null);
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

  const getRoleTagClass = (user: UserRow) => {
    if (user.is_super_admin) {
      return 'px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded';
    }
    const role = user.role || '';
    if (role === 'admin') {
      return 'px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded';
    } else if (role === 'editor') {
      return 'px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded';
    } else if (role === 'analyst') {
      return 'px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded';
    }
    return 'px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded';
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
    <div className="p-6 w-full overflow-x-hidden">
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
              <col style={{ width: canEdit ? '15%' : '20%' }} />
              <col style={{ width: canEdit ? '20%' : '28%' }} />
              <col style={{ width: canEdit ? '10%' : '12%' }} />
              <col style={{ width: canEdit ? '12%' : '18%' }} />
              <col style={{ width: canEdit ? '10%' : '22%' }} />
              {canEdit && <col style={{ width: '33%' }} />}
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
                    <span className="inline-block max-w-[200px] truncate">{getDisplayName(user)}</span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {user.email ? (
                      <div className="relative inline-block">
                        <span
                          className="inline-block align-middle cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => copyEmail(user.email)}
                          onMouseEnter={() => setHoveredEmailId(user.id)}
                          onMouseLeave={() => setHoveredEmailId(null)}
                        >
                          {maskEmail(user.email)}
                        </span>
                        {hoveredEmailId === user.id && (
                          <div className="absolute left-0 bottom-full mb-2 z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap">
                            {user.email}
                            <div className="absolute left-2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-block align-middle text-gray-400">-</span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <span className={`inline-block ${getRoleTagClass(user)}`}>
                      {getRoleDisplay(user)}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {user.deletion_scheduled_at ? (
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded inline-block w-fit">
                          刪除中（7天猶豫期）
                        </span>
                        <div className="text-xs text-gray-500 leading-tight">
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
                    <Td className="overflow-hidden">
                      <div className="flex flex-wrap gap-1 items-center">
                        <Link
                          href={`/admin-portal/users/${user.id}`}
                          className={`px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs whitespace-nowrap ${
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
                        {user.deletion_scheduled_at && 
                         currentUser?.is_super_admin && 
                         user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleCancelDeletion(user.id)}
                            disabled={cancellingDeletion === user.id}
                            className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            title="還原帳號，取消刪除"
                          >
                            {cancellingDeletion === user.id ? '還原中...' : '還原'}
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

    </div>
  );
}

