"use client";

import React from 'react';
import ProductForm from '@/components/admin/products/ProductForm';

export default function ProductNewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">新增商品</h1>
      <ProductForm />
    </div>
  );
}


