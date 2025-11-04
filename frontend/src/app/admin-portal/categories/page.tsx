"use client";

import React, { useEffect, useState } from 'react';
import { adminGetCategories, adminDeleteCategory, adminBatchUpdateCategorySort } from '@/lib/admin-api';
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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">分類管理</h1>

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
              renderItem={(c) => (
                <>
                  <Td className="text-gray-400 cursor-grab active:cursor-grabbing">⋮⋮</Td>
                  <Td>{c.id}</Td>
                  <Td>{c.name}</Td>
                  <Td>{c.sort_order}</Td>
                  <Td>{c.is_active ? '啟用' : '停用'}</Td>
                  <Td className="space-x-3">
                    <button className="text-blue-600" onClick={() => setEditing(c)}>編輯</button>
                    <button className="text-red-600" onClick={() => setPendingDelete(c.id)}>刪除</button>
                  </Td>
                </>
              )}
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
    </div>
  );
}


