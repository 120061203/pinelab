"use client";

import React from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { useAdminAuth } from "@/lib/admin-auth";
import { navVisible } from "@/lib/rbac";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAdminAuth();
  return (
    <ProtectedRoute>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-r p-4 space-y-2">
          <h2 className="font-semibold mb-3">Admin Portal</h2>
          <nav className="flex flex-col gap-2 text-sm">
            {navVisible(user?.role as any, 'dashboard') && <Link href="/admin-portal/dashboard">Dashboard</Link>}
            {navVisible(user?.role as any, 'products') && <Link href="/admin-portal/products">Products</Link>}
            {navVisible(user?.role as any, 'categories') && <Link href="/admin-portal/categories">Categories</Link>}
            {navVisible(user?.role as any, 'tags') && <Link href="/admin-portal/tags">Tags</Link>}
            {navVisible(user?.role as any, 'contacts') && <Link href="/admin-portal/contacts">Contacts</Link>}
            <button onClick={logout} className="text-left text-red-600 mt-4">登出</button>
          </nav>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}


