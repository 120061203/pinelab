"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminGetUser } from '@/lib/admin-api';
import UserForm from '@/components/admin/users/UserForm';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import { useRBAC } from '@/lib/rbac';

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const { hasRole } = useRBAC();
  const id = params?.id as string;
  const isNew = id === 'new';
  const userId = isNew ? null : parseInt(id, 10);

  const [initial, setInitial] = useState<any>(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);

  const canManageUsers = hasRole(['admin', 'editor']);

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isNew ? '新增帳號' : '編輯帳號'}
        </h1>
      </div>

      <div className="max-w-2xl">
        <UserForm
          initial={isNew ? undefined : initial}
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}

