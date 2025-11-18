/**
 * 最新消息區塊元件
 */
'use client';

import { News } from '@/types/news';
import { getImageUrl } from '@/lib/image-utils';
import Link from 'next/link';

interface NewsSectionProps {
  news: News[];
  limit?: number;
}

export default function NewsSection({ news, limit = 5 }: NewsSectionProps) {
  if (!news || news.length === 0) {
    return null;
  }

  const displayedNews = news.slice(0, limit);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">最新消息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedNews.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block cursor-pointer"
            >
              {item.image_url && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={getImageUrl(item.image_url) || ''}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // 圖片載入失敗時隱藏圖片容器
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                <p className="text-sm text-gray-500">
                  {new Date(item.publish_date).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

