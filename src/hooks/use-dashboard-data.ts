"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActivityItem, ChartPoint } from "@/lib/mock";
import { fetchDashboardStats, fetchRecentActivities, fetchUserGrowthSeries } from "@/services/mock-dashboard.service";

type StatCard = Awaited<ReturnType<typeof fetchDashboardStats>>[number];

export function useDashboardData() {
  const [stats, setStats] = useState<StatCard[] | null>(null);
  const [series, setSeries] = useState<ChartPoint[] | null>(null);
  const [activities, setActivities] = useState<ActivityItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, g, a] = await Promise.all([fetchDashboardStats(), fetchUserGrowthSeries(), fetchRecentActivities()]);
      setStats(s);
      setSeries(g);
      setActivities(a);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, series, activities, loading, reload: load };
}
