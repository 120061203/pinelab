/**
 * ServicesSection 元件測試
 */
import { render, screen } from '@testing-library/react';
import ServicesSection from '@/components/ServicesSection';
import { Service } from '@/types/service';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('ServicesSection', () => {
  const mockServices: Service[] = [
    {
      id: 1,
      title: '服務1',
      description: '服務1描述',
      icon_type: 'fontawesome',
      icon_value: 'fa-home',
      sort_order: 10,
      created_at: '2025-01-27T00:00:00Z',
      updated_at: '2025-01-27T00:00:00Z',
    },
    {
      id: 2,
      title: '服務2',
      description: '服務2描述',
      icon_type: 'material',
      icon_value: 'shopping-cart',
      sort_order: 5,
      created_at: '2025-01-27T00:00:00Z',
      updated_at: '2025-01-27T00:00:00Z',
    },
  ];

  it('應該在沒有服務時不顯示', () => {
    const { container } = render(<ServicesSection services={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('應該顯示服務列表', () => {
    render(<ServicesSection services={mockServices} />);
    
    expect(screen.getByText('我們的服務')).toBeInTheDocument();
    expect(screen.getByText('服務1')).toBeInTheDocument();
    expect(screen.getByText('服務2')).toBeInTheDocument();
    expect(screen.getByText('服務1描述')).toBeInTheDocument();
    expect(screen.getByText('服務2描述')).toBeInTheDocument();
  });

  it('應該顯示 Font Awesome 圖標', () => {
    render(<ServicesSection services={[mockServices[0]]} />);
    
    const icon = screen.getByRole('generic', { hidden: true });
    expect(icon).toHaveClass('fa');
  });

  it('應該顯示 Material Icons', () => {
    render(<ServicesSection services={[mockServices[1]]} />);
    
    const icon = screen.getByText('shopping-cart');
    expect(icon).toHaveClass('material-icons');
  });

  it('應該顯示自訂圖標', () => {
    const serviceWithCustomIcon: Service = {
      id: 3,
      title: '服務3',
      description: '描述',
      icon_type: 'custom',
      icon_value: '/media/site/icons/custom.svg',
      sort_order: 0,
      created_at: '2025-01-27T00:00:00Z',
      updated_at: '2025-01-27T00:00:00Z',
    };

    render(<ServicesSection services={[serviceWithCustomIcon]} />);
    
    const img = screen.getByAltText('服務3');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/media/site/icons/custom.svg');
  });
});

