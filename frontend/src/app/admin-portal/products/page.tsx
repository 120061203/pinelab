"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminGetProducts, adminBatchUpdateProductSort } from "@/lib/admin-api";
import { Table, Th, Td, Pagination } from "@/components/admin/table/Table";
import FilterBar, { Filters } from "@/components/admin/filters/FilterBar";
import { useUrlState } from "@/lib/url-state";
import SortableTableBody from "@/components/admin/dnd/SortableTableBody";
import { useToast } from "@/components/admin/feedback/ToastProvider";

type ProductRow = {
  id: number;
  name: string;
  price: string | number;
  sort_order: number;
  is_active: boolean;
  updated_at?: string;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin-portal/products/new" className="px-3 py-2 bg-black text-white rounded text-sm">新增商品</Link>
      </div>

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
                <Th>排序</Th>
                <Th>ID</Th>
                <Th>名稱</Th>
                <Th>價格</Th>
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
                      <Td className="text-gray-400 cursor-grab active:cursor-grabbing">⋮⋮</Td>
                      <Td>{p.id}</Td>
                      <Td>{p.name}</Td>
                      <Td>{p.price}</Td>
                      <Td>{p.is_active ? '啟用' : '停用'}</Td>
                      <Td>
                        <Link href={`/admin-portal/products/${p.id}`} className="text-blue-600">編輯</Link>
                      </Td>
                    </>
                  );
                }
                // 使用拖動手柄
                const { listeners, attributes } = dragHandleProps;
                return (
                  <>
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
                    <Td>{p.price}</Td>
                    <Td>{p.is_active ? '啟用' : '停用'}</Td>
                    <Td>
                      <Link href={`/admin-portal/products/${p.id}`} className="text-blue-600">編輯</Link>
                    </Td>
                  </>
                );
              }}
            />
          </Table>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}


