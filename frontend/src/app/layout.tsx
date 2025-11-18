/**
 * 根布局
 */
import type { Metadata } from 'next';
import './globals.css';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
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
    <html lang="zh-TW" className="overflow-x-hidden">
      <head>
        {/* Font Awesome CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Material Icons CDN */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="overflow-x-hidden">
        {/* Skip to content for keyboard users */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white px-3 py-1 rounded">跳到主要內容</a>
        <Navigation />
        
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

