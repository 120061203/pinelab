/**
 * 首頁整合測試
 */
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock API
jest.mock('@/lib/api', () => ({
  getProducts: jest.fn(),
  getCategories: jest.fn(),
  getSiteSettings: jest.fn(),
  getNews: jest.fn(),
  getServices: jest.fn(),
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('HomePage Integration', () => {
  it('應該完整載入並顯示首頁內容', async () => {
    const { getProducts, getCategories, getSiteSettings, getNews, getServices } = require('@/lib/api');
    
    getCategories.mockResolvedValue({
      status: 'success',
      data: [],
    });
    
    getProducts.mockResolvedValue({
      status: 'success',
      data: {
        results: [
          {
            id: 1,
            name: '商品1',
            price: '999',
            slug: 'product-1',
            sort_order: 0,
            tags: [],
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
          },
        ],
      },
    });
    
    getSiteSettings.mockResolvedValue({
      status: 'success',
      data: {
        id: 1,
        brand_name: '測試品牌',
        brand_slogan: '測試標語',
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
      },
    });
    
    getNews.mockResolvedValue({
      status: 'success',
      data: [],
    });
    
    getServices.mockResolvedValue({
      status: 'success',
      data: [],
    });

    render(<HomePage />);

    // 等待資料載入
    await waitFor(() => {
      expect(getSiteSettings).toHaveBeenCalled();
      expect(getProducts).toHaveBeenCalled();
    });

    // 檢查品牌名稱
    await waitFor(() => {
      expect(screen.getByText('測試品牌')).toBeInTheDocument();
    });
  });
});

