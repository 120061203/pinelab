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
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
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
          {/* 遮罩層，確保文字可讀性 */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}
      
      {hasSlogan && (
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {siteSettings.brand_slogan}
          </h1>
        </div>
      )}
    </section>
  );
}

