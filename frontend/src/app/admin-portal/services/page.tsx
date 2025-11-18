"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminGetServices, adminDeleteService } from '@/lib/admin-api';
import { Service } from '@/types/service';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import ConfirmModal from '@/components/admin/modals/ConfirmModal';

export default function AdminServicesPage() {
  const { addToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await adminGetServices();
      if (res?.status === 'success') {
        setServices(res.data || []);
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '載入失敗' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res: any = await adminDeleteService(id);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '已刪除服務項目' });
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

  if (loading) {
    return <div className="p-6">載入中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">服務項目</h1>
        <Link
          href="/admin-portal/services/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新增服務
        </Link>
      </div>

      {/* 服務列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">標題</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">圖標</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排序</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  尚無服務項目
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    <Link
                      href={`/admin-portal/services/${service.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {service.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {service.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.icon_type ? (
                      <span className="px-2 py-1 text-xs rounded bg-gray-100">
                        {service.icon_type === 'fontawesome' ? 'Font Awesome' : 
                         service.icon_type === 'material' ? 'Material Icons' : '自訂'}
                      </span>
                    ) : (
                      <span className="text-gray-400">無</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin-portal/services/${service.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      編輯
                    </Link>
                    <button
                      onClick={() => setPendingDelete(service.id)}
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
        message="確定要刪除這個服務項目嗎？此操作無法復原。"
      />
    </div>
  );
}

