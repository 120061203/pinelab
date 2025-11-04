"use client";

import React, { useMemo, useState } from 'react';
import { adminDeleteProductImage } from '@/lib/admin-api';
import { useToast } from '@/components/admin/feedback/ToastProvider';

export default function ImageManager({ product, onChanged }: { product: any; onChanged: () => void }) {
  const { addToast } = useToast();
  const images = useMemo(() => product?.images || [], [product]);
  const [busyId, setBusyId] = useState<number | null>(null);

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

  return (
    <div className="border rounded p-4">
      <h2 className="font-medium mb-2">圖片管理</h2>
      {images.length === 0 ? (
        <div className="text-sm text-gray-600">尚無圖片</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img: any) => {
            // 構建完整的圖片 URL
            let imageUrl = img.full_url || img.image_url;
            // 如果是相對路徑，添加 API base URL
            if (imageUrl && imageUrl.startsWith('/')) {
              const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
              imageUrl = `${apiBase}${imageUrl}`;
            }
            return (
              <div key={img.id} className="border rounded p-2 space-y-2">
                <img 
                  src={imageUrl} 
                  alt={`商品圖片 ${img.id}`} 
                  className="w-full h-36 object-cover rounded"
                  onError={(e) => {
                    // 如果圖片載入失敗，顯示佔位圖
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E無圖片%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="flex items-center justify-between text-sm">
                  <span className={img.is_primary ? 'text-blue-600 font-medium' : ''}>
                    {img.is_primary ? '主圖' : ''}
                  </span>
                  <button 
                    disabled={busyId===img.id} 
                    onClick={() => onDelete(img.id)} 
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    {busyId===img.id ? '刪除中...' : '刪除'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


