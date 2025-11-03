/**
 * 根布局
 */
import type { Metadata } from 'next';
import './globals.css';
import Footer from '@/components/Footer';
import { AdminAuthProvider } from '@/lib/admin-auth';
import { ToastProvider } from '@/components/admin/feedback/ToastProvider';
import React from 'react';

export const metadata: Metadata = {
  title: '松果創意 Pinelab',
  description: '松果創意企業官網',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        {/* Skip to content for keyboard users */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white px-3 py-1 rounded">跳到主要內容</a>
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="text-xl font-bold">
                松果創意 pinelab
              </a>
              <div className="flex gap-4">
                <a href="/" className="hover:text-blue-600">首頁</a>
                <a href="/products" className="hover:text-blue-600">商品</a>
                <a href="/contact" className="hover:text-blue-600">聯絡我們</a>
                {/* 簡易：若有 token 顯示 Admin 入口 */}
                {typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage.getItem('admin.access') ? (
                  <a href="/admin-portal/dashboard" className="hover:text-blue-600">Admin</a>
                ) : (
                  <a href="/admin-portal/login" className="hover:text-blue-600">Admin</a>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        <ToastProvider>
          <AdminAuthProvider>
            <main id="main-content">{children}</main>
          </AdminAuthProvider>
        </ToastProvider>
        
        <Footer />
      </body>
    </html>
  );
}

