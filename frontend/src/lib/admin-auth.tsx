"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Tokens = { access: string; refresh?: string };
type AdminUser = { id: number; username: string; email?: string; is_staff?: boolean; role?: string; first_name?: string; last_name?: string; is_super_admin?: boolean } | null;

type AdminAuthContextType = {
  tokens: Tokens | null;
  user: AdminUser;
  setTokens: (t: Tokens | null) => void;
  setUser: (u: AdminUser) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ACCESS_KEY = "admin.access";
const REFRESH_KEY = "admin.refresh";
const USER_KEY = "admin.user";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokensState] = useState<Tokens | null>(null);
  const [user, setUserState] = useState<AdminUser>(null);

  useEffect(() => {
    const access = typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;
    const refresh = typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
    if (access) setTokensState({ access, refresh: refresh || undefined });
    if (userStr) setUserState(JSON.parse(userStr));
  }, []);

  const setTokens = (t: Tokens | null) => {
    setTokensState(t);
    if (typeof window === "undefined") return;
    if (t?.access) localStorage.setItem(ACCESS_KEY, t.access);
    else localStorage.removeItem(ACCESS_KEY);
    if (t?.refresh) localStorage.setItem(REFRESH_KEY, t.refresh);
    else localStorage.removeItem(REFRESH_KEY);
  };

  const setUser = (u: AdminUser) => {
    // 推斷角色（若後端未提供），is_staff 預設為 admin
    let next = u;
    if (u && !u.role) {
      next = { ...u, role: u.is_staff ? 'admin' : 'analyst' } as any;
    }
    setUserState(next);
    if (typeof window === "undefined") return;
    if (next) localStorage.setItem(USER_KEY, JSON.stringify(next));
    else localStorage.removeItem(USER_KEY);
  };

  const logout = () => {
    setTokens(null);
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ tokens, user, setTokens, setUser, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}


