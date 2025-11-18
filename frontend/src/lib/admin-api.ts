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
  let responseData: any;
  try {
    responseData = JSON.parse(text);
  } catch (e) {
    // 如果解析失敗，可能是返回了 HTML 錯誤頁面
    throw new Error(`API 返回了非 JSON 響應 (${response.status}): ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    // 處理 DRF 驗證錯誤格式
    // 優先使用後端返回的統一格式
    let errorMessage = responseData?.message || responseData?.detail;
    
    // 如果後端返回了 errors 對象，也嘗試解析
    if (!errorMessage && responseData?.errors) {
      if (typeof responseData.errors === 'object') {
        const fieldErrors: string[] = [];
        for (const [key, value] of Object.entries(responseData.errors)) {
          if (Array.isArray(value)) {
            fieldErrors.push(`${key}: ${(value as string[]).join(', ')}`);
          } else if (typeof value === 'string') {
            fieldErrors.push(`${key}: ${value}`);
          }
        }
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('; ');
        }
      } else if (typeof responseData.errors === 'string') {
        errorMessage = responseData.errors;
      }
    }
    
    // 如果沒有 message 或 detail，嘗試從字段錯誤中提取
    if (!errorMessage && typeof responseData === 'object') {
      const fieldErrors: string[] = [];
      for (const [key, value] of Object.entries(responseData)) {
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
    (error as any).response = { data: responseData, status: response.status };
    throw error;
  }

  return responseData;
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
  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData?.message || '登入失敗');
  }
  return responseData;
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
  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData?.message || '請求密碼重設失敗');
  }
  return responseData;
}

export async function confirmPasswordReset(token: string, email: string, newPassword: string) {
  const url = `${API_BASE_URL}/auth/password-reset-confirm/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, email, new_password: newPassword }),
  });
  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData?.message || '密碼重設失敗');
  }
  return responseData;
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

/**
 * 網站設定管理 API
 */
import { SiteSettings, SiteSettingsUpdateRequest } from '@/types/site-settings';
import { News, NewsCreateRequest, NewsUpdateRequest } from '@/types/news';
import { Service, ServiceCreateRequest, ServiceUpdateRequest } from '@/types/service';

export async function adminGetSiteSettings() {
  return adminRequest<SiteSettings>('/admin/site-settings/');
}

export async function adminUpdateSiteSettings(data: SiteSettingsUpdateRequest) {
  const formData = new FormData();
  
  // 添加文字欄位
  if (data.brand_name !== undefined) formData.append('brand_name', data.brand_name);
  if (data.brand_slogan !== undefined) formData.append('brand_slogan', data.brand_slogan);
  if (data.external_links !== undefined) {
    formData.append('external_links', JSON.stringify(data.external_links));
  }
  if (data.show_price !== undefined) formData.append('show_price', String(data.show_price));
  
  // 添加檔案
  if (data.logo) formData.append('logo', data.logo);
  if (data.hero_banner) formData.append('hero_banner', data.hero_banner);
  
  const token = getAccessToken();
  if (!token) {
    throw new Error('未登入，請先登入');
  }
  
  // 對於單例模式，需要先獲取實例 ID，然後使用 detail URL
  let instanceId = 1; // 預設值
  try {
    const getResponse = await fetch(`${API_BASE_URL}/admin/site-settings/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (getResponse.ok) {
      const getData = await getResponse.json();
      if (getData?.data?.id) {
        instanceId = getData.data.id;
      }
    }
  } catch (e) {
    // 如果獲取失敗，使用預設值
  }
  
  const url = `${API_BASE_URL}/admin/site-settings/${instanceId}/`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin.access');
      localStorage.removeItem('admin.refresh');
      localStorage.removeItem('admin.user');
      if (!location.pathname.startsWith('/admin-portal/login')) {
        location.href = '/admin-portal/login';
      }
    }
    throw new Error('認證失敗，請重新登入');
  }
  
  const contentType = response.headers.get('content-type');
  let responseData: any;
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    if (response.status === 204) {
      return { status: 'success' } as ApiResponse<SiteSettings>;
    }
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  if (!response.ok) {
    throw new Error(responseData?.message || `API 請求失敗: ${response.status}`);
  }

  return responseData;
}

/**
 * 最新消息管理 API
 */
export async function adminGetNews(params?: { status?: 'draft' | 'published'; page?: number; page_size?: number }) {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }
  const queryString = searchParams.toString();
  const endpoint = queryString ? `/admin/news/?${queryString}` : '/admin/news/';
  return adminRequest<News[]>(endpoint);
}

export async function adminGetNewsItem(id: number) {
  return adminRequest<News>(`/admin/news/${id}/`);
}

export async function adminCreateNews(data: NewsCreateRequest) {
  const formData = new FormData();
  
  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('publish_date', data.publish_date);
  formData.append('status', data.status || 'draft');
  if (data.image) formData.append('image', data.image);
  
  const token = getAccessToken();
  if (!token) {
    throw new Error('未登入，請先登入');
  }
  
  const url = `${API_BASE_URL}/admin/news/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin.access');
      localStorage.removeItem('admin.refresh');
      localStorage.removeItem('admin.user');
      if (!location.pathname.startsWith('/admin-portal/login')) {
        location.href = '/admin-portal/login';
      }
    }
    throw new Error('認證失敗，請重新登入');
  }
  
  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData?.message || `API 請求失敗: ${response.status}`);
  }
  
  return responseData;
}

export async function adminUpdateNews(id: number, data: NewsUpdateRequest) {
  const formData = new FormData();
  
  if (data.title !== undefined) formData.append('title', data.title);
  if (data.content !== undefined) formData.append('content', data.content);
  if (data.publish_date !== undefined) formData.append('publish_date', data.publish_date);
  if (data.status !== undefined) formData.append('status', data.status);
  if (data.image) formData.append('image', data.image);
  
  const token = getAccessToken();
  if (!token) {
    throw new Error('未登入，請先登入');
  }
  
  const url = `${API_BASE_URL}/admin/news/${id}/`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin.access');
      localStorage.removeItem('admin.refresh');
      localStorage.removeItem('admin.user');
      if (!location.pathname.startsWith('/admin-portal/login')) {
        location.href = '/admin-portal/login';
      }
    }
    throw new Error('認證失敗，請重新登入');
  }
  
  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData?.message || `API 請求失敗: ${response.status}`);
  }
  
  return responseData;
}

export async function adminDeleteNews(id: number) {
  return adminRequest(`/admin/news/${id}/`, {
    method: 'DELETE',
  });
}

export async function adminToggleNewsStatus(id: number, status: 'draft' | 'published') {
  return adminRequest<News>(`/admin/news/${id}/toggle-status/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * 服務項目管理 API
 */
export async function adminGetServices() {
  return adminRequest<Service[]>('/admin/services/');
}

export async function adminGetService(id: number) {
  return adminRequest<Service>(`/admin/services/${id}/`);
}

export async function adminCreateService(data: ServiceCreateRequest) {
  const formData = new FormData();
  
  formData.append('title', data.title);
  formData.append('description', data.description);
  if (data.icon_type) {
    formData.append('icon_type', data.icon_type);
  } else {
    // 如果沒有 icon_type，傳送空字串以清除
    formData.append('icon_type', '');
  }
  if (data.icon_value) {
    formData.append('icon_value', data.icon_value);
  } else if (data.icon_type && data.icon_type !== 'custom') {
    // 對於 fontawesome 和 material，如果沒有 icon_value，傳送空字串
    formData.append('icon_value', '');
  }
  if (data.icon_file) formData.append('icon_file', data.icon_file);
  if (data.sort_order !== undefined) {
    formData.append('sort_order', String(data.sort_order));
  }
  
  const token = getAccessToken();
  if (!token) {
    throw new Error('未登入，請先登入');
  }
  
  const url = `${API_BASE_URL}/admin/services/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin.access');
      localStorage.removeItem('admin.refresh');
      localStorage.removeItem('admin.user');
      if (!location.pathname.startsWith('/admin-portal/login')) {
        location.href = '/admin-portal/login';
      }
    }
    throw new Error('認證失敗，請重新登入');
  }
  
  const responseData = await response.json();
  if (!response.ok) {
    // 處理驗證錯誤
    if (response.status === 400 && responseData) {
      const errorMessages: string[] = [];
      if (responseData.icon_type) {
        errorMessages.push(...(Array.isArray(responseData.icon_type) ? responseData.icon_type : [responseData.icon_type]));
      }
      if (responseData.icon_value) {
        errorMessages.push(...(Array.isArray(responseData.icon_value) ? responseData.icon_value : [responseData.icon_value]));
      }
      if (responseData.icon_file) {
        errorMessages.push(...(Array.isArray(responseData.icon_file) ? responseData.icon_file : [responseData.icon_file]));
      }
      if (responseData.non_field_errors) {
        errorMessages.push(...(Array.isArray(responseData.non_field_errors) ? responseData.non_field_errors : [responseData.non_field_errors]));
      }
      if (errorMessages.length > 0) {
        throw new Error(errorMessages.join(', '));
      }
    }
    throw new Error(responseData?.message || responseData?.detail || `API 請求失敗: ${response.status}`);
  }

  return responseData;
}

export async function adminUpdateService(id: number, data: ServiceUpdateRequest) {
  const formData = new FormData();
  
  if (data.title !== undefined) formData.append('title', data.title);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.icon_type !== undefined) formData.append('icon_type', data.icon_type || '');
  if (data.icon_value !== undefined) formData.append('icon_value', data.icon_value || '');
  if (data.icon_file) formData.append('icon_file', data.icon_file);
  if (data.sort_order !== undefined) formData.append('sort_order', String(data.sort_order));
  
  const token = getAccessToken();
  if (!token) {
    throw new Error('未登入，請先登入');
  }
  
  const url = `${API_BASE_URL}/admin/services/${id}/`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin.access');
      localStorage.removeItem('admin.refresh');
      localStorage.removeItem('admin.user');
      if (!location.pathname.startsWith('/admin-portal/login')) {
        location.href = '/admin-portal/login';
      }
    }
    throw new Error('認證失敗，請重新登入');
  }
  
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || `API 請求失敗: ${response.status}`);
  }
  
  return result;
}

export async function adminDeleteService(id: number) {
  return adminRequest(`/admin/services/${id}/`, {
    method: 'DELETE',
  });
}

export async function adminUpdateServiceSortOrder(id: number, sortOrder: number) {
  return adminRequest<Service>(`/admin/services/${id}/update-sort/`, {
    method: 'PATCH',
    body: JSON.stringify({ sort_order: sortOrder }),
  });
}

export async function adminBatchUpdateServiceSort(items: Array<{ id: number; sort_order: number }>) {
  return adminRequest<{ updated_count: number; items: Array<{ id: number; sort_order: number }> }>(
    '/admin/services/batch_update_sort/',
    {
      method: 'POST',
      body: JSON.stringify({ items }),
    }
  );
}

