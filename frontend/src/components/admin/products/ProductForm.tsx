"use client";

import React, { useState, useEffect } from 'react';
import { adminCreateProduct, adminUpdateProduct, adminGetCategories, adminGetTags } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/admin/feedback/ToastProvider';

export default function ProductForm({ initial, productId }: { initial?: any; productId?: number }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [isActive, setIsActive] = useState(!!initial?.is_active ?? true);
  const [categoryId, setCategoryId] = useState<number | null>(initial?.category?.id || null);
  const [tagIds, setTagIds] = useState<number[]>(initial?.tags?.map((t: any) => t.id) || []);
  const [saving, setSaving] = useState(false);
  
  // 載入分類和標籤列表
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, tagsRes] = await Promise.all([
          adminGetCategories(),
          adminGetTags(),
        ]);
        
        if (categoriesRes?.status === 'success') {
          const cats = categoriesRes.data || categoriesRes.results || [];
          // 只顯示啟用的分類
          setCategories(cats.filter((c: any) => c.is_active !== false));
        }
        
        if (tagsRes?.status === 'success') {
          const ts = tagsRes.data || tagsRes.results || [];
          setTags(ts);
        }
      } catch (err: any) {
        console.error('Failed to load categories/tags:', err);
        addToast({ type: 'error', message: '載入分類和標籤失敗' });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { 
        name, 
        price: parseFloat(price), 
        description, 
        is_active: isActive,
        category_id: categoryId || null,
        tag_ids: tagIds,
      } as any;
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

  const handleTagToggle = (tagId: number) => {
    setTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
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
      <div>
        <label className="block text-sm mb-1">分類</label>
        <select 
          className="w-full border rounded px-3 py-2" 
          value={categoryId || ''} 
          onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">無分類</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">標籤</label>
        {loading ? (
          <div className="text-sm text-gray-500">載入中...</div>
        ) : (
          <div className="border rounded px-3 py-2 max-h-48 overflow-y-auto">
            {tags.length === 0 ? (
              <div className="text-sm text-gray-500">尚無標籤</div>
            ) : (
              <div className="space-y-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tagIds.includes(tag.id)}
                      onChange={() => handleTagToggle(tag.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{tag.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input id="active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <label htmlFor="active">啟用</label>
      </div>
      <button disabled={saving} className="px-3 py-2 bg-black text-white rounded">{saving ? '儲存中…' : '儲存'}</button>
    </form>
  );
}


