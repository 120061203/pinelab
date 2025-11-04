"use client";

import React, { useEffect, useState } from 'react';
import { adminGetTags, adminDeleteTag, adminGetProducts, adminBatchUpdateProductTags } from '@/lib/admin-api';
import { Table, Th, Td } from '@/components/admin/table/Table';
import TagForm from '@/components/admin/dicts/TagForm';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import ConfirmModal from '@/components/admin/modals/ConfirmModal';

export default function AdminTagsPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await adminGetTags();
      if (res?.status === 'success') setItems(res.data || res.results || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const onDelete = async (id: number) => {
    try {
      const res: any = await adminDeleteTag(id);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '已刪除標籤' });
        load();
      } else {
        addToast({ type: 'error', message: res?.message || '刪除失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '刪除失敗' });
    }
  };

  // 批量修改商品標籤功能
  const [showBatchUpdate, setShowBatchUpdate] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [operation, setOperation] = useState<'add' | 'remove' | 'replace'>('add');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [pendingBatchUpdate, setPendingBatchUpdate] = useState<{operation: 'add' | 'remove' | 'replace', tagIds: number[]} | null>(null);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res: any = await adminGetProducts({ page_size: 1000 });
      const data = res?.data || res?.results || res || [];
      const list = Array.isArray(data) ? data : (data?.results || []);
      setProducts(list);
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '載入商品失敗' });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (showBatchUpdate) {
      loadProducts();
    }
  }, [showBatchUpdate]);

  const handleBatchUpdateTags = async () => {
    if (selectedProductIds.length === 0) {
      addToast({ type: 'error', message: '請至少選擇一個商品' });
      return;
    }
    if (selectedTagIds.length === 0 && operation !== 'remove') {
      addToast({ type: 'error', message: '請至少選擇一個標籤' });
      return;
    }
    setPendingBatchUpdate({ operation, tagIds: selectedTagIds });
  };

  const confirmBatchUpdate = async () => {
    if (!pendingBatchUpdate) return;
    
    setBatchUpdating(true);
    try {
      const res = await adminBatchUpdateProductTags(
        selectedProductIds, 
        pendingBatchUpdate.operation, 
        pendingBatchUpdate.tagIds
      );
      if (res?.status === 'success') {
        const opText = pendingBatchUpdate.operation === 'add' ? '添加' : pendingBatchUpdate.operation === 'remove' ? '移除' : '替換';
        addToast({ type: 'success', message: `已批量${opText} ${res.data?.updated_count || selectedProductIds.length} 個商品的標籤` });
        setShowBatchUpdate(false);
        setSelectedProductIds([]);
        setOperation('add');
        setSelectedTagIds([]);
        setPendingBatchUpdate(null);
        loadProducts();
      } else {
        addToast({ type: 'error', message: res?.message || '批量更新失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '批量更新失敗' });
    } finally {
      setBatchUpdating(false);
      setPendingBatchUpdate(null);
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAllProducts = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.id));
    }
  };

  const toggleTagSelection = (tagId: number) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleSelectAllTags = () => {
    if (selectedTagIds.length === items.length) {
      setSelectedTagIds([]);
    } else {
      setSelectedTagIds(items.map((t: any) => t.id));
    }
  };

  const getOperationText = (op: 'add' | 'remove' | 'replace') => {
    return op === 'add' ? '添加' : op === 'remove' ? '移除' : '替換';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">標籤管理</h1>
        <button 
          onClick={() => setShowBatchUpdate(!showBatchUpdate)}
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
        >
          {showBatchUpdate ? '取消批量修改' : '批量修改商品標籤'}
        </button>
      </div>

      {showBatchUpdate && (
        <div className="border rounded p-4 bg-gray-50">
          <h2 className="font-medium mb-4">批量修改商品標籤</h2>
          
          <div className="mb-4">
            <label className="block text-sm mb-2">操作類型</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={operation}
              onChange={(e) => setOperation(e.target.value as 'add' | 'remove' | 'replace')}
            >
              <option value="add">添加標籤</option>
              <option value="remove">移除標籤</option>
              <option value="replace">替換標籤</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">選擇標籤</label>
            {items.length === 0 ? (
              <div className="text-sm text-gray-500">尚無標籤</div>
            ) : (
              <div className="border rounded p-2 max-h-32 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">已選擇 {selectedTagIds.length} 個標籤</span>
                  <button
                    onClick={toggleSelectAllTags}
                    className="text-xs text-blue-600"
                  >
                    {selectedTagIds.length === items.length ? '取消全選' : '全選'}
                  </button>
                </div>
                <div className="space-y-1">
                  {items.map((tag: any) => (
                    <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={() => toggleTagSelection(tag.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm">選擇商品</label>
              <button
                onClick={toggleSelectAllProducts}
                className="text-sm text-blue-600"
              >
                {selectedProductIds.length === products.length ? '取消全選' : '全選'}
              </button>
            </div>
            {loadingProducts ? (
              <div className="text-sm text-gray-500">載入中...</div>
            ) : (
              <div className="border rounded p-2 max-h-64 overflow-y-auto">
                {products.length === 0 ? (
                  <div className="text-sm text-gray-500">尚無商品</div>
                ) : (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          {product.name} 
                          {product.tags && product.tags.length > 0 && (
                            <span className="text-gray-500">({product.tags.map((t: any) => t.name).join(', ')})</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBatchUpdateTags}
              disabled={selectedProductIds.length === 0 || (selectedTagIds.length === 0 && operation !== 'remove') || batchUpdating}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
            >
              {batchUpdating ? '更新中...' : `批量${getOperationText(operation)} ${selectedProductIds.length} 個商品的標籤`}
            </button>
            <button
              onClick={() => {
                setShowBatchUpdate(false);
                setSelectedProductIds([]);
                setOperation('add');
                setSelectedTagIds([]);
              }}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="border rounded p-4">
        <h2 className="font-medium mb-2">{editing ? '編輯標籤' : '新增標籤'}</h2>
        <TagForm initial={editing || undefined} onSaved={() => { setEditing(null); load(); }} />
      </div>

      {loading ? (
        <div>載入中…</div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>名稱</Th>
              <Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <Td>{t.id}</Td>
                <Td>{t.name}</Td>
                <Td className="space-x-3">
                  <button className="text-blue-600" onClick={() => setEditing(t)}>編輯</button>
                  <button className="text-red-600" onClick={() => setPendingDelete(t.id)}>刪除</button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="刪除標籤"
        message="此操作無法復原，確定要刪除？"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => { if (pendingDelete) onDelete(pendingDelete); setPendingDelete(null); }}
      />

      <ConfirmModal
        open={pendingBatchUpdate !== null}
        title="批量修改商品標籤"
        message={`確定要${getOperationText(pendingBatchUpdate?.operation || 'add')} ${selectedProductIds.length} 個商品的標籤${pendingBatchUpdate?.tagIds.length ? `（${pendingBatchUpdate.tagIds.length} 個標籤）` : ''}嗎？`}
        onCancel={() => setPendingBatchUpdate(null)}
        onConfirm={confirmBatchUpdate}
      />
    </div>
  );
}


