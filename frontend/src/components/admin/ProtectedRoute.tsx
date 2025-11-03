"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

function hasToken() {
  if (typeof window === "undefined") return false;
  try { return !!localStorage.getItem("admin.access"); } catch { return false; }
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hasToken()) {
      const to = "/admin-portal/login";
      if (pathname && pathname !== to) router.replace(to);
    }
  }, [router, pathname]);

  return <>{children}</>;
}


