"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminGetUser, adminSendPasswordReset, adminDeleteUser } from '@/lib/admin-api';
import UserForm from '@/components/admin/users/UserForm';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import { useRBAC } from '@/lib/rbac';
import ConfirmModal from '@/components/admin/modals/ConfirmModal';
import { useAdminAuth } from '@/lib/admin-auth';

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const { hasRole } = useRBAC();
  const { user: currentUser } = useAdminAuth();
  const id = params?.id as string;
  const isNew = id === 'new';
  const userId = isNew ? null : parseInt(id, 10);

  const [initial, setInitial] = useState<any>(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);

  const canManageUsers = hasRole(['admin', 'editor']);
  const canSendPasswordReset = hasRole(['admin']); // T089: 僅管理員可發送密碼重設信

  useEffect(() => {
    if (!canManageUsers) {
      addToast({ type: 'error', message: '您沒有權限管理帳號' });
      router.push('/admin-portal/users');
      return;
    }

    if (!isNew && userId) {
      const loadUser = async () => {
        setLoading(true);
        setError(null);
        try {
          const res: any = await adminGetUser(userId);
          const data = res?.data || res;
          setInitial(data);
        } catch (e: any) {
          setError(e?.message || '載入失敗');
          addToast({ type: 'error', message: e?.message || '載入失敗' });
        } finally {
          setLoading(false);
        }
      };
      loadUser();
    }
  }, [isNew, userId, canManageUsers, router, addToast]);

  const handleSaved = () => {
    router.push('/admin-portal/users');
  };

  const handleSendPasswordReset = async () => {
    if (!userId) return;
    setSendingPasswordReset(true);
    try {
      const res: any = await adminSendPasswordReset(userId);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: res?.data?.message || '密碼重設信已發送' });
      } else {
        addToast({ type: 'error', message: res?.message || '發送失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '發送失敗' });
    } finally {
      setSendingPasswordReset(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    try {
      const res: any = await adminDeleteUser(userId);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: res?.data?.message || '帳號已刪除' });
        router.push('/admin-portal/users');
      } else {
        addToast({ type: 'error', message: res?.message || '刪除失敗' });
        setPendingDelete(false);
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '刪除失敗' });
      setPendingDelete(false);
    }
  };

  if (!canManageUsers) {
    return null; // 已經在 useEffect 中導向
  }

  if (!isNew && loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">載入中...</div>
      </div>
    );
  }

  if (!isNew && error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>
        <button
          onClick={() => router.push('/admin-portal/users')}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          返回列表
        </button>
      </div>
    );
  }

  const canDelete = hasRole(['admin', 'editor']) && !isNew && initial && !initial.is_super_admin;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isNew ? '新增帳號' : '編輯帳號'}
        </h1>
        <div className="flex gap-2">
          {!isNew && canSendPasswordReset && initial?.email && (
            <button
              onClick={handleSendPasswordReset}
              disabled={sendingPasswordReset}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingPasswordReset ? '發送中...' : '發送重設密碼信'}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setPendingDelete(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              刪除帳號
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl">
        <UserForm
          initial={isNew ? undefined : initial}
          onSaved={handleSaved}
          onCancel={() => router.push('/admin-portal/users')}
        />
      </div>

      {/* 刪除確認對話框 */}
      <ConfirmModal
        open={pendingDelete}
        onCancel={() => setPendingDelete(false)}
        onConfirm={handleDelete}
        title="確認刪除帳號"
        message="確定要刪除這個帳號嗎？管理員刪除管理員時會進入7天猶豫期。此操作無法復原。"
        confirmText="確認刪除"
        cancelText="取消"
      />
    </div>
  );
}

