'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getNewsBySlug } from '@/lib/api';
import { News } from '@/types/news';
import { ApiResponse } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import Link from 'next/link';

// 動態導入 react-markdown（避免 SSR 問題）
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

export default function NewsDetailPage() {
  const params = useParams();
  const year = params?.year as string;
  const month = params?.month as string;
  const day = params?.day as string;
  const slug = params?.slug as string;
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!year || !month || !day || !slug) {
      setError('無效的 URL 參數');
      setLoading(false);
      return;
    }

    const loadNews = async () => {
      try {
        setLoading(true);
        const response = await getNewsBySlug(year, month, day, slug);
        console.log('Page loadNews response:', response);
        if (response.status === 'success' && response.data) {
          setNews(response.data);
        } else {
          setError('找不到該消息');
        }
      } catch (e: any) {
        console.error('Page loadNews error:', e);
        setError(e?.message || '載入失敗');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [year, month, day, slug]);

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
          {news && news.images && news.images.length > 0 && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={getImageUrl(news.images[0].url) || ''}
                alt={news.images[0].alt || news.title}
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
              <MarkdownContent content={news.content} images={news.images || []} />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

// Markdown 內容渲染組件
function MarkdownContent({ content, images }: { content: string; images: any[] }) {
  const [remarkGfmPlugin, setRemarkGfmPlugin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 動態載入 remark-gfm
  useEffect(() => {
    let mounted = true;
    import('remark-gfm')
      .then((module) => {
        if (mounted) {
          // remark-gfm 導出為 default，是一個函數
          const plugin = module.default;
          if (plugin) {
            setRemarkGfmPlugin(plugin);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load remark-gfm:', err);
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const processContent = (text: string) => {
    if (!text) return '';
    let processed = text;
    images.forEach((image) => {
      if (image && image.url) {
        const imageUrl = getImageUrl(image.url) || image.url;
        processed = processed.replace(
          new RegExp(`!\\[([^\\]]*)\\]\\(${image.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
          `![$1](${imageUrl})`
        );
      }
    });
    return processed;
  };

  if (loading) {
    return <div className="p-4 text-gray-500">載入中...</div>;
  }

  // 使用 useMemo 來穩定插件引用
  const plugins = useMemo(() => {
    if (!remarkGfmPlugin) return [];
    if (typeof remarkGfmPlugin === 'function') {
      return [remarkGfmPlugin];
    }
    return [];
  }, [remarkGfmPlugin]);

  return (
    <ReactMarkdown
      remarkPlugins={plugins}
      components={{
        img: ({ node, ...props }: any) => (
          <img
            {...props}
            className="max-w-full h-auto rounded my-4"
            alt={props.alt || ''}
          />
        ),
        p: ({ node, ...props }: any) => <p {...props} className="mb-4 leading-relaxed" />,
        h1: ({ node, ...props }: any) => <h1 {...props} className="text-3xl font-bold mb-4 mt-6" />,
        h2: ({ node, ...props }: any) => <h2 {...props} className="text-2xl font-bold mb-3 mt-5" />,
        h3: ({ node, ...props }: any) => <h3 {...props} className="text-xl font-bold mb-2 mt-4" />,
        ul: ({ node, ...props }: any) => <ul {...props} className="list-disc list-inside mb-4 space-y-1" />,
        ol: ({ node, ...props }: any) => <ol {...props} className="list-decimal list-inside mb-4 space-y-1" />,
        li: ({ node, ...props }: any) => <li {...props} className="mb-1" />,
        code: ({ node, inline, ...props }: any) =>
          inline ? (
            <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" />
          ) : (
            <code {...props} className="block bg-gray-100 p-4 rounded mb-4 overflow-x-auto font-mono text-sm" />
          ),
        blockquote: ({ node, ...props }: any) => (
          <blockquote {...props} className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700" />
        ),
        a: ({ node, ...props }: any) => (
          <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
        ),
      }}
    >
      {processContent(content)}
    </ReactMarkdown>
  );
}

