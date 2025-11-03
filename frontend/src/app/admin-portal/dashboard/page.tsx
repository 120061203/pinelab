"use client";

import React, { useEffect, useState } from "react";
import { adminGetDashboardMetrics } from "@/lib/admin-api";
import Cards from "@/components/admin/dashboard/Cards";
import Trends from "@/components/admin/dashboard/Trends";
import Health from "@/components/admin/dashboard/Health";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await adminGetDashboardMetrics({ range: '30d' });
        if (res?.status === 'success' && res.data) setMetrics(res.data);
        else setError(res?.message || '載入失敗');
      } catch (e: any) { setError(e?.message || '載入失敗'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {loading ? (
        <div>載入中…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : metrics ? (
        <div className="space-y-4">
          <Cards totals={metrics.totals || {}} />
          <Trends data={metrics.trends || {}} />
          <Health health={metrics.health || {}} />
        </div>
      ) : null}
    </div>
  );
}


