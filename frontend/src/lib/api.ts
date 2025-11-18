/**
 * API 客戶端基礎結構
 */
import { SiteSettings } from '@/types/site-settings';
import { News } from '@/types/news';
import { Service } from '@/types/service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // 處理非 JSON 回應
      let data: ApiResponse<T>;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // 非 JSON 回應（如 204 No Content）
        if (response.status === 204) {
          return {
            status: 'success',
          } as ApiResponse<T>;
        }
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `API 請求失敗: ${response.status}`);
      }

      return data;
    } catch (error) {
      // 網路錯誤處理
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('網路連線失敗，請檢查您的網路連線');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

/**
 * 商品相關 API 方法
 */
export async function getProducts(params?: Record<string, any>) {
  const searchParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
  }
  
  const queryString = searchParams.toString();
  const endpoint = queryString ? `/products/?${queryString}` : '/products/';
  return apiClient.get(endpoint);
}

export async function getProduct(id: number) {
  return apiClient.get(`/products/${id}/`);
}

/**
 * 分類相關 API 方法
 */
export async function getCategories() {
  return apiClient.get('/categories/');
}

/**
 * 標籤相關 API 方法
 */
export async function getTags() {
  return apiClient.get('/tags/');
}

/**
 * 聯絡表單相關 API 方法
 */
export async function submitContact(data: Record<string, any>) {
  return apiClient.post('/contact/', data);
}

/**
 * 網站設定相關 API 方法
 */
export async function getSiteSettings() {
  return apiClient.get<SiteSettings>('/site-settings/');
}

/**
 * 最新消息相關 API 方法
 */
export async function getNews(limit?: number) {
  const endpoint = limit ? `/news/?limit=${limit}` : '/news/';
  return apiClient.get<News[]>(endpoint);
}

/**
 * 服務項目相關 API 方法
 */
export async function getServices() {
  return apiClient.get<Service[]>('/services/');
}

