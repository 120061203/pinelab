"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminGetService, adminCreateService, adminUpdateService } from '@/lib/admin-api';
import { Service, ServiceCreateRequest, ServiceUpdateRequest } from '@/types/service';
import { useToast } from '@/components/admin/feedback/ToastProvider';

export default function AdminServiceEditPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const id = params?.id as string | undefined;
  const isNew = id === 'new' || !id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ServiceCreateRequest>({
    title: '',
    description: '',
    icon_type: undefined,
    icon_value: '',
    sort_order: 0,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [currentIconUrl, setCurrentIconUrl] = useState<string | null>(null);

  useEffect(() => {
    // 新增模式，不需要載入
    if (isNew) {
      setLoading(false);
      return;
    }
    
    // 編輯模式：必須有有效的 ID
    if (!id) {
      setLoading(false);
      return;
    }
    
    // 檢查 ID 是否為有效數字
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      addToast({ type: 'error', message: '無效的服務項目 ID' });
      router.push('/admin-portal/services');
      setLoading(false);
      return;
    }
    
    load(numericId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const load = async (serviceId: number) => {
    setLoading(true);
    try {
      const res: any = await adminGetService(serviceId);
      if (res?.status === 'success' && res.data) {
        setFormData({
          title: res.data.title,
          description: res.data.description,
          icon_type: res.data.icon_type || undefined,
          icon_value: res.data.icon_value || '',
          sort_order: res.data.sort_order || 0,
        });
        if (res.data.icon_type === 'custom' && res.data.icon_value) {
          setCurrentIconUrl(res.data.icon_value);
        }
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '載入失敗' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const createData: ServiceCreateRequest = {
          title: formData.title,
          description: formData.description,
          icon_type: formData.icon_type,
          icon_value: formData.icon_value || undefined,
          icon_file: iconFile || undefined,
          sort_order: formData.sort_order,
        };
        const res: any = await adminCreateService(createData);
        if (res?.status === 'success') {
          addToast({ type: 'success', message: '已建立服務項目' });
          router.push('/admin-portal/services');
        } else {
          addToast({ type: 'error', message: res?.message || '建立失敗' });
        }
      } else {
        if (!id || isNew) {
          addToast({ type: 'error', message: '無效的服務項目 ID' });
          return;
        }
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
          addToast({ type: 'error', message: '無效的服務項目 ID' });
          return;
        }
        const updateData: ServiceUpdateRequest = {
          title: formData.title,
          description: formData.description,
          icon_type: formData.icon_type,
          icon_value: formData.icon_value || undefined,
          icon_file: iconFile || undefined,
          sort_order: formData.sort_order,
        };
        const res: any = await adminUpdateService(numericId, updateData);
        if (res?.status === 'success') {
          addToast({ type: 'success', message: '已更新服務項目' });
          router.push('/admin-portal/services');
        } else {
          addToast({ type: 'error', message: res?.message || '更新失敗' });
        }
      }
    } catch (e: any) {
      console.error('Service save error:', e);
      const errorMessage = e?.response?.data?.message || e?.message || '儲存失敗';
      addToast({ type: 'error', message: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">載入中...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{isNew ? '新增服務項目' : '編輯服務項目'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">標題 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
              maxLength={100}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">描述 *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
              required
              maxLength={500}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">圖標類型</label>
            <select
              value={formData.icon_type || ''}
              onChange={(e) => {
                const value = e.target.value || undefined;
                setFormData({ 
                  ...formData, 
                  icon_type: value as 'fontawesome' | 'material' | 'custom' | undefined,
                  icon_value: value ? formData.icon_value : '',
                });
                if (!value) {
                  setIconFile(null);
                  setCurrentIconUrl(null);
                }
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">無圖標</option>
              <option value="fontawesome">Font Awesome</option>
              <option value="material">Material Icons</option>
              <option value="custom">自訂圖標</option>
            </select>
          </div>
          
          {formData.icon_type === 'fontawesome' && (
            <div>
              <label className="block text-sm font-medium mb-2">Font Awesome 圖標名稱</label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={formData.icon_value}
                  onChange={(e) => setFormData({ ...formData, icon_value: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="例如: fa-home"
                />
                {formData.icon_value && (
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-50 border border-gray-200 rounded-lg">
                    <i 
                      className={`fa ${
                        formData.icon_value.startsWith('fa-') 
                          ? formData.icon_value 
                          : `fa-${formData.icon_value}`
                      } text-2xl text-blue-600`}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {formData.icon_type === 'material' && (
            <div>
              <label className="block text-sm font-medium mb-2">Material Icons 圖標名稱</label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={formData.icon_value}
                  onChange={(e) => setFormData({ ...formData, icon_value: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="例如: home"
                />
                {formData.icon_value && (
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-50 border border-gray-200 rounded-lg">
                    <span 
                      className="material-icons text-2xl text-blue-600"
                      style={{ fontFamily: 'Material Icons' }}
                    >
                      {formData.icon_value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {formData.icon_type === 'custom' && (
            <div>
              <label className="block text-sm font-medium mb-2">自訂圖標檔案 (SVG/PNG, ≤1MB)</label>
              {currentIconUrl && !iconFile && (
                <div className="mb-2">
                  <img src={currentIconUrl} alt="Current Icon" className="h-12 w-12 mb-2" />
                </div>
              )}
              <input
                type="file"
                accept=".svg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setIconFile(file);
                  if (file) {
                    setCurrentIconUrl(URL.createObjectURL(file));
                  }
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}
          
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '儲存中...' : '儲存'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

