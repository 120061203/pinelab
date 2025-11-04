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
      
      // 檢查響應格式：可能是 {status: 'success', data: {...}} 或直接是 {id, name, ...}
      if (res?.status === 'success' || res?.data || res?.id) {
        addToast({ type: 'success', message: '標籤已儲存' });
        // 如果是新增，保存成功後重置表單
        if (!initial?.id) {
          setName('');
        }
        onSaved();
      } else {
        // 處理錯誤響應
        const errorMsg = res?.message || res?.detail || (typeof res === 'string' ? res : '儲存失敗');
        addToast({ type: 'error', message: errorMsg });
      }
    } catch (e: any) {
      console.error('Tag save error:', e);
      // 確保錯誤訊息是字符串
      let errorMessage = '儲存失敗';
      if (e?.message) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      } else if (e?.response?.data) {
        const errorData = e.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.name) {
          // 處理驗證錯誤
          errorMessage = `驗證失敗: ${errorData.name.join ? errorData.name.join(', ') : errorData.name}`;
        }
      }
      addToast({ type: 'error', message: errorMessage });
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


