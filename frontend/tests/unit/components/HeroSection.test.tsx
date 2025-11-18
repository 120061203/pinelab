/**
 * HeroSection 元件測試
 */
import { render, screen } from '@testing-library/react';
import HeroSection from '@/components/HeroSection';
import { SiteSettings } from '@/types/site-settings';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('HeroSection', () => {
  it('應該在沒有 siteSettings 時不顯示', () => {
    const { container } = render(<HeroSection siteSettings={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('應該在沒有橫幅和標語時不顯示', () => {
    const siteSettings: SiteSettings = {
      id: 1,
      brand_name: '測試品牌',
      brand_slogan: null,
      logo_url: null,
      hero_banner_url: null,
      shopee_link: null,
      line_at_link: null,
      mall_link: null,
      fan_page_link: null,
      blog_link: null,
      show_price: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    const { container } = render(<HeroSection siteSettings={siteSettings} />);
    expect(container.firstChild).toBeNull();
  });

  it('應該顯示品牌標語', () => {
    const siteSettings: SiteSettings = {
      id: 1,
      brand_name: '測試品牌',
      brand_slogan: '這是品牌標語',
      logo_url: null,
      hero_banner_url: null,
      shopee_link: null,
      line_at_link: null,
      mall_link: null,
      fan_page_link: null,
      blog_link: null,
      show_price: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    render(<HeroSection siteSettings={siteSettings} />);
    expect(screen.getByText('這是品牌標語')).toBeInTheDocument();
  });

  it('應該顯示 Hero 橫幅', () => {
    const siteSettings: SiteSettings = {
      id: 1,
      brand_name: '測試品牌',
      brand_slogan: null,
      logo_url: null,
      hero_banner_url: '/media/site/hero-banner.jpg',
      shopee_link: null,
      line_at_link: null,
      mall_link: null,
      fan_page_link: null,
      blog_link: null,
      show_price: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    render(<HeroSection siteSettings={siteSettings} />);
    const img = screen.getByAltText('測試品牌');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/media/site/hero-banner.jpg');
  });
});

