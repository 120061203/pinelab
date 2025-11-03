"use client";

import React, { useEffect, useState } from 'react';
import { Table, Th, Td, Pagination } from '@/components/admin/table/Table';
import { adminGetContacts, adminGetContact, adminMarkContactRead, adminMarkContactUnread } from '@/lib/admin-api';
import ContactDetail from '@/components/admin/contacts/ContactDetail';
import { useToast } from '@/components/admin/feedback/ToastProvider';

type Contact = { id: number; name: string; email: string; is_read: boolean; created_at: string };

export default function AdminContactsPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await adminGetContacts({ page: p });
      if (res?.status === 'success') {
        const data = res.data || res.results || [];
        setItems(data as Contact[]);
        const count = res.count || data.length;
        setTotalPages(Math.max(1, Math.ceil(count / 20)));
      } else setError(res?.message || '載入失敗');
    } catch (e: any) {
      setError(e?.message || '載入失敗');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page]);

  const toggleRead = async (c: Contact) => {
    try {
      if (c.is_read) {
        await adminMarkContactUnread(c.id);
        addToast({ type: 'success', message: '已標記未讀' });
      } else {
        await adminMarkContactRead(c.id);
        addToast({ type: 'success', message: '已標記已讀' });
      }
      load(page);
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '操作失敗' });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">聯絡表單</h1>

      {loading ? (
        <div>載入中…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>姓名</Th>
                <Th>Email</Th>
                <Th>狀態</Th>
                <Th>時間</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <Td>{c.id}</Td>
                  <Td>{c.name}</Td>
                  <Td>{c.email}</Td>
                  <Td>{c.is_read ? '已讀' : '未讀'}</Td>
                  <Td>{new Date(c.created_at).toLocaleString()}</Td>
                  <Td className="space-x-3">
                    <button className="text-blue-600" onClick={() => setSelectedId(c.id)}>查看</button>
                    <button className="text-black" onClick={() => toggleRead(c)}>{c.is_read ? '標記未讀' : '標記已讀'}</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}

      {selectedId && (
        <ContactDetail id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}


