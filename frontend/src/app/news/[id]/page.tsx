/**
 * 最新消息詳細頁面
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getNews } from '@/lib/api';
import { News } from '@/types/news';
import { ApiResponse } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import Link from 'next/link';

export default function NewsDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('無效的消息 ID');
      setLoading(false);
      return;
    }

    const loadNews = async () => {
      try {
        setLoading(true);
        const response = await getNews() as ApiResponse<News[]>;
        if (response.status === 'success' && response.data) {
          const newsItem = response.data.find((item) => item.id === parseInt(id));
          if (newsItem) {
            setNews(newsItem);
          } else {
            setError('找不到該消息');
          }
        } else {
          setError('載入失敗');
        }
      } catch (e: any) {
        setError(e?.message || '載入失敗');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-red-600">{error || '找不到該消息'}</div>
        <div className="text-center mt-4">
          <Link href="/" className="text-blue-600 hover:underline">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← 返回首頁
        </Link>
        
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {news.image_url && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={getImageUrl(news.image_url) || ''}
                alt={news.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{news.title}</h1>
            
            <div className="text-sm text-gray-500 mb-6">
              {new Date(news.publish_date).toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {news.content}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

