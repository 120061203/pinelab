/**
 * 最新消息型別定義
 */

export type NewsStatus = 'draft' | 'published';

export interface NewsImage {
  url: string;
  alt?: string;
}

export interface News {
  id: number;
  title: string;
  slug: string | null;
  content: string;
  publish_date: string;
  images: NewsImage[];
  status?: NewsStatus;
  created_at: string;
  updated_at: string;
}

export interface NewsCreateRequest {
  title: string;
  slug?: string;
  content: string;
  publish_date: string;
  images_upload?: File[];
  images?: NewsImage[];
  status?: NewsStatus;
}

export interface NewsUpdateRequest {
  title?: string;
  slug?: string;
  content?: string;
  publish_date?: string;
  images_upload?: File[];
  images?: NewsImage[];
  status?: NewsStatus;
}
