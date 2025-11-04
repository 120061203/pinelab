"use client";

import React from 'react';

export default function Cards({ totals }: { totals: { products?: number; categories?: number; tags?: number; contacts_unread?: number } }) {
  const items = [
    { label: '商品', value: totals.products ?? 0 },
    { label: '分類', value: totals.categories ?? 0 },
    { label: '標籤', value: totals.tags ?? 0 },
    { label: '未讀聯絡', value: totals.contacts_unread ?? 0 },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.label} className="border rounded p-4 bg-white">
          <div className="text-gray-500 text-sm">{it.label}</div>
          <div className="text-2xl font-semibold text-gray-900">{it.value}</div>
        </div>
      ))}
    </div>
  );
}


