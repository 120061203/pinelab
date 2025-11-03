"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminGetProducts } from "@/lib/admin-api";
import { Table, Th, Td, Pagination } from "@/components/admin/table/Table";

type ProductRow = {
  id: number;
  name: string;
  price: string | number;
  is_active: boolean;
  updated_at?: string;
};

export default function AdminProductsPage() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (pageNum = 1, q = "") => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await adminGetProducts({ page: pageNum, search: q });
      if (res?.status === "success") {
        const data = res.data || res.results || [];
        setItems(data as ProductRow[]);
        const count = res.count || data.length;
        setTotalPages(Math.max(1, Math.ceil(count / 20)));
      } else {
        setError(res?.message || "載入失敗");
      }
    } catch (e: any) {
      setError(e?.message || "載入失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page, search); }, [page]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin-portal/products/new" className="px-3 py-2 bg-black text-white rounded text-sm">新增商品</Link>
      </div>

      <form onSubmit={onSearch} className="flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋名稱" className="border rounded px-3 py-2" />
        <button className="px-3 py-2 border rounded" type="submit">搜尋</button>
      </form>

      {loading ? (
        <div>載入中…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>名稱</Th>
                <Th>價格</Th>
                <Th>狀態</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <Td>{p.id}</Td>
                  <Td>{p.name}</Td>
                  <Td>{p.price}</Td>
                  <Td>{p.is_active ? '啟用' : '停用'}</Td>
                  <Td>
                    <Link href={`/admin-portal/products/${p.id}`} className="text-blue-600">編輯</Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}


