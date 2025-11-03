"use client";

import React, { useEffect, useState } from 'react';
import { adminGetTags, adminDeleteTag } from '@/lib/admin-api';
import { Table, Th, Td } from '@/components/admin/table/Table';
import TagForm from '@/components/admin/dicts/TagForm';
import { useToast } from '@/components/admin/feedback/ToastProvider';

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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">標籤管理</h1>

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
                  <button className="text-red-600" onClick={() => onDelete(t.id)}>刪除</button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}


