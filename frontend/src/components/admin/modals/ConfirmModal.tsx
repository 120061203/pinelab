"use client";

import React from 'react';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = '確認',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  const headingId = 'confirm-title';
  const descId = 'confirm-desc';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal aria-labelledby={headingId} aria-describedby={descId}>
      <div className="bg-white rounded shadow w-full max-w-sm">
        <div id={headingId} className="p-4 border-b font-medium">{title || '請確認'}</div>
        <div id={descId} className="p-4 text-sm text-gray-700">{message || '此操作將無法復原，是否繼續？'}</div>
        <div className="p-3 flex justify-end gap-2 border-t">
          <button className="px-3 py-2 border rounded" onClick={onCancel}>{cancelText}</button>
          <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}


