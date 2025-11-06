"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmPasswordReset } from '@/lib/admin-api';
import { useToast } from '@/components/admin/feedback/ToastProvider';
import PasswordInput from '@/components/admin/forms/PasswordInput';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 從 URL query 參數取得 token 和 email
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
    
    if (!tokenParam || !emailParam) {
      addToast({ type: 'error', message: '無效的重設連結，請重新申請' });
    }
  }, [searchParams, addToast]);

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      addToast({ type: 'error', message: '無效的重設連結' });
      return;
    }

    if (!newPassword || !confirmPassword) {
      addToast({ type: 'error', message: '請輸入新密碼和確認密碼' });
      return;
    }

    if (!validatePassword(newPassword)) {
      addToast({ type: 'error', message: '密碼至少需要8個字元' });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', message: '密碼和確認密碼不一致' });
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(token, email, newPassword);
      setSuccess(true);
      addToast({ type: 'success', message: '密碼已成功重設' });
      
      // 3秒後自動導向登入頁
      setTimeout(() => {
        router.push('/admin-portal/login');
      }, 3000);
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message || '密碼重設失敗，請檢查連結是否有效' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">密碼重設成功</h2>
            <p className="mt-2 text-gray-600">
              您的密碼已成功重設。將在3秒後自動導向登入頁面。
            </p>
            <Link
              href="/admin-portal/login"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              立即前往登入頁面
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-2xl font-bold text-center">重設密碼</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            請輸入您的新密碼
          </p>
        </div>

        {!token || !email ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 text-red-800 rounded">
              <p className="text-center">
                無效的重設連結，請重新申請密碼重設。
              </p>
            </div>
            <Link
              href="/admin-portal/forgot-password"
              className="block text-center text-blue-600 hover:underline"
            >
              重新申請密碼重設
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
                value={email}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              label="新密碼"
              required={true}
              showStrength={true}
            />

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                確認密碼 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1">密碼和確認密碼不一致</p>
              )}
              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <p className="text-xs text-green-600 mt-1">✓ 密碼確認一致</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token || !email}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '重設中...' : '重設密碼'}
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

