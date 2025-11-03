/**
 * Footer 元件
 */
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 品牌資訊 */}
          <div>
            <h3 className="text-xl font-bold mb-4">松果創意 pinelab</h3>
            <p className="text-gray-400">
              提供優質的商品與服務
            </p>
          </div>
          
          {/* 快速連結 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">快速連結</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  首頁
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-400 hover:text-white transition-colors">
                  商品列表
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  聯絡我們
                </a>
              </li>
            </ul>
          </div>
          
          {/* 社群連結 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">關注我們</h4>
            <div className="flex gap-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Line@"
              >
                Line@
              </a>
            </div>
          </div>
        </div>
        
        {/* 版權資訊 */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} 松果創意 pinelab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

