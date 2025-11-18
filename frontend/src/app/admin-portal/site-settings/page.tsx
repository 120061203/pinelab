"use client";

import React, { useEffect, useState } from 'react';
import { adminGetSiteSettings, adminUpdateSiteSettings } from '@/lib/admin-api';
import { SiteSettings, SiteSettingsUpdateRequest, ExternalLink } from '@/types/site-settings';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import { getImageUrl } from '@/lib/image-utils';

export default function AdminSiteSettingsPage() {
  const { addToast } = useToast();
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SiteSettingsUpdateRequest>({
    brand_name: '',
    brand_slogan: '',
    external_links: [],
    show_price: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroBannerFile, setHeroBannerFile] = useState<File | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await adminGetSiteSettings();
      if (res?.status === 'success' && res.data) {
        setSiteSettings(res.data);
        setFormData({
          brand_name: res.data.brand_name || '',
          brand_slogan: res.data.brand_slogan || '',
          external_links: res.data.external_links || [],
          show_price: res.data.show_price ?? true,
        });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '載入失敗' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData: SiteSettingsUpdateRequest = {
        ...formData,
      };
      if (logoFile) {
        updateData.logo = logoFile;
      }
      if (heroBannerFile) {
        updateData.hero_banner = heroBannerFile;
      }
      
      const res: any = await adminUpdateSiteSettings(updateData);
      if (res?.status === 'success') {
        addToast({ type: 'success', message: '網站設定已更新' });
        setLogoFile(null);
        setHeroBannerFile(null);
        load();
      } else {
        addToast({ type: 'error', message: res?.message || '更新失敗' });
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '更新失敗' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">載入中...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">網站設定</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* 品牌資訊 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">品牌資訊</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">品牌名稱</label>
              <input
                type="text"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                maxLength={200}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">品牌標語</label>
              <textarea
                value={formData.brand_slogan}
                onChange={(e) => setFormData({ ...formData, brand_slogan: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                maxLength={500}
              />
            </div>
          </div>
        </div>

        {/* Logo 和 Hero 橫幅 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">圖片</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Logo (SVG, ≤2MB)</label>
              {siteSettings?.logo_url && (
                <div className="mb-2">
                  <img 
                    src={getImageUrl(siteSettings.logo_url) || ''} 
                    alt="Current Logo" 
                    className="h-16 w-auto mb-2"
                    onError={(e) => {
                      // 圖片載入失敗時隱藏圖片
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <input
                type="file"
                accept=".svg"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Hero 橫幅 (JPG/PNG/WEBP, ≤5MB)</label>
              {siteSettings?.hero_banner_url && (
                <div className="mb-2">
                  <img 
                    src={getImageUrl(siteSettings.hero_banner_url) || ''} 
                    alt="Current Hero Banner" 
                    className="h-32 w-auto mb-2"
                    onError={(e) => {
                      // 圖片載入失敗時隱藏圖片
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => setHeroBannerFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* 外部連結 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">外部連結</h2>
          
          <div className="space-y-4">
            {(formData.external_links || []).map((link, index) => (
              <div key={index} className="flex gap-2 items-start p-4 border rounded-md">
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">顯示名稱</label>
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => {
                        const newLinks = [...(formData.external_links || [])];
                        newLinks[index] = { ...link, name: e.target.value };
                        setFormData({ ...formData, external_links: newLinks });
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="例如：蝦皮賣場"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">連結 URL</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...(formData.external_links || [])];
                        newLinks[index] = { ...link, url: e.target.value };
                        setFormData({ ...formData, external_links: newLinks });
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newLinks = [...(formData.external_links || [])];
                    newLinks.splice(index, 1);
                    setFormData({ ...formData, external_links: newLinks });
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  刪除
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                const newLinks = [...(formData.external_links || []), { name: '', url: '' }];
                setFormData({ ...formData, external_links: newLinks });
              }}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + 新增連結
            </button>
          </div>
        </div>

        {/* 顯示設定 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">顯示設定</h2>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_price"
              checked={formData.show_price}
              onChange={(e) => setFormData({ ...formData, show_price: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="show_price" className="text-sm font-medium">
              顯示商品價格
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '儲存中...' : '儲存'}
          </button>
        </div>
      </form>
    </div>
  );
}

