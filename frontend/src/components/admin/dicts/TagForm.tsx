"use client";

import React, { useState } from 'react';
import { adminCreateTag, adminUpdateTag } from '@/lib/admin-api';
import { useToast } from '@/components/admin/feedback/ToastProvider';

export default function TagForm({ initial, onSaved }: { initial?: any; onSaved: () => void }) {
  const { addToast } = useToast();
  const [name, setName] = useState(initial?.name || '');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name } as any;
      const res = initial?.id ? await adminUpdateTag(initial.id, payload) : await adminCreateTag(payload);
      if (res?.status === 'success' || res?.data) {
        addToast({ type: 'success', message: '標籤已儲存' });
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
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">名稱</label>
        <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <button disabled={saving} className="px-3 py-2 bg-black text-white rounded text-sm">{saving ? '儲存中…' : '儲存'}</button>
    </form>
  );
}


