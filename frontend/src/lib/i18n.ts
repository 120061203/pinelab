const zhTW: Record<string, string> = {
  confirm: '確認',
  cancel: '取消',
  delete: '刪除',
  edit: '編輯',
  save: '儲存',
  saved: '已儲存',
  upload_success: '上傳成功',
  upload_failed: '上傳失敗',
};

export function t(key: string, fallback?: string) {
  return zhTW[key] || fallback || key;
}


