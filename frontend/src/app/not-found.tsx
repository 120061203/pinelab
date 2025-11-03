/**
 * 404 頁面元件
 */
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-6">頁面不存在</h2>
        <p className="text-gray-500 mb-8">
          抱歉，您要尋找的頁面不存在或已移動。
        </p>
        <Link
          href="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
        >
          返回首頁
        </Link>
      </div>
    </div>
  );
}

