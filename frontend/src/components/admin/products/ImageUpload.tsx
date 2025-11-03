"use client";

import React, { useState } from 'react';
import { uploadProductImage } from '@/lib/upload';
import { useToast } from '@/components/admin/feedback/ToastProvider';

export default function ImageUpload({ productId }: { productId: number }) {
  const { addToast } = useToast();
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      await uploadProductImage(productId, file);
      addToast({ type: 'success', message: '上傳成功' });
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '上傳失敗' });
    } finally {
      setBusy(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="border rounded p-4">
      <h2 className="font-medium mb-2">圖片上傳</h2>
      <input type="file" accept="image/*" onChange={onChange} disabled={busy} />
    </div>
  );
}


