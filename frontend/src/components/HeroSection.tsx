/**
 * Hero Section 元件
 * 顯示 Hero 橫幅和品牌標語
 */
'use client';

import { SiteSettings } from '@/types/site-settings';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';

interface HeroSectionProps {
  siteSettings: SiteSettings | null;
}

export default function HeroSection({ siteSettings }: HeroSectionProps) {
  if (!siteSettings) {
    return null;
  }

  const hasHeroBanner = siteSettings.hero_banner_url;
  const hasSlogan = siteSettings.brand_slogan;

  // 如果沒有橫幅和標語，不顯示 Hero section
  if (!hasHeroBanner && !hasSlogan) {
    return null;
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {hasHeroBanner && siteSettings.hero_banner_url && (
        <div className="absolute inset-0 z-0">
          {(() => {
            const imageUrl = getImageUrl(siteSettings.hero_banner_url);
            if (!imageUrl) return null;
            return imageUrl.startsWith('http') ? (
              <img
                src={imageUrl}
                alt={siteSettings.brand_name || 'Hero Banner'}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={imageUrl}
                alt={siteSettings.brand_name || 'Hero Banner'}
                fill
                className="object-cover"
                priority
              />
            );
          })()}
          {/* 優雅的漸層遮罩層 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
        </div>
      )}
      
      {hasSlogan && (
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-2xl leading-tight tracking-tight">
            {siteSettings.brand_slogan}
          </h1>
        </div>
      )}
    </section>
  );
}

