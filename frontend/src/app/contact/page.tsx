/**
 * 聯絡頁面
 */
'use client';

import { useEffect, useState } from 'react';
import ContactForm from '@/components/ContactForm';
import { getSiteSettings, ApiResponse } from '@/lib/api';
import { SiteSettings } from '@/types/site-settings';

export default function ContactPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await getSiteSettings() as ApiResponse<SiteSettings>;
        if (response.status === 'success' && response.data) {
          setSiteSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">聯絡我們</h1>
      
      <div className="max-w-2xl mx-auto">
        <p className="text-gray-600 mb-8">
          如果您有任何問題或建議，歡迎透過以下表單與我們聯絡，我們會儘快回覆您。
        </p>
        
        {/* 外部聯絡連結 */}
        {siteSettings?.external_links && siteSettings.external_links.length > 0 && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">其他聯絡方式</h2>
            <div className="flex flex-col gap-3">
              {siteSettings.external_links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-center"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
        
        <ContactForm />
      </div>
    </div>
  );
}

