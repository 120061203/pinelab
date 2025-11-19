"use client";

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { NewsImage } from '@/types/news';
import { getImageUrl } from '@/lib/image-utils';

// 動態導入 react-markdown（避免 SSR 問題）
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
const remarkGfm = require('remark-gfm');

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  images: NewsImage[];
  onImagesChange: (images: NewsImage[]) => void;
  onImageUpload: (files: File[]) => Promise<NewsImage[]>;
  placeholder?: string;
  rows?: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  images,
  onImagesChange,
  onImageUpload,
  placeholder = '輸入 Markdown 內容...',
  rows = 20,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    setUploading(true);
    try {
      const uploadedImages = await onImageUpload(fileArray);
      const newImages = [...images, ...uploadedImages];
      onImagesChange(newImages);
      
      // 在游標位置插入圖片 Markdown
      const imageMarkdown = uploadedImages
        .map((img) => `![${img.alt || ''}](${img.url})`)
        .join('\n\n');
      
      // 簡單插入到內容末尾（實際應該插入到游標位置，但需要更複雜的實現）
      onChange(value + (value ? '\n\n' : '') + imageMarkdown);
    } catch (error) {
      console.error('圖片上傳失敗:', error);
      alert('圖片上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  const insertImageAtCursor = (image: NewsImage) => {
    const imageMarkdown = `![${image.alt || ''}](${image.url})`;
    // 簡單插入到內容末尾
    onChange(value + (value ? '\n\n' : '') + imageMarkdown);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* 工具列 */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            {showPreview ? '編輯' : '預覽'}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? '上傳中...' : '上傳圖片'}
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Markdown 語法支援
        </div>
      </div>

      {/* 圖片上傳輸入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        onChange={(e) => handleImageUpload(e.target.files)}
        className="hidden"
      />

      {/* 已上傳的圖片列表 */}
      {images.length > 0 && (
        <div className="border rounded p-4 bg-gray-50">
          <div className="text-sm font-medium mb-2">已上傳的圖片 ({images.length})</div>
          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={getImageUrl(image.url) || ''}
                  alt={image.alt || `圖片 ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertImageAtCursor(image)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    title="插入到內容中"
                  >
                    插入
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    title="刪除圖片"
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 編輯器/預覽 */}
      <div className="border rounded">
        {showPreview ? (
          <div className="p-4 min-h-[400px] prose max-w-none">
            <MarkdownPreview content={value} images={images} />
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 border-0 rounded focus:outline-none focus:ring-0 font-mono text-sm"
            style={{ minHeight: `${rows * 1.5}rem` }}
          />
        )}
      </div>
    </div>
  );
}

// Markdown 預覽組件
function MarkdownPreview({ content, images }: { content: string; images: NewsImage[] }) {
  
  // 處理圖片 URL（將相對路徑轉換為完整 URL）
  const processContent = (text: string) => {
    let processed = text;
    images.forEach((image) => {
      const imageUrl = getImageUrl(image.url) || image.url;
      processed = processed.replace(
        new RegExp(`!\\[([^\\]]*)\\]\\(${image.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
        `![$1](${imageUrl})`
      );
    });
    return processed;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        img: ({ node, ...props }: any) => (
          <img
            {...props}
            className="max-w-full h-auto rounded my-4"
            alt={props.alt || ''}
          />
        ),
        p: ({ node, ...props }: any) => <p {...props} className="mb-4" />,
        h1: ({ node, ...props }: any) => <h1 {...props} className="text-3xl font-bold mb-4 mt-6" />,
        h2: ({ node, ...props }: any) => <h2 {...props} className="text-2xl font-bold mb-3 mt-5" />,
        h3: ({ node, ...props }: any) => <h3 {...props} className="text-xl font-bold mb-2 mt-4" />,
        ul: ({ node, ...props }: any) => <ul {...props} className="list-disc list-inside mb-4" />,
        ol: ({ node, ...props }: any) => <ol {...props} className="list-decimal list-inside mb-4" />,
        li: ({ node, ...props }: any) => <li {...props} className="mb-1" />,
        code: ({ node, inline, ...props }: any) =>
          inline ? (
            <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm" />
          ) : (
            <code {...props} className="block bg-gray-100 p-4 rounded mb-4 overflow-x-auto" />
          ),
        blockquote: ({ node, ...props }: any) => (
          <blockquote {...props} className="border-l-4 border-gray-300 pl-4 italic my-4" />
        ),
      }}
    >
      {processContent(content)}
    </ReactMarkdown>
  );
}

