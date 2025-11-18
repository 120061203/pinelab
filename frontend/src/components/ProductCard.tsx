/**
 * 商品卡片元件
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductListItem } from '@/types/product';
import { getSiteSettings, ApiResponse } from '@/lib/api';
import { SiteSettings } from '@/types/site-settings';

interface ProductCardProps {
  product: ProductListItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await getSiteSettings() as ApiResponse<SiteSettings>;
        if (response.status === 'success' && response.data) {
          setSiteSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  const showPrice = siteSettings?.show_price ?? true;

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
        {/* 商品圖片 */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0">
          {product.primary_image ? (
            <img
              src={product.primary_image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-full h-full flex items-center justify-center text-gray-400 text-sm"
            style={{ display: product.primary_image ? 'none' : 'flex' }}
          >
            無圖片
          </div>
        </div>
        
        {/* 商品資訊 */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="space-y-3 flex-grow">
            {product.category && (
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {product.category.name}
              </div>
            )}
            
            <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-gray-700 transition-colors">
              {product.name}
            </h3>
            
            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
            {showPrice && (
              <span className="text-xl font-bold text-gray-900">
                NT$ {product.price?.toLocaleString()}
              </span>
            )}
            {!showPrice && <span></span>}
            
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
          
          {/* Tag 區域：固定高度，即使沒有 tag 也保留空間 */}
          <div className="h-6 mt-2 flex items-start">
            {product.tags && product.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

