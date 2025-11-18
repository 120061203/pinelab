/**
 * 最新消息型別定義
 */

export type NewsStatus = 'draft' | 'published';

export interface News {
  id: number;
  title: string;
  content: string;
  publish_date: string;
  image_url?: string | null;
  status?: NewsStatus;
  created_at: string;
  updated_at: string;
}

export interface NewsCreateRequest {
  title: string;
  content: string;
  publish_date: string;
  image?: File | null; // For file upload
  status?: NewsStatus;
}

export interface NewsUpdateRequest {
  title?: string;
  content?: string;
  publish_date?: string;
  image?: File | null; // For file upload
  status?: NewsStatus;
}

