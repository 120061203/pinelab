"use client";

import React, { useState, useEffect } from 'react';

export type Filters = {
  keywords?: string;
  category?: string; // 可輸入分類 ID 或名稱片段（MVP）
  tag?: string;      // 可輸入標籤 ID 或名稱片段（MVP）
  min_price?: string;
  max_price?: string;
};

export default function FilterBar({
  initial,
  onApply,
}: {
  initial?: Filters;
  onApply: (f: Filters) => void;
}) {
  const [keywords, setKeywords] = useState(initial?.keywords || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [tag, setTag] = useState(initial?.tag || "");
  const [minPrice, setMinPrice] = useState(initial?.min_price || "");
  const [maxPrice, setMaxPrice] = useState(initial?.max_price || "");

  useEffect(() => {
    // 同步 initial -> UI（在瀏覽器前/後導覽時）
    setKeywords(initial?.keywords || "");
    setCategory(initial?.category || "");
    setTag(initial?.tag || "");
    setMinPrice(initial?.min_price || "");
    setMaxPrice(initial?.max_price || "");
  }, [initial?.keywords, initial?.category, initial?.tag, initial?.min_price, initial?.max_price]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({ keywords, category, tag, min_price: minPrice, max_price: maxPrice });
  };

  const reset = () => {
    setKeywords("");
    setCategory("");
    setTag("");
    setMinPrice("");
    setMaxPrice("");
    onApply({});
  };

  return (
    <form onSubmit={submit} className="grid md:grid-cols-5 gap-2">
      <input
        className="border rounded px-3 py-2"
        placeholder="關鍵字"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="分類（ID/名稱片段）"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="標籤（ID/名稱片段）"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      />
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="最小價格"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          inputMode="decimal"
        />
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="最大價格"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          inputMode="decimal"
        />
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded" type="submit">套用</button>
        <button className="px-3 py-2 border rounded" type="button" onClick={reset}>重設</button>
      </div>
    </form>
  );
}


