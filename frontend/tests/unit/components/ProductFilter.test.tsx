/**
 * ProductFilter 元件測試
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ProductFilter from '@/components/ProductFilter';
import { Category } from '@/types/category';
import { Tag } from '@/types/tag';

describe('ProductFilter', () => {
  const mockCategories: Category[] = [
    {
      id: 1,
      name: '分類1',
      slug: 'category-1',
      sort_order: 0,
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ];

  const mockTags: Tag[] = [
    {
      id: 1,
      name: '標籤1',
      slug: 'tag-1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ];

  const mockOnFilterChange = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
    mockOnSearch.mockClear();
  });

  it('應該顯示所有篩選選項', () => {
    render(
      <ProductFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        onSearch={mockOnSearch}
      />
    );
    
    expect(screen.getByText('篩選商品')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('輸入關鍵字...')).toBeInTheDocument();
    expect(screen.getByText('分類1')).toBeInTheDocument();
    expect(screen.getByText('標籤1')).toBeInTheDocument();
  });

  it('應該執行搜尋', () => {
    render(
      <ProductFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        onSearch={mockOnSearch}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('輸入關鍵字...');
    const searchButton = screen.getByText('搜尋');
    
    fireEvent.change(searchInput, { target: { value: '測試' } });
    fireEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('測試');
  });

  it('應該套用篩選', () => {
    render(
      <ProductFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        onSearch={mockOnSearch}
      />
    );
    
    const applyButton = screen.getByText('套用篩選');
    fireEvent.click(applyButton);
    
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('應該清除篩選', () => {
    render(
      <ProductFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        onSearch={mockOnSearch}
      />
    );
    
    const clearButton = screen.getByText('清除');
    fireEvent.click(clearButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({ sort: 'sort_order' });
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('應該切換標籤選擇', () => {
    render(
      <ProductFilter
        categories={mockCategories}
        tags={mockTags}
        onFilterChange={mockOnFilterChange}
        onSearch={mockOnSearch}
      />
    );
    
    const tagButton = screen.getByText('標籤1');
    fireEvent.click(tagButton);
    
    // 標籤應該被選中（樣式改變）
    expect(tagButton).toHaveClass('bg-blue-600');
  });
});

