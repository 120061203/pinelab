"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminGetNewsItem, adminCreateNews, adminUpdateNews } from '@/lib/admin-api';
import { News, NewsCreateRequest, NewsUpdateRequest } from '@/types/news';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import { getImageUrl } from '@/lib/image-utils';

export default function AdminNewsEditPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const id = params?.id as string | undefined;
  const isNew = !id || id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publish_date: new Date().toISOString().split('T')[0],
    status: 'draft' as 'draft' | 'published',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      load();
    }
  }, [id, isNew]);

  const load = async () => {
    if (!id || id === 'new') {
      setLoading(false);
      return;
    }
    const newsId = parseInt(id);
    if (isNaN(newsId)) {
      setLoading(false);
      addToast({ type: 'error', message: '無效的消息 ID' });
      return;
    }
    setLoading(true);
    try {
      const res: any = await adminGetNewsItem(newsId);
      if (res?.status === 'success' && res.data) {
        setFormData({
          title: res.data.title,
          content: res.data.content,
          publish_date: res.data.publish_date,
          status: res.data.status || 'draft',
        });
        if (res.data.image_url) {
          setCurrentImageUrl(res.data.image_url);
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
        const createData: NewsCreateRequest = {
          title: formData.title,
          content: formData.content,
          publish_date: formData.publish_date,
          status: formData.status,
          image: imageFile || null,
        };
        const res: any = await adminCreateNews(createData);
        if (res?.status === 'success') {
          addToast({ type: 'success', message: '已建立最新消息' });
          router.push('/admin-portal/news');
        } else {
          addToast({ type: 'error', message: res?.message || '建立失敗' });
        }
      } else {
        const updateData: NewsUpdateRequest = {
          title: formData.title,
          content: formData.content,
          publish_date: formData.publish_date,
          status: formData.status,
          image: imageFile || undefined,
        };
        if (!id || id === 'new') {
          addToast({ type: 'error', message: '無效的消息 ID' });
          return;
        }
        const newsId = parseInt(id);
        if (isNaN(newsId)) {
          addToast({ type: 'error', message: '無效的消息 ID' });
          return;
        }
        const res: any = await adminUpdateNews(newsId, updateData);
        if (res?.status === 'success') {
          addToast({ type: 'success', message: '已更新最新消息' });
          router.push('/admin-portal/news');
        } else {
          addToast({ type: 'error', message: res?.message || '更新失敗' });
        }
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '儲存失敗' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">載入中...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{isNew ? '新增最新消息' : '編輯最新消息'}</h1>
      
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
              maxLength={200}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">內容 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={10}
              required
              maxLength={5000}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">圖片 (JPG/PNG/WEBP, ≤5MB)</label>
            {currentImageUrl && !imageFile && (
              <div className="mb-2">
                <img src={getImageUrl(currentImageUrl) || ''} alt="Current Image" className="h-32 w-auto mb-2 rounded" />
              </div>
            )}
            {imageFile && (
              <div className="mb-2">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-32 w-auto mb-2 rounded" />
              </div>
            )}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                if (file) {
                  setCurrentImageUrl(URL.createObjectURL(file));
                }
              }}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">發布日期 *</label>
            <input
              type="date"
              value={formData.publish_date}
              onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">狀態</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="draft">草稿</option>
              <option value="published">已發布</option>
            </select>
          </div>
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

