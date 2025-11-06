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
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            autoComplete="current-password"
            required
          />
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


