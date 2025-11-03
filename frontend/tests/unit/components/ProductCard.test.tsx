/**
 * ProductCard 元件測試
 */
import { render, screen } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';
import { ProductListItem } from '@/types/product';

describe('ProductCard', () => {
  const mockProduct: ProductListItem = {
    id: 1,
    name: '測試商品',
    slug: 'test-product',
    description: '這是測試商品描述',
    price: '999',
    sort_order: 0,
    tags: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  it('應該顯示商品名稱', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('測試商品')).toBeInTheDocument();
  });

  it('應該顯示商品價格', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText(/NT\$ 999/)).toBeInTheDocument();
  });

  it('應該顯示商品描述', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('這是測試商品描述')).toBeInTheDocument();
  });

  it('應該顯示分類名稱', () => {
    const productWithCategory = {
      ...mockProduct,
      category: {
        id: 1,
        name: '測試分類',
        slug: 'test-category',
        sort_order: 0,
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    };
    
    render(<ProductCard product={productWithCategory} />);
    
    expect(screen.getByText('測試分類')).toBeInTheDocument();
  });

  it('應該顯示標籤', () => {
    const productWithTags = {
      ...mockProduct,
      tags: [
        {
          id: 1,
          name: '標籤1',
          slug: 'tag-1',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
    };
    
    render(<ProductCard product={productWithTags} />);
    
    expect(screen.getByText('標籤1')).toBeInTheDocument();
  });

  it('應該有正確的連結', () => {
    render(<ProductCard product={mockProduct} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/1');
  });
});

