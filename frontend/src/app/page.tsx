/**
 * 首頁
 * 顯示品牌介紹和按分類分組的最新商品
 */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getProducts, getCategories, getSiteSettings, getNews, getServices, ApiResponse } from '@/lib/api';
import { ProductListItem, PaginatedResponse } from '@/types/product';
import { Category } from '@/types/category';
import { SiteSettings } from '@/types/site-settings';
import { News } from '@/types/news';
import { Service } from '@/types/service';
import ProductCard from '@/components/ProductCard';
import HeroSection from '@/components/HeroSection';
import NewsSection from '@/components/NewsSection';
import ServicesSection from '@/components/ServicesSection';

// 商品分組類型
type ProductGroup = {
  category: Category | null; // null 表示未分類
  products: ProductListItem[];
};

export default function HomePage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 載入分類和商品
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 並行載入所有資料
        const [categoriesRes, productsRes, siteSettingsRes, newsRes, servicesRes] = await Promise.all([
          getCategories() as Promise<ApiResponse<Category[]>>,
          getProducts({
            sort: 'sort_order', // 按 sort_order 排序，然後按 updated_at
            page_size: 100, // 載入足夠的商品以便分組
          }) as Promise<ApiResponse<PaginatedResponse<ProductListItem>>>,
          getSiteSettings() as Promise<ApiResponse<SiteSettings>>,
          getNews(5) as Promise<ApiResponse<News[]>>,
          getServices() as Promise<ApiResponse<Service[]>>,
        ]);
        
        if (categoriesRes.status === 'success' && categoriesRes.data) {
          setCategories(categoriesRes.data as Category[]);
        }
        
        if (productsRes.status === 'success' && productsRes.data) {
          setProducts(productsRes.data.results || []);
        } else {
          setError('無法載入商品');
        }
        
        if (siteSettingsRes.status === 'success' && siteSettingsRes.data) {
          setSiteSettings(siteSettingsRes.data);
        }
        
        if (newsRes.status === 'success' && newsRes.data) {
          setNews(newsRes.data);
        }
        
        if (servicesRes.status === 'success' && servicesRes.data) {
          setServices(servicesRes.data);
        }
      } catch (err) {
        setError('載入商品時發生錯誤');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      // 商品按 sort_order 降序排列（數字越大越前），然後按 updated_at 降序
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

  return (
    <div>
      {/* Hero Section */}
      <HeroSection siteSettings={siteSettings} />
      
      <div className="container mx-auto px-6 py-16">
        {/* 品牌介紹 */}
        {siteSettings?.brand_name && !siteSettings?.hero_banner_url && (
          <section className="mb-20 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
              {siteSettings.brand_name}
            </h1>
            {siteSettings.brand_slogan && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {siteSettings.brand_slogan}
              </p>
            )}
          </section>
        )}
        
        {/* 服務項目 */}
        <ServicesSection services={services} />
        
        {/* 最新消息 */}
        <NewsSection news={news} />

      {/* 按分類分組的商品 */}
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
          <p>目前沒有商品</p>
        </div>
      )}
      
      {!loading && !error && productGroups.length > 0 && (
        <div className="space-y-20 mt-20">
          {productGroups.map((group) => (
            <section key={group.category?.id || 'uncategorized'} className="space-y-8">
              {/* 分類標題 */}
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                  {group.category ? group.category.name : '未分類'}
                </h2>
                {group.category?.description && (
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    {group.category.description}
                  </p>
                )}
              </div>
              
              {/* 該分類下的商品 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {group.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

