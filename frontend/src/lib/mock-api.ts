/**
 * Mock API 服務
 * MVP 階段使用，當後端 API 尚未就緒時提供假資料
 */
import { ProductListItem, PaginatedResponse } from '@/types/product';
import { Category } from '@/types/category';
import { Tag } from '@/types/tag';
import { mockProducts, mockCategories, mockTags } from '@/mocks/products';
import { ApiResponse } from './api';

/**
 * Mock 延遲（模擬網路延遲）
 */
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock 取得商品列表
 */
export async function mockGetProducts(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<ProductListItem>>> {
  await delay();
  
  let products = [...mockProducts];
  
  // 模擬篩選
  if (params?.category) {
    products = products.filter(p => p.category?.id === parseInt(params.category));
  }
  
  if (params?.tags) {
    const tagIds = Array.isArray(params.tags) ? params.tags.map(Number) : [Number(params.tags)];
    products = products.filter(p => 
      p.tags.some(tag => tagIds.includes(tag.id))
    );
  }
  
  if (params?.search) {
    const search = params.search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
    );
  }
  
  // 模擬分頁
  const page = parseInt(params?.page || '1');
  const pageSize = parseInt(params?.page_size || '20');
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    status: 'success',
    data: {
      count: products.length,
      next: end < products.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: products.slice(start, end),
    },
  };
}

/**
 * Mock 取得單一商品
 */
export async function mockGetProduct(id: number): Promise<ApiResponse<ProductListItem>> {
  await delay();
  
  const product = mockProducts.find(p => p.id === id);
  
  if (!product) {
    throw new Error('商品不存在');
  }
  
  return {
    status: 'success',
    data: product,
  };
}

/**
 * Mock 取得分類列表
 */
export async function mockGetCategories(): Promise<ApiResponse<Category[]>> {
  await delay();
  
  return {
    status: 'success',
    data: mockCategories,
  };
}

/**
 * Mock 取得標籤列表
 */
export async function mockGetTags(): Promise<ApiResponse<Tag[]>> {
  await delay();
  
  return {
    status: 'success',
    data: mockTags,
  };
}

