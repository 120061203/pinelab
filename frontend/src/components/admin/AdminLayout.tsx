"use client";

import React from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-r p-4 space-y-2">
          <h2 className="font-semibold mb-3">Admin Portal</h2>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/admin-portal/dashboard">Dashboard</Link>
            <Link href="/admin-portal/products">Products</Link>
            <Link href="/admin-portal/categories">Categories</Link>
            <Link href="/admin-portal/tags">Tags</Link>
            <Link href="/admin-portal/contacts">Contacts</Link>
          </nav>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}


