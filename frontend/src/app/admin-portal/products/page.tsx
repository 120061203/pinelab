"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminGetProducts } from "@/lib/admin-api";
import { Table, Th, Td, Pagination } from "@/components/admin/table/Table";
import FilterBar, { Filters } from "@/components/admin/filters/FilterBar";
import { useUrlState } from "@/lib/url-state";

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
  const { getAll, setAll } = useUrlState();
  const initQuery = getAll();
  const [search, setSearch] = useState(initQuery.keywords || "");
  const [filters, setFilters] = useState<Filters>({
    keywords: initQuery.keywords,
    category: initQuery.category,
    tag: initQuery.tag,
    min_price: initQuery.min_price,
    max_price: initQuery.max_price,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (pageNum = 1, q = "", f: Filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await adminGetProducts({ page: pageNum, search: q, ...f });
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

  useEffect(() => { load(page, search, filters); }, [page]);

  const onApplyFilters = (f: Filters) => {
    setFilters(f);
    setAll({ ...f, page: 1 });
    setPage(1);
    load(1, f.keywords || "", f);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin-portal/products/new" className="px-3 py-2 bg-black text-white rounded text-sm">新增商品</Link>
      </div>

      <FilterBar initial={filters} onApply={onApplyFilters} />

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


