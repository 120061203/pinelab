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
          {images.map((img: any) => (
            <div key={img.id} className="border rounded p-2 space-y-2">
              <img src={img.full_url || img.image_url} alt="img" className="w-full h-36 object-cover rounded" />
              <div className="flex items-center justify-between text-sm">
                <span>{img.is_primary ? '主圖' : ''}</span>
                <button disabled={busyId===img.id} onClick={() => onDelete(img.id)} className="text-red-600">刪除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


