"use client";

import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}


