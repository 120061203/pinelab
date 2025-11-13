"use client";

import React, { useMemo, useState } from 'react';
import { adminDeleteProductImage, adminSetPrimaryImage, adminBatchUpdateProductImageSort } from '@/lib/admin-api';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import SortableList from '@/components/admin/dnd/SortableList';

export default function ImageManager({ product, onChanged }: { product: any; onChanged: () => void }) {
  const { addToast } = useToast();
  const images = useMemo(() => {
    const imgs = product?.images || [];
    // 按 sort_order 排序
    return [...imgs].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [product]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [localImages, setLocalImages] = useState(images);

  // 當 images 變化時更新本地狀態
  React.useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const onDelete = async (imageId: number) => {
    try {
      setBusyId(imageId);
      await adminDeleteProductImage(product.id, imageId);
      addToast({ type: 'success', message: '已刪除圖片' });
      onChanged();
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '刪除失敗' });
    } finally {
      setBusyId(null);
    }
  };

  const onSetPrimary = async (imageId: number) => {
    try {
      setBusyId(imageId);
      await adminSetPrimaryImage(product.id, imageId);
      addToast({ type: 'success', message: '已設為主圖' });
      onChanged();
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '設定失敗' });
    } finally {
      setBusyId(null);
    }
  };

  const handleReorder = async (newImages: any[]) => {
    // 更新本地狀態
    setLocalImages(newImages);
    
    // 準備批量更新數據：從最小到最大分配 sort_order
    const updateItems = newImages.map((img, index) => ({
      id: img.id,
      sort_order: index + 1, // 從 1 開始
    }));

    try {
      setSaving(true);
      const res = await adminBatchUpdateProductImageSort(product.id, updateItems);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '排序已更新' });
        onChanged(); // 重新載入商品數據
      } else {
        addToast({ type: 'error', message: res?.message || '更新排序失敗' });
        // 如果失敗，恢復原狀態
        setLocalImages(images);
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '更新排序失敗' });
      // 如果失敗，恢復原狀態
      setLocalImages(images);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded p-4">
      <h2 className="font-medium mb-2">圖片管理</h2>
      {saving && (
        <div className="text-sm text-gray-600 mb-2">正在保存排序...</div>
      )}
      {localImages.length === 0 ? (
        <div className="text-sm text-gray-600">尚無圖片</div>
      ) : (
        <SortableList
          items={localImages}
          onReorder={handleReorder}
          getItemId={(img) => img.id}
          strategy="grid"
          renderItem={(img: any) => {
            // 構建完整的圖片 URL
            let imageUrl = img.full_url || img.image_url;
            // 如果是相對路徑，添加 API base URL
            if (imageUrl && imageUrl.startsWith('/')) {
              const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
              imageUrl = `${apiBase}${imageUrl}`;
            }
            return (
              <div className="border rounded p-2 space-y-2 bg-white">
                <div className="relative cursor-grab active:cursor-grabbing">
                  <img 
                    src={imageUrl} 
                    alt={`商品圖片 ${img.id}`} 
                    className="w-full h-36 object-cover rounded pointer-events-none"
                    onError={(e) => {
                      // 如果圖片載入失敗，顯示佔位圖
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E無圖片%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {img.sort_order || 0}
                  </div>
                  {img.is_primary && (
                    <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                      主圖
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {!img.is_primary && (
                      <button
                        disabled={busyId===img.id || saving}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetPrimary(img.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-xs px-2 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                      >
                        設為主圖
                      </button>
                    )}
                  </div>
                  <button 
                    disabled={busyId===img.id || saving} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(img.id);
                    }}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 px-2 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    {busyId===img.id ? '處理中...' : '刪除'}
                  </button>
                </div>
              </div>
            );
          }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
        />
      )}
    </div>
  );
}


