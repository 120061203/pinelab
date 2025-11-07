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
    // 處理 DRF 驗證錯誤格式
    // 優先使用後端返回的統一格式
    let errorMessage = data?.message || data?.detail;
    
    // 如果後端返回了 errors 對象，也嘗試解析
    if (!errorMessage && data?.errors) {
      if (typeof data.errors === 'object') {
        const fieldErrors: string[] = [];
        for (const [key, value] of Object.entries(data.errors)) {
          if (Array.isArray(value)) {
            fieldErrors.push(`${key}: ${(value as string[]).join(', ')}`);
          } else if (typeof value === 'string') {
            fieldErrors.push(`${key}: ${value}`);
          }
        }
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('; ');
        }
      } else if (typeof data.errors === 'string') {
        errorMessage = data.errors;
      }
    }
    
    // 如果沒有 message 或 detail，嘗試從字段錯誤中提取
    if (!errorMessage && typeof data === 'object') {
      const fieldErrors: string[] = [];
      for (const [key, value] of Object.entries(data)) {
        // 跳過已經處理的字段
        if (key === 'status' || key === 'code' || key === 'message' || key === 'errors') {
          continue;
        }
        if (Array.isArray(value)) {
          fieldErrors.push(`${key}: ${(value as string[]).join(', ')}`);
        } else if (typeof value === 'string') {
          fieldErrors.push(`${key}: ${value}`);
        } else if (typeof value === 'object' && value !== null) {
          // 處理嵌套的錯誤對象
          const nestedErrors: string[] = [];
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            if (Array.isArray(nestedValue)) {
              nestedErrors.push(`${nestedKey}: ${(nestedValue as string[]).join(', ')}`);
            } else {
              nestedErrors.push(`${nestedKey}: ${String(nestedValue)}`);
            }
          }
          if (nestedErrors.length > 0) {
            fieldErrors.push(`${key}: ${nestedErrors.join('; ')}`);
          } else {
            fieldErrors.push(`${key}: ${JSON.stringify(value)}`);
          }
        }
      }
      if (fieldErrors.length > 0) {
        errorMessage = fieldErrors.join('; ');
      }
    }
    
    // 創建錯誤對象，包含完整的錯誤資訊
    const error = new Error(errorMessage || `API 請求失敗 (${response.status})`);
    (error as any).response = { data, status: response.status };
    throw error;
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

export async function adminBatchUpdateProductStatus(productIds: number[], operation: 'enable' | 'disable' | 'delete') {
  return adminRequest('/admin/products/batch_update_status/', {
    method: 'POST',
    body: JSON.stringify({
      product_ids: productIds,
      operation: operation,
    }),
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
export async function adminGetTags(params?: Record<string, any>) {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }
  const url = searchParams.toString() ? `/admin/tags/?${searchParams.toString()}` : '/admin/tags/';
  return adminRequest(url);
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

/**
 * 帳號管理 API
 */
export async function adminGetUsers(params?: Record<string, any>) {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }
  const queryString = searchParams.toString();
  const endpoint = queryString ? `/admin/users/?${queryString}` : '/admin/users/';
  return adminRequest(endpoint);
}

export async function adminGetUser(id: number) {
  return adminRequest(`/admin/users/${id}/`);
}

export async function adminCreateUser(data: Record<string, any>) {
  return adminRequest('/admin/users/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminUpdateUser(id: number, data: Record<string, any>) {
  return adminRequest(`/admin/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function adminUpdateSelf(data: Record<string, any>) {
  return adminRequest('/admin/users/me/', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteUser(id: number) {
  return adminRequest(`/admin/users/${id}/`, {
    method: 'DELETE',
  });
}

export async function adminCancelUserDeletion(id: number) {
  return adminRequest(`/admin/users/${id}/cancel-deletion/`, {
    method: 'POST',
  });
}

export async function adminSendPasswordReset(id: number) {
  return adminRequest(`/admin/users/${id}/send-password-reset/`, {
    method: 'POST',
  });
}

export async function adminImpersonateUser(id: number, role?: 'editor' | 'analyst') {
  return adminRequest(`/admin/users/${id}/impersonate/`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function adminImpersonateRole(role: 'editor' | 'analyst' | 'admin') {
  return adminRequest('/admin/users/impersonate-role/', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function adminCancelImpersonation() {
  return adminRequest('/admin/users/cancel-impersonation/', {
    method: 'POST',
  });
}

/**
 * 密碼相關 API
 */
export async function requestPasswordReset(email: string) {
  const url = `${API_BASE_URL}/auth/password-reset-request/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || '請求密碼重設失敗');
  }
  return data;
}

export async function confirmPasswordReset(token: string, email: string, newPassword: string) {
  const url = `${API_BASE_URL}/auth/password-reset-confirm/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, email, new_password: newPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || '密碼重設失敗');
  }
  return data;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  return adminRequest('/auth/change-password/', {
    method: 'POST',
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });
}

