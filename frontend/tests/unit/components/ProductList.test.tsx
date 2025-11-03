/**
 * 商品列表頁元件測試
 */
import { render, screen, waitFor } from '@testing-library/react';
import ProductsPage from '@/app/products/page';

// Mock API
jest.mock('@/lib/api', () => ({
  getProducts: jest.fn(),
  getCategories: jest.fn(),
  getTags: jest.fn(),
}));

describe('ProductsPage', () => {
  beforeEach(() => {
    const { getCategories, getTags } = require('@/lib/api');
    getCategories.mockResolvedValue({
      status: 'success',
      data: [],
    });
    getTags.mockResolvedValue({
      status: 'success',
      data: [],
    });
  });

  it('應該顯示商品列表標題', () => {
    const { getProducts } = require('@/lib/api');
    getProducts.mockResolvedValue({
      status: 'success',
      data: {
        results: [],
      },
    });

    render(<ProductsPage />);
    
    expect(screen.getByText('商品列表')).toBeInTheDocument();
  });

  it('應該顯示商品卡片', async () => {
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
          },
        ],
      },
    });

    render(<ProductsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('商品1')).toBeInTheDocument();
    });
  });

  it('應該顯示無商品訊息', async () => {
    const { getProducts } = require('@/lib/api');
    getProducts.mockResolvedValue({
      status: 'success',
      data: {
        results: [],
      },
    });

    render(<ProductsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('沒有符合條件的商品')).toBeInTheDocument();
    });
  });
});

