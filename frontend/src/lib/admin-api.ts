/**
 * 管理員 API 客戶端
 */
// 提供從 admin-auth 取 token 的接口（避免循環依賴，使用 localStorage 作為預設）
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('admin.access'); } catch { return null; }
}
import { ApiResponse } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * 管理員 API 請求基礎方法
 */
async function adminRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('未登入，請先登入');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  // 處理 401：權杖無效或過期 → 清除並導向登入
  if (response.status === 401) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin.access');
        localStorage.removeItem('admin.refresh');
        localStorage.removeItem('admin.user');
        if (!location.pathname.startsWith('/admin-portal/login')) {
          location.href = '/admin-portal/login';
        }
      }
    } catch {}
    throw new Error('認證失敗，請重新登入');
  }

  // 先讀取文本，然後嘗試解析 JSON
  const text = await response.text();
  let data: any;
  
  try {
    data = JSON.parse(text);
  } catch (e) {
    // 如果解析失敗，可能是返回了 HTML 錯誤頁面
    throw new Error(`API 返回了非 JSON 響應 (${response.status}): ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.detail || `API 請求失敗 (${response.status})`);
  }

  return data;
}

/**
 * 商品管理 API
 */
export async function adminGetProducts(params?: Record<string, any>) {
  const searchParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }
  
  const queryString = searchParams.toString();
  const endpoint = queryString ? `/admin/products/?${queryString}` : '/admin/products/';
  return adminRequest(endpoint);
}

export async function adminGetProduct(id: number) {
  return adminRequest(`/admin/products/${id}/`);
}

export async function adminCreateProduct(data: Record<string, any>) {
  return adminRequest('/admin/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminUpdateProduct(id: number, data: Record<string, any>) {
  return adminRequest(`/admin/products/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteProduct(id: number) {
  return adminRequest(`/admin/products/${id}/`, {
    method: 'DELETE',
  });
}

export async function adminUploadProductImage(productId: number, imageData: {
  image_url: string;
  sort_order?: number;
  is_primary?: boolean;
}) {
  return adminRequest(`/admin/products/${productId}/upload_image/`, {
    method: 'POST',
    body: JSON.stringify(imageData),
  });
}

export async function adminDeleteProductImage(productId: number, imageId: number) {
  return adminRequest(`/admin/products/${productId}/images/${imageId}/`, {
    method: 'DELETE',
  });
}

export async function adminSetPrimaryImage(productId: number, imageId: number) {
  return adminRequest(`/admin/products/${productId}/set_primary_image/`, {
    method: 'POST',
    body: JSON.stringify({ image_id: imageId }),
  });
}

/**
 * 分類管理 API
 */
export async function adminGetCategories() {
  return adminRequest('/admin/categories/');
}

export async function adminGetCategory(id: number) {
  return adminRequest(`/admin/categories/${id}/`);
}

export async function adminCreateCategory(data: Record<string, any>) {
  return adminRequest('/admin/categories/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminUpdateCategory(id: number, data: Record<string, any>) {
  return adminRequest(`/admin/categories/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteCategory(id: number) {
  return adminRequest(`/admin/categories/${id}/`, {
    method: 'DELETE',
  });
}

/**
 * 標籤管理 API
 */
export async function adminGetTags() {
  return adminRequest('/admin/tags/');
}

export async function adminGetTag(id: number) {
  return adminRequest(`/admin/tags/${id}/`);
}

export async function adminCreateTag(data: Record<string, any>) {
  return adminRequest('/admin/tags/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminUpdateTag(id: number, data: Record<string, any>) {
  return adminRequest(`/admin/tags/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteTag(id: number) {
  return adminRequest(`/admin/tags/${id}/`, {
    method: 'DELETE',
  });
}

/**
 * 聯絡表單管理 API
 */
export async function adminGetContacts(params?: Record<string, any>) {
  const searchParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }
  
  const queryString = searchParams.toString();
  const endpoint = queryString ? `/admin/contact/?${queryString}` : '/admin/contact/';
  return adminRequest(endpoint);
}

export async function adminGetContact(id: number) {
  return adminRequest(`/admin/contact/${id}/`);
}

export async function adminMarkContactRead(id: number) {
  return adminRequest(`/admin/contact/${id}/mark_read/`, {
    method: 'POST',
  });
}

export async function adminMarkContactUnread(id: number) {
  return adminRequest(`/admin/contact/${id}/mark_unread/`, {
    method: 'POST',
  });
}

export async function adminGetUnreadContactCount() {
  return adminRequest('/admin/contact/unread_count/');
}

// Auth
export async function adminLogin(username: string, password: string) {
  const url = `${API_BASE_URL}/auth/login/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || '登入失敗');
  }
  return data;
}

// Dashboard metrics
export async function adminGetDashboardMetrics(params?: Record<string, any>) {
  const searchParams = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k,v]) => { if (v!==undefined&&v!==null) searchParams.set(k, String(v)); });
  const qs = searchParams.toString();
  const endpoint = qs ? `/admin/dashboard/metrics/?${qs}` : '/admin/dashboard/metrics/';
  return adminRequest(endpoint);
}

// Batch update sort order
export async function adminBatchUpdateProductSort(items: Array<{id: number; sort_order: number}>) {
  return adminRequest('/admin/products/batch_update_sort/', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function adminBatchUpdateCategorySort(items: Array<{id: number; sort_order: number}>) {
  return adminRequest('/admin/categories/batch_update_sort/', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function adminBatchUpdateProductImageSort(productId: number, items: Array<{id: number; sort_order: number}>) {
  return adminRequest(`/admin/products/${productId}/images/batch_update_sort/`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function adminBatchUpdateProductCategory(productIds: number[], categoryId: number | null) {
  return adminRequest('/admin/products/batch_update_category/', {
    method: 'POST',
    body: JSON.stringify({ product_ids: productIds, category_id: categoryId }),
  });
}

export async function adminBatchUpdateProductTags(productIds: number[], operation: 'add' | 'remove' | 'replace', tagIds: number[]) {
  return adminRequest('/admin/products/batch_update_tags/', {
    method: 'POST',
    body: JSON.stringify({ product_ids: productIds, operation, tag_ids: tagIds }),
  });
}

