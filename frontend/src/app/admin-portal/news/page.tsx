"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminGetNews, adminDeleteNews, adminToggleNewsStatus } from '@/lib/admin-api';
import { News } from '@/types/news';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import ConfirmModal from '@/components/admin/modals/ConfirmModal';

export default function AdminNewsPage() {
  const { addToast } = useToast();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'draft' | 'published' | 'all'>('all');

  useEffect(() => {
    load();
  }, [statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res: any = await adminGetNews(params);
      if (res?.status === 'success') {
        setNews(res.data || []);
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '載入失敗' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res: any = await adminDeleteNews(id);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '已刪除最新消息' });
        load();
      } else {
        addToast({ type: 'error', message: res?.message || '刪除失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '刪除失敗' });
    } finally {
      setPendingDelete(null);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
      const res: any = await adminToggleNewsStatus(id, newStatus);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: `已${newStatus === 'published' ? '發布' : '設為草稿'}` });
        load();
      } else {
        addToast({ type: 'error', message: res?.message || '更新失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '更新失敗' });
    }
  };

  if (loading) {
    return <div className="p-6">載入中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">最新消息</h1>
        <Link
          href="/admin-portal/news/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新增消息
        </Link>
      </div>

      {/* 篩選器 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-md ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          全部
        </button>
        <button
          onClick={() => setStatusFilter('published')}
          className={`px-4 py-2 rounded-md ${statusFilter === 'published' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          已發布
        </button>
        <button
          onClick={() => setStatusFilter('draft')}
          className={`px-4 py-2 rounded-md ${statusFilter === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          草稿
        </button>
      </div>

      {/* 消息列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">標題</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">發布日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {news.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  尚無最新消息
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin-portal/news/${item.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.publish_date).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'published' ? '已發布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin-portal/news/${item.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      編輯
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(item.id, item.status || 'draft')}
                      className="text-orange-600 hover:underline"
                    >
                      {item.status === 'published' ? '設為草稿' : '發布'}
                    </button>
                    <button
                      onClick={() => setPendingDelete(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={pendingDelete !== null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            handleDelete(pendingDelete);
          }
        }}
        title="確認刪除"
        message="確定要刪除這則最新消息嗎？此操作無法復原。"
      />
    </div>
  );
}

