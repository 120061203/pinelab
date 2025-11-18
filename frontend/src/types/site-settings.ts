/**
 * 網站設定型別定義
 */

export interface ExternalLink {
  name: string;
  url: string;
}

export interface SiteSettings {
  id: number;
  brand_name: string | null;
  brand_slogan: string | null;
  logo_url: string | null;
  hero_banner_url: string | null;
  external_links: ExternalLink[];
  show_price: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsUpdateRequest {
  brand_name?: string;
  brand_slogan?: string;
  logo?: File;
  hero_banner?: File;
  external_links?: ExternalLink[];
  show_price?: boolean;
}

