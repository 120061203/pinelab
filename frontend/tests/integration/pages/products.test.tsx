/**
 * 商品列表頁整合測試
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProductsPage from '@/app/products/page';

// Mock API
jest.mock('@/lib/api', () => ({
  getProducts: jest.fn(),
  getCategories: jest.fn(),
  getTags: jest.fn(),
}));

describe('ProductsPage Integration', () => {
  beforeEach(() => {
    const { getCategories, getTags } = require('@/lib/api');
    getCategories.mockResolvedValue({
      status: 'success',
      data: [
        {
          id: 1,
          name: '分類1',
          slug: 'category-1',
          sort_order: 0,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
    });
    getTags.mockResolvedValue({
      status: 'success',
      data: [
        {
          id: 1,
          name: '標籤1',
          slug: 'tag-1',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
    });
  });

  it('應該完整載入商品列表頁', async () => {
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

    render(<ProductsPage />);

    // 檢查標題
    expect(screen.getByText('商品列表')).toBeInTheDocument();

    // 等待商品載入
    await waitFor(() => {
      expect(screen.getByText('商品1')).toBeInTheDocument();
    });
  });

  it('應該支援搜尋功能', async () => {
    const { getProducts } = require('@/lib/api');
    getProducts.mockResolvedValue({
      status: 'success',
      data: { results: [] },
    });

    render(<ProductsPage />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('輸入關鍵字...');
      const searchButton = screen.getByText('搜尋');

      fireEvent.change(searchInput, { target: { value: '測試' } });
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(getProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          search: '測試',
        })
      );
    });
  });
});

