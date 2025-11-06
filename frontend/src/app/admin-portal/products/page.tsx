"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminGetProducts, adminBatchUpdateProductSort, adminDeleteProduct, adminBatchUpdateProductStatus } from "@/lib/admin-api";
import { Table, Th, Td, Pagination } from "@/components/admin/table/Table";
import FilterBar, { Filters } from "@/components/admin/filters/FilterBar";
import { useUrlState } from "@/lib/url-state";
import SortableTableBody from "@/components/admin/dnd/SortableTableBody";
import { useToast } from "@/components/admin/feedback/ToastProvider";
import ConfirmModal from "@/components/admin/modals/ConfirmModal";

type ProductRow = {
  id: number;
  name: string;
  price: string | number;
  sort_order: number;
  is_active: boolean;
  updated_at?: string;
  category?: { id: number; name: string } | null;
  tags?: Array<{ id: number; name: string }>;
};

export default function AdminProductsPage() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { getAll, setAll } = useUrlState();
  const initQuery = getAll();
  const [search, setSearch] = useState(initQuery.keywords || "");
  const [filters, setFilters] = useState<Filters>({
    keywords: initQuery.keywords,
    category: initQuery.category,
    tag: initQuery.tag,
    min_price: initQuery.min_price,
    max_price: initQuery.max_price,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [showBatchUpdate, setShowBatchUpdate] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [batchOperation, setBatchOperation] = useState<'enable' | 'disable' | 'delete'>('enable');
  const [pendingBatchUpdate, setPendingBatchUpdate] = useState<{operation: 'enable' | 'disable' | 'delete'} | null>(null);
  const [batchUpdating, setBatchUpdating] = useState(false);

  const load = async (pageNum = 1, q = "", f: Filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await adminGetProducts({ page: pageNum, search: q, ...f });
      const data = res?.data || res?.results || res || [];
      const list = Array.isArray(data) ? data : (data?.results || []);
      // 確保 sort_order 存在，如果沒有則使用默認值
      const itemsWithSort = (list as ProductRow[]).map((item, index) => ({
        ...item,
        sort_order: item.sort_order ?? (list.length - index),
      }));
      setItems(itemsWithSort);
      const count = res?.count || data?.count || list.length;
      setTotalPages(Math.max(1, Math.ceil((count || 0) / 20)));
    } catch (e: any) {
      setError(e?.message || "載入失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page, search, filters); }, [page]);

  const onApplyFilters = (f: Filters) => {
    setFilters(f);
    setAll({ ...f, page: 1 });
    setPage(1);
    load(1, f.keywords || "", f);
  };

  const handleReorder = async (newItems: ProductRow[]) => {
    // 更新本地狀態
    setItems(newItems);
    
    // 準備批量更新數據：從最大到最小分配 sort_order
    const updateItems = newItems.map((item, index) => ({
      id: item.id,
      sort_order: newItems.length - index, // 第一個項目 sort_order 最大
    }));

    try {
      setSaving(true);
      const res = await adminBatchUpdateProductSort(updateItems);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '排序已更新' });
      } else {
        addToast({ type: 'error', message: res?.message || '更新排序失敗' });
        // 如果失敗，重新載入數據
        load(page, search, filters);
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '更新排序失敗' });
      // 如果失敗，重新載入數據
      load(page, search, filters);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res: any = await adminDeleteProduct(id);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '商品已刪除' });
        load(page, search, filters);
      } else {
        addToast({ type: 'error', message: res?.message || '刪除失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '刪除失敗' });
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
    if (selectedProductIds.length === items.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(items.map(p => p.id));
    }
  };

  const handleBatchUpdate = () => {
    if (selectedProductIds.length === 0) {
      addToast({ type: 'error', message: '請至少選擇一個商品' });
      return;
    }
    setPendingBatchUpdate({ operation: batchOperation });
  };

  const confirmBatchUpdate = async () => {
    if (!pendingBatchUpdate) return;
    
    setBatchUpdating(true);
    try {
      const res = await adminBatchUpdateProductStatus(
        selectedProductIds, 
        pendingBatchUpdate.operation
      );
      if (res?.status === 'success') {
        const opText = pendingBatchUpdate.operation === 'enable' ? '啟用' : 
                       pendingBatchUpdate.operation === 'disable' ? '停用' : '刪除';
        const data = res.data as { updated_count?: number } | undefined;
        addToast({ type: 'success', message: `已批量${opText} ${data?.updated_count || selectedProductIds.length} 個商品` });
        setShowBatchUpdate(false);
        setSelectedProductIds([]);
        setBatchOperation('enable');
        setPendingBatchUpdate(null);
        load(page, search, filters);
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

  const getOperationText = (op: 'enable' | 'disable' | 'delete') => {
    return op === 'enable' ? '啟用' : op === 'disable' ? '停用' : '刪除';
  };

  // 格式化價格：移除不必要的小數點
  const formatPrice = (price: string | number): string => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return String(price);
    // 如果是整數，不顯示小數點；否則保留小數部分
    return num % 1 === 0 ? num.toString() : num.toString();
  };

  // 格式化日期時間
  const formatDateTime = (dateStr?: string): string => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      // 格式：YYYY-MM-DD HH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBatchUpdate(!showBatchUpdate)}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
          >
            {showBatchUpdate ? '取消批量修改' : '批量修改'}
          </button>
          <Link href="/admin-portal/products/new" className="px-3 py-2 bg-black text-white rounded text-sm">新增商品</Link>
        </div>
      </div>

      {showBatchUpdate && (
        <div className="border rounded p-4 bg-gray-50">
          <h2 className="font-medium mb-4">批量修改商品</h2>
          
          <div className="mb-4">
            <label className="block text-sm mb-2">操作類型</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={batchOperation}
              onChange={(e) => setBatchOperation(e.target.value as 'enable' | 'disable' | 'delete')}
            >
              <option value="enable">啟用商品</option>
              <option value="disable">停用商品</option>
              <option value="delete">刪除商品</option>
            </select>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm">選擇商品</label>
              <button
                onClick={toggleSelectAllProducts}
                className="text-sm text-blue-600"
              >
                {selectedProductIds.length === items.length ? '取消全選' : '全選'}
              </button>
            </div>
            <div className="border rounded p-2 max-h-64 overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-sm text-gray-500">尚無商品</div>
              ) : (
                <div className="space-y-2">
                  {items.map((product) => (
                    <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        {product.name} (ID: {product.id})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBatchUpdate}
              disabled={selectedProductIds.length === 0 || batchUpdating}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
            >
              {batchUpdating ? '更新中...' : `批量${getOperationText(batchOperation)} ${selectedProductIds.length} 個商品`}
            </button>
            <button
              onClick={() => {
                setShowBatchUpdate(false);
                setSelectedProductIds([]);
                setBatchOperation('enable');
              }}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <FilterBar initial={filters} onApply={onApplyFilters} />

      {loading ? (
        <div>載入中…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          {saving && (
            <div className="text-sm text-gray-600">正在保存排序...</div>
          )}
          <Table>
            <thead>
              <tr>
                {showBatchUpdate && <Th><input type="checkbox" checked={selectedProductIds.length === items.length && items.length > 0} onChange={toggleSelectAllProducts} className="w-4 h-4" /></Th>}
                <Th>排序</Th>
                <Th>ID</Th>
                <Th>名稱</Th>
                <Th>價格</Th>
                <Th>分類</Th>
                <Th>標籤</Th>
                <Th>更新時間</Th>
                <Th>狀態</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <SortableTableBody
              items={items}
              onReorder={handleReorder}
              getItemId={(item) => item.id}
              renderItem={(p, index, dragHandleProps) => {
                // 如果沒有提供 dragHandleProps，使用整個行拖動（向後兼容）
                if (!dragHandleProps) {
                  return (
                    <>
                      {showBatchUpdate && (
                        <Td>
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(p.id)}
                            onChange={() => toggleProductSelection(p.id)}
                            className="w-4 h-4"
                          />
                        </Td>
                      )}
                      <Td className="text-gray-400 cursor-grab active:cursor-grabbing">⋮⋮</Td>
                      <Td>{p.id}</Td>
                      <Td>{p.name}</Td>
                      <Td>{formatPrice(p.price)}</Td>
                      <Td>{p.category?.name || '-'}</Td>
                      <Td>{p.tags && p.tags.length > 0 ? p.tags.map(t => t.name).join(', ') : '-'}</Td>
                      <Td>{formatDateTime(p.updated_at)}</Td>
                      <Td>{p.is_active ? '啟用' : '停用'}</Td>
                      <Td className="space-x-3">
                        <Link href={`/admin-portal/products/${p.id}`} className="text-blue-600">編輯</Link>
                        <button 
                          className="text-red-600 hover:underline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDelete(p.id);
                          }}
                        >
                          刪除
                        </button>
                      </Td>
                    </>
                  );
                }
                // 使用拖動手柄
                const { listeners, attributes } = dragHandleProps;
                return (
                  <>
                    {showBatchUpdate && (
                      <Td>
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(p.id)}
                          onChange={() => toggleProductSelection(p.id)}
                          className="w-4 h-4"
                        />
                      </Td>
                    )}
                    <Td 
                      className="text-gray-400 cursor-grab active:cursor-grabbing select-none" 
                      {...listeners}
                      {...attributes}
                      style={{ touchAction: 'none' }}
                    >
                      ⋮⋮
                    </Td>
                    <Td>{p.id}</Td>
                    <Td>{p.name}</Td>
                    <Td>{formatPrice(p.price)}</Td>
                    <Td>{p.category?.name || '-'}</Td>
                    <Td>{p.tags && p.tags.length > 0 ? p.tags.map(t => t.name).join(', ') : '-'}</Td>
                    <Td>{formatDateTime(p.updated_at)}</Td>
                    <Td>{p.is_active ? '啟用' : '停用'}</Td>
                    <Td className="space-x-3">
                      <Link href={`/admin-portal/products/${p.id}`} className="text-blue-600">編輯</Link>
                      <button 
                        className="text-red-600 hover:underline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDelete(p.id);
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
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="刪除商品"
        message="此操作無法復原，確定要刪除？"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => { if (pendingDelete) handleDelete(pendingDelete); setPendingDelete(null); }}
      />

      <ConfirmModal
        open={pendingBatchUpdate !== null}
        title="批量修改商品"
        message={`確定要${getOperationText(pendingBatchUpdate?.operation || 'enable')} ${selectedProductIds.length} 個商品嗎？`}
        onCancel={() => setPendingBatchUpdate(null)}
        onConfirm={confirmBatchUpdate}
      />
    </div>
  );
}


