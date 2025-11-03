/**
 * 商品詳情頁元件測試
 */
import { render, screen, waitFor } from '@testing-library/react';
import { useParams } from 'next/navigation';
import ProductDetailPage from '@/app/products/[id]/page';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  getProduct: jest.fn(),
}));

describe('ProductDetailPage', () => {
  it('應該顯示商品名稱', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    const { getProduct } = require('@/lib/api');
    getProduct.mockResolvedValue({
      status: 'success',
      data: {
        id: 1,
        name: '測試商品',
        price: '999',
        description: '商品描述',
      },
    });

    render(<ProductDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('測試商品')).toBeInTheDocument();
    });
  });

  it('應該顯示商品價格', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    const { getProduct } = require('@/lib/api');
    getProduct.mockResolvedValue({
      status: 'success',
      data: {
        id: 1,
        name: '測試商品',
        price: '999',
      },
    });

    render(<ProductDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/NT\$ 999/)).toBeInTheDocument();
    });
  });

  it('應該顯示錯誤訊息', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: '999' });
    const { getProduct } = require('@/lib/api');
    getProduct.mockRejectedValue(new Error('商品不存在'));

    render(<ProductDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('載入商品時發生錯誤')).toBeInTheDocument();
    });
  });
});

