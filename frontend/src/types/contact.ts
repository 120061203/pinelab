/**
 * 聯絡表單類型定義
 */
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface Contact extends ContactFormData {
  id: number;
  is_read: boolean;
  created_at: string;
}

