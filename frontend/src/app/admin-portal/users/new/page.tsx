"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import UserForm from '@/components/admin/users/UserForm';
import { useRBAC } from '@/lib/rbac';
import { useToast } from '@/components/admin/feedback/ToastProvider';

export default function AdminUserNewPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { hasRole } = useRBAC();
  const canManageUsers = hasRole(['admin', 'editor']);

  React.useEffect(() => {
    if (!canManageUsers) {
      addToast({ type: 'error', message: '您沒有權限新增帳號' });
      router.push('/admin-portal/users');
    }
  }, [canManageUsers, router, addToast]);

  const handleSaved = () => {
    router.push('/admin-portal/users');
  };

  if (!canManageUsers) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">新增帳號</h1>
      </div>

      <div className="max-w-2xl">
        <UserForm onSaved={handleSaved} />
      </div>
    </div>
  );
}

