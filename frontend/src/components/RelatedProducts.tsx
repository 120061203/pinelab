/**
 * 相關商品推薦元件
 */
'use client';

import { useEffect, useState } from 'react';
import { getProduct, ApiResponse } from '@/lib/api';
import { Product, ProductListItem, PaginatedResponse } from '@/types/product';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  productId: number;
}

export default function RelatedProducts({ productId }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        // 調用後端相關商品 API
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/products/${productId}/related/`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setRelatedProducts(data.data);
        }
      } catch (err) {
        console.error('載入相關商品失敗', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId]);

  if (loading || relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">相關商品</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

