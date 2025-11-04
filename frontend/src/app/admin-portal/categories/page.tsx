"use client";

import React, { useEffect, useState, useRef } from 'react';
import { adminGetCategories, adminDeleteCategory, adminBatchUpdateCategorySort, adminGetProducts, adminBatchUpdateProductCategory } from '@/lib/admin-api';
import { Table, Th, Td } from '@/components/admin/table/Table';
import CategoryForm from '@/components/admin/dicts/CategoryForm';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import ConfirmModal from '@/components/admin/modals/ConfirmModal';
import SortableTableBody from '@/components/admin/dnd/SortableTableBody';

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await adminGetCategories();
      if (res?.status === 'success') {
        const data = res.data || res.results || [];
        // 確保 sort_order 存在
        const itemsWithSort = data.map((item: any, index: number) => ({
          ...item,
          sort_order: item.sort_order ?? (data.length - index),
        }));
        setItems(itemsWithSort);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const onDelete = async (id: number) => {
    try {
      const res: any = await adminDeleteCategory(id);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '已刪除分類' });
        load();
      } else {
        addToast({ type: 'error', message: res?.message || '刪除失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '刪除失敗' });
    }
  };

  const handleReorder = async (newItems: any[]) => {
    // 更新本地狀態
    setItems(newItems);
    
    // 準備批量更新數據：從最大到最小分配 sort_order
    const updateItems = newItems.map((item, index) => ({
      id: item.id,
      sort_order: newItems.length - index, // 第一個項目 sort_order 最大
    }));

    try {
      setSaving(true);
      const res = await adminBatchUpdateCategorySort(updateItems);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '排序已更新' });
      } else {
        addToast({ type: 'error', message: res?.message || '更新排序失敗' });
        // 如果失敗，重新載入數據
        load();
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '更新排序失敗' });
      // 如果失敗，重新載入數據
      load();
    } finally {
      setSaving(false);
    }
  };

  // 批量修改商品分類功能
  const [showBatchUpdate, setShowBatchUpdate] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [targetCategoryId, setTargetCategoryId] = useState<number | null>(null);
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [pendingBatchUpdate, setPendingBatchUpdate] = useState<number | null>(null);

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

  const handleBatchUpdateCategory = async () => {
    if (selectedProductIds.length === 0) {
      addToast({ type: 'error', message: '請至少選擇一個商品' });
      return;
    }
    setPendingBatchUpdate(targetCategoryId);
  };

  const confirmBatchUpdate = async () => {
    // pendingBatchUpdate 可以是 null（清空分類）或分類 ID
    const categoryId = pendingBatchUpdate === null ? null : pendingBatchUpdate;
    
    setBatchUpdating(true);
    try {
      const res = await adminBatchUpdateProductCategory(selectedProductIds, categoryId);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: `已批量更新 ${res.data?.updated_count || selectedProductIds.length} 個商品的分類` });
        setShowBatchUpdate(false);
        setSelectedProductIds([]);
        setTargetCategoryId(null);
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

  const toggleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">分類管理</h1>
        <button 
          onClick={() => setShowBatchUpdate(!showBatchUpdate)}
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
        >
          {showBatchUpdate ? '取消批量修改' : '批量修改商品分類'}
        </button>
      </div>

      {showBatchUpdate && (
        <div className="border rounded p-4 bg-gray-50">
          <h2 className="font-medium mb-4">批量修改商品分類</h2>
          
          <div className="mb-4">
            <label className="block text-sm mb-2">目標分類</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={targetCategoryId || ''}
              onChange={(e) => setTargetCategoryId(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">無分類（清空分類）</option>
              {items.filter((c: any) => c.is_active !== false).map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm">選擇商品</label>
              <button
                onClick={toggleSelectAll}
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
                        <span className="text-sm">{product.name} {product.category ? `(${product.category.name})` : '(無分類)'}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBatchUpdateCategory}
              disabled={selectedProductIds.length === 0 || batchUpdating}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
            >
              {batchUpdating ? '更新中...' : `批量更新 ${selectedProductIds.length} 個商品`}
            </button>
            <button
              onClick={() => {
                setShowBatchUpdate(false);
                setSelectedProductIds([]);
                setTargetCategoryId(null);
              }}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="border rounded p-4">
        <h2 className="font-medium mb-2">{editing ? '編輯分類' : '新增分類'}</h2>
        <CategoryForm initial={editing || undefined} onSaved={() => { setEditing(null); load(); }} />
      </div>

      {loading ? (
        <div>載入中…</div>
      ) : (
        <>
          {saving && (
            <div className="text-sm text-gray-600">正在保存排序...</div>
          )}
          <Table>
            <thead>
              <tr>
                <Th>排序</Th>
                <Th>ID</Th>
                <Th>名稱</Th>
                <Th>排序值</Th>
                <Th>狀態</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <SortableTableBody
              items={items}
              onReorder={handleReorder}
              getItemId={(item) => item.id}
              renderItem={(c, index, dragHandleProps) => {
                if (!dragHandleProps) {
                  return null;
                }
                const { listeners, attributes } = dragHandleProps;
                // 過濾 attributes，只保留必要的，避免影響游標
                const handleAttributes: any = {};
                if (attributes.role) handleAttributes.role = attributes.role;
                if (attributes.tabIndex !== undefined) handleAttributes.tabIndex = attributes.tabIndex;
                if (attributes['aria-describedby']) handleAttributes['aria-describedby'] = attributes['aria-describedby'];
                
                // 使用 Td 組件並添加拖動手柄標記
                
                return (
                  <>
                    <Td 
                      className="text-gray-400 select-none" 
                      data-drag-handle="true"
                      {...listeners}
                      {...handleAttributes}
                      style={{ 
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        cursor: 'grab',
                      } as React.CSSProperties}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.currentTarget.style.cursor = 'grabbing';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.cursor = 'grab';
                      }}
                    >
                      ⋮⋮
                    </Td>
                    <Td style={{ cursor: 'default' }}>{c.id}</Td>
                    <Td style={{ cursor: 'default' }}>{c.name}</Td>
                    <Td style={{ cursor: 'default' }}>{c.sort_order}</Td>
                    <Td style={{ cursor: 'default' }}>{c.is_active ? '啟用' : '停用'}</Td>
                    <Td className="space-x-3" style={{ cursor: 'default' }}>
                      <button 
                        className="text-blue-600 hover:underline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(c);
                        }}
                      >
                        編輯
                      </button>
                      <button 
                        className="text-red-600 hover:underline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDelete(c.id);
                        }}
                      >
                        刪除
                      </button>
                    </Td>
                  </>
                );
              }}
            />
          </Table>
        </>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="刪除分類"
        message="此操作無法復原，確定要刪除？"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => { if (pendingDelete) onDelete(pendingDelete); setPendingDelete(null); }}
      />

      <ConfirmModal
        open={pendingBatchUpdate !== null || pendingBatchUpdate === 0}
        title="批量修改商品分類"
        message={`確定要將 ${selectedProductIds.length} 個商品${targetCategoryId ? `移動到「${items.find((c: any) => c.id === targetCategoryId)?.name || ''}」分類` : '清空分類'}嗎？`}
        onCancel={() => setPendingBatchUpdate(null)}
        onConfirm={confirmBatchUpdate}
      />
    </div>
  );
}


