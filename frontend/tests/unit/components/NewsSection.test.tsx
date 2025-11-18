/**
 * NewsSection 元件測試
 */
import { render, screen } from '@testing-library/react';
import NewsSection from '@/components/NewsSection';
import { News } from '@/types/news';

describe('NewsSection', () => {
  const mockNews: News[] = [
    {
      id: 1,
      title: '最新消息1',
      content: '這是第一則消息的內容',
      publish_date: '2025-01-27',
      created_at: '2025-01-27T00:00:00Z',
      updated_at: '2025-01-27T00:00:00Z',
    },
    {
      id: 2,
      title: '最新消息2',
      content: '這是第二則消息的內容',
      publish_date: '2025-01-26',
      created_at: '2025-01-26T00:00:00Z',
      updated_at: '2025-01-26T00:00:00Z',
    },
  ];

  it('應該在沒有消息時不顯示', () => {
    const { container } = render(<NewsSection news={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('應該顯示消息列表', () => {
    render(<NewsSection news={mockNews} />);
    
    expect(screen.getByText('最新消息')).toBeInTheDocument();
    expect(screen.getByText('最新消息1')).toBeInTheDocument();
    expect(screen.getByText('最新消息2')).toBeInTheDocument();
  });

  it('應該限制顯示數量', () => {
    const manyNews = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `消息${i + 1}`,
      content: '內容',
      publish_date: '2025-01-27',
      created_at: '2025-01-27T00:00:00Z',
      updated_at: '2025-01-27T00:00:00Z',
    }));

    render(<NewsSection news={manyNews} limit={5} />);
    
    const titles = screen.getAllByText(/消息\d+/);
    expect(titles.length).toBe(5);
  });

  it('應該顯示發布日期', () => {
    render(<NewsSection news={mockNews} />);
    
    // 檢查日期是否顯示（格式可能因 locale 而異）
    const dateElements = screen.getAllByText(/2025/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});

