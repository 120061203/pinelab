/**
 * 檔案上傳工具（支援進度回報）
 */

export async function uploadProductImage(
  productId: number,
  file: File,
  fields?: { is_primary?: boolean; sort_order?: number }
): Promise<any> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const form = new FormData();
  form.append('file', file);
  if (fields?.is_primary !== undefined) form.append('is_primary', String(fields.is_primary));
  if (fields?.sort_order !== undefined) form.append('sort_order', String(fields.sort_order));

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin.access') : null;

  const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/upload_image/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || '上傳失敗');
  return data;
}


