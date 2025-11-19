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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">最新消息</h2>
          <div className="w-24 h-1 bg-gray-900 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedNews.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-gray-300 transition-all duration-300 hover:shadow-xl block cursor-pointer group"
            >
              {item.images && item.images.length > 0 && (
                <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <img
                    src={getImageUrl(item.images[0].url) || ''}
                    alt={item.images[0].alt || item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-6 space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {new Date(item.publish_date).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <h3 className="text-xl font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-gray-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {item.content}
                </p>
                <div className="pt-2 flex items-center text-gray-400 group-hover:text-gray-600 transition-colors">
                  <span className="text-sm">閱讀更多</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

