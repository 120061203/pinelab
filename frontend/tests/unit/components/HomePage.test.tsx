/**
 * 首頁元件測試
 */
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock API
jest.mock('@/lib/api', () => ({
  getProducts: jest.fn(),
}));

describe('HomePage', () => {
  it('應該顯示品牌名稱', () => {
    const { getProducts } = require('@/lib/api');
    getProducts.mockResolvedValue({
      status: 'success',
      data: {
        results: [],
      },
    });

    render(<HomePage />);
    
    expect(screen.getByText('松果創意 pinelab')).toBeInTheDocument();
  });

  it('應該顯示最新商品標題', () => {
    const { getProducts } = require('@/lib/api');
    getProducts.mockResolvedValue({
      status: 'success',
      data: {
        results: [],
      },
    });

    render(<HomePage />);
    
    expect(screen.getByText('最新商品')).toBeInTheDocument();
  });

  it('應該載入並顯示商品', async () => {
    const { getProducts } = require('@/lib/api');
    getProducts.mockResolvedValue({
      status: 'success',
      data: {
        results: [
          {
            id: 1,
            name: '測試商品',
            price: '999',
            slug: 'test-product',
          },
        ],
      },
    });

    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('測試商品')).toBeInTheDocument();
    });
  });

  it('應該顯示載入狀態', () => {
    const { getProducts } = require('@/lib/api');
    getProducts.mockImplementation(() => new Promise(() => {})); // 永不解析

    render(<HomePage />);
    
    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('應該顯示錯誤訊息', async () => {
    const { getProducts } = require('@/lib/api');
    getProducts.mockRejectedValue(new Error('API 錯誤'));

    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('載入商品時發生錯誤')).toBeInTheDocument();
    });
  });
});

