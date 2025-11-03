/**
 * 商品類型定義
 */
import { Category } from './category';
import { Tag } from './tag';

export interface ProductImage {
  id: number;
  image_url: string;
  full_url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: string;
  sort_order: number;
  category?: Category;
  tags: Tag[];
  images: ProductImage[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: string;
  sort_order: number;
  category?: Category;
  tags: Tag[];
  primary_image?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductListParams {
  category?: number;
  tags?: number[];
  min_price?: number;
  max_price?: number;
  search?: string;
  sort?: 'sort_order' | 'updated_at' | 'price' | '-price';
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

