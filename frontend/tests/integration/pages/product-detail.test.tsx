/**
 * 商品詳情頁整合測試
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

describe('ProductDetailPage Integration', () => {
  it('應該完整載入商品詳情', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    const { getProduct } = require('@/lib/api');
    getProduct.mockResolvedValue({
      status: 'success',
      data: {
        id: 1,
        name: '測試商品',
        description: '商品詳細描述',
        price: '999',
        category: {
          id: 1,
          name: '測試分類',
          slug: 'test-category',
        },
        tags: [
          {
            id: 1,
            name: '測試標籤',
            slug: 'test-tag',
          },
        ],
        images: [
          {
            id: 1,
            image_url: '/media/products/1/img.jpg',
            full_url: 'http://localhost:8000/media/products/1/img.jpg',
            is_primary: true,
          },
        ],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    });

    render(<ProductDetailPage />);

    // 等待商品載入
    await waitFor(() => {
      expect(screen.getByText('測試商品')).toBeInTheDocument();
      expect(screen.getByText(/NT\$ 999/)).toBeInTheDocument();
      expect(screen.getByText('商品詳細描述')).toBeInTheDocument();
      expect(screen.getByText('測試分類')).toBeInTheDocument();
      expect(screen.getByText('測試標籤')).toBeInTheDocument();
    });

    // 驗證 API 被正確調用
    expect(getProduct).toHaveBeenCalledWith(1);
  });
});

