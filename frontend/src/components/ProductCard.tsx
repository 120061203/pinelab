/**
 * 商品卡片元件
 */
import Link from 'next/link';
import { ProductListItem } from '@/types/product';

interface ProductCardProps {
  product: ProductListItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* 商品圖片 */}
        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
          {product.primary_image ? (
            <img
              src={product.primary_image}
              alt={product.name}
              className="w-full h-48 object-cover"
              loading="lazy"
              onError={(e) => {
                // 圖片載入失敗時顯示預設圖片
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-full h-48 flex items-center justify-center text-gray-400"
            style={{ display: product.primary_image ? 'none' : 'flex' }}
          >
            無圖片
          </div>
        </div>
        
        {/* 商品資訊 */}
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
          
          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              NT$ {product.price}
            </span>
            
            {product.category && (
              <span className="text-sm text-gray-500">
                {product.category.name}
              </span>
            )}
          </div>
          
          {product.tags && product.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

