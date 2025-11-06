"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/admin-api';
import { useToast } from '@/components/admin/feedback/ToastProvider';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      addToast({ type: 'error', message: '請輸入郵箱地址' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast({ type: 'error', message: '請輸入有效的郵箱地址' });
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
      addToast({ type: 'success', message: '如果該郵箱存在，我們已發送密碼重設連結' });
    } catch (e: any) {
      // 為了安全，不顯示具體錯誤
      setSubmitted(true);
      addToast({ type: 'success', message: '如果該郵箱存在，我們已發送密碼重設連結' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-2xl font-bold text-center">忘記密碼</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            請輸入您的郵箱地址，我們將發送密碼重設連結給您
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 text-green-800 rounded">
              <p className="text-center">
                如果該郵箱存在，我們已發送密碼重設連結到您的郵箱。
                <br />
                請檢查您的郵箱並點擊連結重設密碼。
              </p>
            </div>
            <Link
              href="/admin-portal/login"
              className="block text-center text-blue-600 hover:underline"
            >
              返回登入頁面
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                郵箱地址
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '發送中...' : '發送重設連結'}
            </button>

            <div className="text-center">
              <Link
                href="/admin-portal/login"
                className="text-sm text-blue-600 hover:underline"
              >
                返回登入頁面
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

