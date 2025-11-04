"use client";

import React, { useState } from 'react';
import { adminCreateProduct, adminUpdateProduct } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/admin/feedback/ToastProvider';

export default function ProductForm({ initial, productId }: { initial?: any; productId?: number }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [isActive, setIsActive] = useState(!!initial?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name, price: parseFloat(price), description, is_active: isActive } as any;
      const res = productId
        ? await adminUpdateProduct(productId, payload)
        : await adminCreateProduct(payload);
      
      // 檢查響應格式：可能是 {status: 'success', data: {...}} 或直接是 {data: {...}}
      if (res?.status === 'success' || res?.data || res?.id) {
        addToast({ type: 'success', message: '已儲存' });
        router.replace('/admin-portal/products');
      } else {
        // 如果響應格式不符合預期，記錄詳細資訊
        console.error('Unexpected response format:', res);
        addToast({ type: 'error', message: res?.message || res?.detail || '儲存失敗：響應格式不符合預期' });
      }
    } catch (err: any) {
      console.error('Product save error:', err);
      // 顯示更詳細的錯誤訊息
      const errorMessage = err?.message || '儲存失敗';
      addToast({ type: 'error', message: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm mb-1">名稱</label>
        <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">價格</label>
        <input className="w-full border rounded px-3 py-2" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">描述</label>
        <textarea className="w-full border rounded px-3 py-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <input id="active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <label htmlFor="active">啟用</label>
      </div>
      <button disabled={saving} className="px-3 py-2 bg-black text-white rounded">{saving ? '儲存中…' : '儲存'}</button>
    </form>
  );
}


