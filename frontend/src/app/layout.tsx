/**
 * 根布局
 */
import type { Metadata } from 'next';
import './globals.css';
import Footer from '@/components/Footer';

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
              </div>
            </div>
          </div>
        </nav>
        
        <main>{children}</main>
        
        <Footer />
      </body>
    </html>
  );
}

