/**
 * 首頁
 * 顯示品牌介紹和最新商品
 */
'use client';

import { useEffect, useState } from 'react';
import { getProducts, ApiResponse } from '@/lib/api';
import { ProductListItem, PaginatedResponse } from '@/types/product';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 取得最新 6 個商品
    const fetchLatestProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({
          sort: 'updated_at',
          page_size: 6,
        }) as ApiResponse<PaginatedResponse<ProductListItem>>;
        
        if (response.status === 'success' && response.data) {
          setProducts(response.data.results || []);
        } else {
          setError('無法載入商品');
        }
      } catch (err) {
        setError('載入商品時發生錯誤');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 品牌介紹 */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">松果創意 pinelab</h1>
        <p className="text-lg text-gray-600">
          歡迎來到松果創意，我們提供優質的商品與服務
        </p>
      </section>

      {/* 最新商品 */}
      <section>
        <h2 className="text-2xl font-bold mb-6">最新商品</h2>
        
        {loading && (
          <div className="text-center py-8">
            <p>載入中...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-8">
            <p>目前沒有商品</p>
          </div>
        )}
        
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

