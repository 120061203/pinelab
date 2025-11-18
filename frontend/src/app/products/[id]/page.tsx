/**
 * 商品詳情頁
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProduct, getSiteSettings, ApiResponse } from '@/lib/api';
import { Product } from '@/types/product';
import { SiteSettings } from '@/types/site-settings';
import RelatedProducts from '@/components/RelatedProducts';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id ? parseInt(params.id as string) : null;
  const [product, setProduct] = useState<Product | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setError('無效的商品 ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, siteSettingsRes] = await Promise.all([
          getProduct(productId) as Promise<ApiResponse<Product>>,
          getSiteSettings() as Promise<ApiResponse<SiteSettings>>,
        ]);
        
        if (productRes.status === 'success' && productRes.data) {
          setProduct(productRes.data);
        } else {
          setError('無法載入商品資訊');
        }
        
        if (siteSettingsRes.status === 'success' && siteSettingsRes.data) {
          setSiteSettings(siteSettingsRes.data);
        }
      } catch (err) {
        setError('載入商品時發生錯誤');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error || '商品不存在'}</p>
        </div>
      </div>
    );
  }

  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const otherImages = product.images?.filter(img => img.id !== primaryImage?.id) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 商品圖片 */}
        <div>
          {primaryImage && (
            <div className="mb-4">
              <img
                src={primaryImage.full_url || primaryImage.image_url}
                alt={product.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          
          {otherImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {otherImages.map((image) => (
                <img
                  key={image.id}
                  src={image.full_url || image.image_url}
                  alt={`${product.name} - 圖片 ${image.id}`}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
        
        {/* 商品資訊 */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {siteSettings?.show_price && (
            <div className="mb-6">
              <span className="text-3xl font-bold text-primary">
                NT$ {product.price}
              </span>
            </div>
          )}
          
          {product.category && (
            <div className="mb-4">
              <span className="text-sm text-gray-600">分類：</span>
              <span className="ml-2">{product.category.name}</span>
            </div>
          )}
          
          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <span className="text-sm text-gray-600">標籤：</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">商品描述</h2>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 相關商品推薦 */}
      <RelatedProducts productId={product.id} />
    </div>
  );
}

