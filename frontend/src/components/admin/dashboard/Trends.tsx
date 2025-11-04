"use client";

import React from 'react';

export default function Trends({ data }: { data: { products_created_daily?: number[]; contacts_created_daily?: number[] } }) {
  // MVP：以簡單條列顯示；後續可替換圖表庫
  const p = data.products_created_daily || [];
  const c = data.contacts_created_daily || [];
  
  // 計算最大值以用於相對高度
  const maxP = Math.max(...p, 1);
  const maxC = Math.max(...c, 1);
  
  return (
    <div className="border rounded p-4 bg-white space-y-3">
      <h3 className="font-medium">30 天趨勢</h3>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500 mb-2">商品建立（每日）</div>
          <div className="flex items-end gap-1 h-32 pb-5">
            {p.map((v, i) => {
              const heightPercent = Math.max((v / maxP) * 100, v > 0 ? 5 : 0);
              return (
                <div
                  key={i}
                  className="flex-1 bg-gray-800 rounded-t relative flex flex-col items-center justify-end"
                  style={{ 
                    height: v > 0 ? `${heightPercent}%` : '4px',
                    minHeight: v > 0 ? '20px' : '4px'
                  }}
                  title={`第 ${i + 1} 天：${v} 個商品`}
                >
                  {v > 0 ? (
                    <span className="text-white text-xs font-medium mb-1">{v}</span>
                  ) : (
                    <span className="absolute -top-5 text-gray-700 text-[10px] font-medium">{v}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-2">聯絡提交（每日）</div>
          <div className="flex items-end gap-1 h-32 pb-5">
            {c.map((v, i) => {
              const heightPercent = Math.max((v / maxC) * 100, v > 0 ? 5 : 0);
              return (
                <div
                  key={i}
                  className="flex-1 bg-blue-600 rounded-t relative flex flex-col items-center justify-end"
                  style={{ 
                    height: v > 0 ? `${heightPercent}%` : '4px',
                    minHeight: v > 0 ? '20px' : '4px'
                  }}
                  title={`第 ${i + 1} 天：${v} 個聯絡`}
                >
                  {v > 0 ? (
                    <span className="text-white text-xs font-medium mb-1">{v}</span>
                  ) : (
                    <span className="absolute -top-5 text-gray-700 text-[10px] font-medium">{v}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


