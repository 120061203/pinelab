/**
 * 首頁整合測試
 */
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock API
jest.mock('@/lib/api', () => ({
  getProducts: jest.fn(),
}));

describe('HomePage Integration', () => {
  it('應該完整載入並顯示首頁內容', async () => {
    const { getProducts } = require('@/lib/api');
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

    render(<HomePage />);

    // 檢查品牌名稱
    expect(screen.getByText('松果創意 pinelab')).toBeInTheDocument();

    // 檢查最新商品標題
    expect(screen.getByText('最新商品')).toBeInTheDocument();

    // 等待商品載入
    await waitFor(() => {
      expect(screen.getByText('商品1')).toBeInTheDocument();
    });

    // 驗證 API 被正確調用
    expect(getProducts).toHaveBeenCalledWith({
      sort: 'updated_at',
      page_size: 6,
    });
  });
});

