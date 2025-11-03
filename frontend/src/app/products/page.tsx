/**
 * 商品列表頁
 */
'use client';

import { useEffect, useState } from 'react';
import { getProducts, getCategories, getTags, ApiResponse } from '@/lib/api';
import { ProductListItem, PaginatedResponse, ProductListParams } from '@/types/product';
import { Category } from '@/types/category';
import { Tag } from '@/types/tag';
import ProductCard from '@/components/ProductCard';
import ProductFilter from '@/components/ProductFilter';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductListParams>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 載入分類和標籤
    const loadCategoriesAndTags = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          getCategories() as Promise<ApiResponse<Category[]>>,
          getTags() as Promise<ApiResponse<Tag[]>>,
        ]);
        
        if (categoriesRes.status === 'success' && categoriesRes.data) {
          setCategories(categoriesRes.data as Category[]);
        }
        if (tagsRes.status === 'success' && tagsRes.data) {
          setTags(tagsRes.data as Tag[]);
        }
      } catch (err) {
        console.error('載入分類或標籤失敗', err);
      }
    };

    loadCategoriesAndTags();
  }, []);

  useEffect(() => {
    // 載入商品列表
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = { ...filters };
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        const response = await getProducts(params) as ApiResponse<PaginatedResponse<ProductListItem>>;
        
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

    loadProducts();
  }, [filters, searchQuery]);

  const handleFilterChange = (newFilters: ProductListParams) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">商品列表</h1>
      
      {/* 篩選器 */}
      <ProductFilter
        categories={categories}
        tags={tags}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />
      
      {/* 商品列表 */}
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
          <p>沒有符合條件的商品</p>
        </div>
      )}
      
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

