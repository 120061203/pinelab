/**
 * Navigation 元件
 * 顯示 Logo 和導航連結
 */
'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings, ApiResponse } from '@/lib/api';
import { SiteSettings } from '@/types/site-settings';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/image-utils';

export default function Navigation() {
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
  const logoUrl = siteSettings?.logo_url;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              (() => {
                const fullLogoUrl = getImageUrl(logoUrl);
                if (!fullLogoUrl) return <span className="text-2xl font-bold text-gray-900">{brandName}</span>;
                return fullLogoUrl.startsWith('http') ? (
                  <img
                    src={fullLogoUrl}
                    alt={brandName}
                    className="h-12 w-auto transition-opacity group-hover:opacity-80"
                  />
                ) : (
                  <Image
                    src={fullLogoUrl}
                    alt={brandName}
                    width={140}
                    height={48}
                    className="h-12 w-auto object-contain transition-opacity group-hover:opacity-80"
                    priority
                  />
                );
              })()
            ) : (
              <span className="text-2xl font-bold text-gray-900">{brandName}</span>
            )}
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm uppercase tracking-wide">
              首頁
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm uppercase tracking-wide">
              商品
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm uppercase tracking-wide">
              聯絡我們
            </Link>
            {typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage.getItem('admin.access') ? (
              <Link href="/admin-portal/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                Admin
              </Link>
            ) : (
              <Link href="/admin-portal/login" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

