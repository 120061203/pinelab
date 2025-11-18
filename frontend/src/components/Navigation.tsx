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
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {logoUrl ? (
              (() => {
                const fullLogoUrl = getImageUrl(logoUrl);
                if (!fullLogoUrl) return <span className="text-xl font-bold">{brandName}</span>;
                return fullLogoUrl.startsWith('http') ? (
                  <img
                    src={fullLogoUrl}
                    alt={brandName}
                    className="h-10 w-auto"
                  />
                ) : (
                  <Image
                    src={fullLogoUrl}
                    alt={brandName}
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                    priority
                  />
                );
              })()
            ) : (
              <span className="text-xl font-bold">{brandName}</span>
            )}
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              首頁
            </Link>
            <Link href="/products" className="hover:text-blue-600 transition-colors">
              商品
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">
              聯絡我們
            </Link>
            {typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage.getItem('admin.access') ? (
              <Link href="/admin-portal/dashboard" className="hover:text-blue-600 transition-colors">
                Admin
              </Link>
            ) : (
              <Link href="/admin-portal/login" className="hover:text-blue-600 transition-colors">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

