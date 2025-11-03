"use client";

import React, { useEffect, useState } from 'react';
import { adminGetContact } from '@/lib/admin-api';

export default function ContactDetail({ id, onClose }: { id: number; onClose: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await adminGetContact(id);
        if (res?.status === 'success' && res.data) setDetail(res.data);
        else setError(res?.message || '載入失敗');
      } catch (e: any) { setError(e?.message || '載入失敗'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow w-full max-w-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">聯絡詳情 #{id}</h2>
          <button onClick={onClose} className="text-sm">關閉</button>
        </div>
        {loading ? (
          <div>載入中…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : detail ? (
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-500">姓名：</span>{detail.name}</div>
            <div><span className="text-gray-500">Email：</span>{detail.email}</div>
            <div><span className="text-gray-500">時間：</span>{new Date(detail.created_at).toLocaleString()}</div>
            <div>
              <div className="text-gray-500 mb-1">訊息：</div>
              <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded border">{detail.message}</pre>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}


