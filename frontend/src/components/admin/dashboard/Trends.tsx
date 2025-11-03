"use client";

import React from 'react';

export default function Trends({ data }: { data: { products_created_daily?: number[]; contacts_created_daily?: number[] } }) {
  // MVP：以簡單條列顯示；後續可替換圖表庫
  const p = data.products_created_daily || [];
  const c = data.contacts_created_daily || [];
  return (
    <div className="border rounded p-4 bg-white space-y-3">
      <h3 className="font-medium">30 天趨勢</h3>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-gray-500 mb-1">商品建立（每日）</div>
          <div className="grid grid-cols-10 gap-1">
            {p.map((v, i) => (
              <div key={i} className="bg-black/80 text-white text-center" style={{ height: 8 + v * 8 }}>{v}</div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">聯絡提交（每日）</div>
          <div className="grid grid-cols-10 gap-1">
            {c.map((v, i) => (
              <div key={i} className="bg-blue-700 text-white text-center" style={{ height: 8 + v * 8 }}>{v}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


