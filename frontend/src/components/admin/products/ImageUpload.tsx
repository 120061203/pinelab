"use client";

import React, { useState } from 'react';
import { uploadProductImage } from '@/lib/upload';
import { useToast } from '@/components/admin/feedback/ToastProvider';

export default function ImageUpload({ productId, onUploaded }: { productId: number; onUploaded?: () => void }) {
  const { addToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      await uploadProductImage(productId, file, { is_primary: isPrimary });
      addToast({ type: 'success', message: isPrimary ? '上傳成功並設為主圖' : '上傳成功' });
      // 上傳成功後觸發刷新
      if (onUploaded) {
        onUploaded();
      }
      // 清空 input 和 checkbox，允許再次上傳同一個檔案
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) input.value = '';
      setIsPrimary(false);
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '上傳失敗' });
    } finally {
      setBusy(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      // 驗證檔案類型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(f.type)) {
        addToast({ type: 'error', message: '不支援的檔案類型。請選擇 JPG、PNG、GIF 或 WebP 格式的圖片' });
        return;
      }
      // 驗證檔案大小（5MB）
      const maxSize = 5 * 1024 * 1024;
      if (f.size > maxSize) {
        addToast({ type: 'error', message: '檔案大小不能超過 5MB' });
        return;
      }
      onFile(f);
    }
  };

  return (
    <div className="border rounded p-4">
      <h2 className="font-medium mb-2">圖片上傳</h2>
      <input 
        type="file" 
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" 
        onChange={onChange} 
        disabled={busy} 
        aria-label="上傳商品圖片"
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <div className="mt-3 flex items-center gap-2">
        <input
          id="set-primary"
          type="checkbox"
          checked={isPrimary}
          onChange={(e) => setIsPrimary(e.target.checked)}
          disabled={busy}
          className="w-4 h-4"
        />
        <label htmlFor="set-primary" className="text-sm text-gray-700 cursor-pointer">
          設為主圖
        </label>
      </div>
      {busy && <p className="text-sm text-gray-500 mt-2">上傳中...</p>}
    </div>
  );
}


