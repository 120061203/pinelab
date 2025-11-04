"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetProduct, adminDeleteProduct } from '@/lib/admin-api';
import ProductForm from '@/components/admin/products/ProductForm';
import ImageUpload from '@/components/admin/products/ImageUpload';
import ImageManager from '@/components/admin/products/ImageManager';

export default function ProductEditPage() {
  const params = useParams();
  const productId = params?.id ? parseInt(params.id as string) : null;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const res: any = await adminGetProduct(productId);
      if (res?.status === 'success' && res.data) setProduct(res.data);
      else setError(res?.message || '載入失敗');
    } catch (e: any) {
      setError(e?.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  if (!productId) return <div>無效的商品 ID</div>;
  if (loading) return <div>載入中…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">編輯商品 #{productId}</h1>
      <ProductForm initial={product} productId={productId} />
      <div className="grid md:grid-cols-2 gap-6">
        <ImageUpload productId={productId} onUploaded={loadProduct} />
        <ImageManager product={product} onChanged={loadProduct} />
      </div>
    </div>
  );
}


