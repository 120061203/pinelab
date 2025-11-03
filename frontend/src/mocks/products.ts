/**
 * Mock 商品資料
 */
import { ProductListItem } from '@/types/product';
import { Category } from '@/types/category';
import { Tag } from '@/types/tag';

export const mockCategories: Category[] = [
  {
    id: 1,
    name: '創意商品',
    slug: 'creative-products',
    description: '充滿創意的商品',
    sort_order: 0,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '設計服務',
    slug: 'design-services',
    description: '專業設計服務',
    sort_order: 1,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

export const mockTags: Tag[] = [
  {
    id: 1,
    name: '新產品',
    slug: 'new-product',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '熱門',
    slug: 'popular',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

export const mockProducts: ProductListItem[] = [
  {
    id: 1,
    name: '創意商品 A',
    slug: 'creative-product-a',
    description: '這是一個充滿創意的商品，適合各種場合使用。',
    price: '999',
    sort_order: 0,
    category: mockCategories[0],
    tags: [mockTags[0], mockTags[1]],
    primary_image: '/images/product-a.jpg',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '設計服務 B',
    slug: 'design-service-b',
    description: '專業的設計服務，為您打造獨特品牌形象。',
    price: '2999',
    sort_order: 1,
    category: mockCategories[1],
    tags: [mockTags[1]],
    primary_image: '/images/product-b.jpg',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

