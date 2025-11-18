/**
 * Footer 元件
 * 顯示品牌資訊和外部連結
 */
'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings, ApiResponse } from '@/lib/api';
import { SiteSettings } from '@/types/site-settings';
import Link from 'next/link';

export default function Footer() {
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

  const brandName = siteSettings?.brand_name || '松果創意 pinelab';
  const brandSlogan = siteSettings?.brand_slogan || '提供優質的商品與服務';

  // 使用新的 external_links 格式
  const externalLinks = siteSettings?.external_links || [];

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* 品牌資訊 */}
          <div>
            <h3 className="text-2xl font-bold mb-4">{brandName}</h3>
            <p className="text-gray-400 leading-relaxed">{brandSlogan}</p>
          </div>
          
          {/* 快速連結 */}
          <div>
            <h4 className="text-sm font-semibold mb-6 uppercase tracking-wider text-gray-300">快速連結</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  首頁
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  商品列表
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  聯絡我們
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 外部連結 */}
          {externalLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-6 uppercase tracking-wider text-gray-300">關注我們</h4>
              <div className="flex flex-col gap-3">
                {externalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 版權資訊 */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
