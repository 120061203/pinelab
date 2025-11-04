"use client";

import React, { useState, useEffect } from 'react';
import { adminCreateCategory, adminUpdateCategory } from '@/lib/admin-api';
import { useToast } from '@/components/admin/feedback/ToastProvider';

export default function CategoryForm({ initial, onSaved }: { initial?: any; onSaved: () => void }) {
  const { addToast } = useToast();
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 0);
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  // 當 initial prop 變化時，更新表單狀態
  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setDescription(initial.description || '');
      setSortOrder(initial.sort_order ?? 0);
      setIsActive(initial.is_active ?? true);
    } else {
      // 如果 initial 為 undefined/null，重置表單為空
      setName('');
      setDescription('');
      setSortOrder(0);
      setIsActive(true);
    }
  }, [initial]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name, description, sort_order: sortOrder, is_active: isActive } as any;
      const res = initial?.id
        ? await adminUpdateCategory(initial.id, payload)
        : await adminCreateCategory(payload);
      if (res?.status === 'success' || res?.data) {
        addToast({ type: 'success', message: '分類已儲存' });
        // 如果是新增，保存成功後重置表單
        if (!initial?.id) {
          setName('');
          setDescription('');
          setSortOrder(0);
          setIsActive(true);
        }
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
      <div>
        <label className="block text-sm mb-1">描述</label>
        <input className="w-full border rounded px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">排序</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value || '0'))} />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input id="catActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <label htmlFor="catActive">啟用</label>
        </div>
      </div>
      <button disabled={saving} className="px-3 py-2 bg-black text-white rounded text-sm">{saving ? '儲存中…' : '儲存'}</button>
    </form>
  );
}


