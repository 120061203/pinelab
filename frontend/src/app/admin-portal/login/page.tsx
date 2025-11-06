"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await adminLogin(username, password);
      if (res.status === "success" && res.data) {
        const { access, refresh, user } = res.data as any;
        setTokens({ access, refresh });
        setUser(user);
        router.replace("/admin-portal/dashboard");
      } else {
        setError(res.message || "登入失敗");
      }
    } catch (err: any) {
      setError(err?.message || "登入失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold">Admin Portal 登入</h1>
        {error && (
          <div className="text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
        <div className="space-y-1">
          <label className="text-sm" htmlFor="username">
            使用者名稱或郵箱
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2"
            autoComplete="username"
            placeholder="請輸入使用者名稱或郵箱地址"
            required
          />
          <p className="text-xs text-gray-500 mt-1">可使用使用者名稱或郵箱地址登入</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="password">
            密碼
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 pr-10"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
              aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
              title={showPassword ? '隱藏密碼' : '顯示密碼'}
            >
              {showPassword ? (
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
        </div>
        <div className="flex items-center justify-between">
          <Link
            href="/admin-portal/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            忘記密碼？
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
        >
          {loading ? "登入中…" : "登入"}
        </button>
      </form>
    </div>
  );
}


