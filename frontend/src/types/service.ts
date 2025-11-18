/**
 * 服務項目型別定義
 */

export type IconType = 'fontawesome' | 'material' | 'custom';

export interface Service {
  id: number;
  title: string;
  description: string;
  icon_type: IconType | null;
  icon_value: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreateRequest {
  title: string;
  description: string;
  icon_type?: IconType;
  icon_value?: string;
  icon_file?: File;
  sort_order?: number;
}

export interface ServiceUpdateRequest {
  title?: string;
  description?: string;
  icon_type?: IconType;
  icon_value?: string;
  icon_file?: File;
  sort_order?: number;
}

