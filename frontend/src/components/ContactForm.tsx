/**
 * 聯絡表單元件
 */
'use client';

import { useState } from 'react';
import { submitContact } from '@/lib/api';
import { signRequest } from '@/lib/signatures';
import { ContactFormData } from '@/types/contact';

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = '姓名至少需要 2 個字元';
    }

    if (!formData.email) {
      newErrors.email = '電子郵件為必填';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件格式';
    }

    if (!formData.message || formData.message.length < 10) {
      newErrors.message = '訊息至少需要 10 個字元';
    } else if (formData.message.length > 2000) {
      newErrors.message = '訊息不能超過 2000 個字元';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // 生成簽章
      const signedData = await signRequest(formData);

      // 提交表單
      const response = await submitContact(signedData);

      if (response.status === 'success') {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        
        // 3 秒後重置成功訊息
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setErrorMessage(response.message || '提交失敗，請稍後再試');
      }
    } catch (error: any) {
      setErrorMessage(error.message || '提交時發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 成功訊息 */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>聯絡表單已成功提交！我們會儘快回覆您。</p>
        </div>
      )}

      {/* 錯誤訊息 */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{errorMessage}</p>
        </div>
      )}

      {/* 姓名 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          姓名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="請輸入您的姓名"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* 電子郵件 */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          電子郵件 <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* 訊息 */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          訊息內容 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.message ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="請輸入您的訊息（至少 10 個字元）"
        />
        <div className="mt-1 flex justify-between">
          {errors.message && (
            <p className="text-sm text-red-600">{errors.message}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.message.length} / 2000
          </p>
        </div>
      </div>

      {/* 提交按鈕 */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? '提交中...' : '提交表單'}
        </button>
      </div>
    </form>
  );
}

