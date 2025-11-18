/**
 * 圖片 URL 處理工具
 * 將相對路徑轉換為完整的後端 URL
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * 將相對路徑的圖片 URL 轉換為完整的後端 URL
 * @param imageUrl 圖片 URL（可能是相對路徑或完整 URL）
 * @returns 完整的圖片 URL
 */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) {
    return null;
  }

  // 如果已經是完整 URL（包含 http:// 或 https://），直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // 如果是相對路徑（以 / 開頭），添加後端 base URL
  if (imageUrl.startsWith('/')) {
    // 移除 /api 後綴（如果有的話），因為媒體文件不在 /api 路徑下
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  }

  // 其他情況直接返回
  return imageUrl;
}

