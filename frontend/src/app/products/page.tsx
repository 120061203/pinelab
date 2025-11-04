/**
 * 商品列表頁
 * 按分類分組顯示商品
 */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getProducts, getCategories, getTags, ApiResponse } from '@/lib/api';
import { ProductListItem, PaginatedResponse, ProductListParams } from '@/types/product';
import { Category } from '@/types/category';
import { Tag } from '@/types/tag';
import ProductCard from '@/components/ProductCard';
import ProductFilter from '@/components/ProductFilter';

// 商品分組類型
type ProductGroup = {
  category: Category | null; // null 表示未分類
  products: ProductListItem[];
};

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
    // 載入商品列表（不分頁，載入所有商品以便分組）
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params: ProductListParams = { 
          ...filters,
          page_size: 1000, // 載入足夠多的商品
        };
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

  // 按分類分組商品
  const productGroups = useMemo(() => {
    const groups: ProductGroup[] = [];
    const categoryMap = new Map<number, Category>();
    
    // 建立分類映射
    categories.forEach(cat => {
      categoryMap.set(cat.id, cat);
    });

    // 按分類分組
    const categoryGroups = new Map<number | 'uncategorized', ProductListItem[]>();
    
    products.forEach(product => {
      const categoryId = product.category?.id || 'uncategorized';
      if (!categoryGroups.has(categoryId)) {
        categoryGroups.set(categoryId, []);
      }
      categoryGroups.get(categoryId)!.push(product);
    });

    // 轉換為 ProductGroup 陣列
    categoryGroups.forEach((productList, categoryId) => {
      // 商品按 sort_order 降序排列（數字越大越前）
      const sortedProducts = [...productList].sort((a, b) => {
        if (b.sort_order !== a.sort_order) {
          return b.sort_order - a.sort_order;
        }
        // 如果 sort_order 相同，按 updated_at 降序
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      const category = categoryId === 'uncategorized' 
        ? null 
        : categoryMap.get(categoryId as number) || null;
      
      groups.push({
        category,
        products: sortedProducts,
      });
    });

    // 分類區塊按分類的 sort_order 降序排列（數字越大越前）
    groups.sort((a, b) => {
      const aSortOrder = a.category?.sort_order ?? -1; // 未分類排在最後
      const bSortOrder = b.category?.sort_order ?? -1;
      if (bSortOrder !== aSortOrder) {
        return bSortOrder - aSortOrder;
      }
      // 如果 sort_order 相同，按分類名稱排序
      const aName = a.category?.name || '未分類';
      const bName = b.category?.name || '未分類';
      return aName.localeCompare(bName, 'zh-TW');
    });

    return groups;
  }, [products, categories]);

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
      
      {/* 商品列表 - 按分類分組顯示 */}
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
      
      {!loading && !error && productGroups.length === 0 && (
        <div className="text-center py-8">
          <p>沒有符合條件的商品</p>
        </div>
      )}
      
      {!loading && !error && productGroups.length > 0 && (
        <div className="space-y-12">
          {productGroups.map((group, groupIndex) => (
            <section key={group.category?.id || 'uncategorized'} className="space-y-4">
              {/* 分類標題 */}
              <h2 className="text-2xl font-bold border-b pb-2">
                {group.category ? group.category.name : '未分類'}
                {group.category?.description && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    {group.category.description}
                  </span>
                )}
              </h2>
              
              {/* 該分類下的商品 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

