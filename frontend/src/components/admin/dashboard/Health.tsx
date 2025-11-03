"use client";

import React from 'react';

export default function Health({ health }: { health: { products_no_image?: number; products_no_category?: number; products_tag_coverage_ratio?: number } }) {
  const rows = [
    { k: '無圖片商品', v: health.products_no_image ?? 0 },
    { k: '未分類商品', v: health.products_no_category ?? 0 },
    { k: '標籤覆蓋率', v: `${Math.round((health.products_tag_coverage_ratio ?? 0) * 100)}%` },
  ];
  return (
    <div className="border rounded p-4 bg-white">
      <h3 className="font-medium mb-2">內容健康度</h3>
      <ul className="text-sm space-y-1">
        {rows.map((r) => (
          <li key={r.k} className="flex items-center justify-between">
            <span className="text-gray-500">{r.k}</span>
            <span className="font-medium">{r.v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


