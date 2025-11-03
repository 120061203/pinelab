"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: number; message: string; type?: 'success' | 'error' | 'info' };

const ToastContext = createContext<{ addToast: (t: Omit<Toast, 'id'>) => void } | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* 無障礙：以 aria-live 宣告即時訊息 */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded shadow text-white ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}


