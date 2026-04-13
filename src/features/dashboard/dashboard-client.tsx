"use client";

import { Activity, ArrowDownRight, ArrowUpRight, ShoppingCart, Users, Wallet } from "lucide-react";
import { PageFade } from "@/components/page-fade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const iconMap = {
  users: Users,
  cart: ShoppingCart,
  activity: Activity,
  revenue: Wallet,
} as const;

export function DashboardClient() {
  const { stats, series, activities, loading } = useDashboardData();

  return (
    <PageFade className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">统计看板</h1>
        <p className="text-sm text-muted-foreground mt-1">Stats · Recharts · 最近操作（MOCK）</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading || !stats
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))
          : stats.map((s) => {
              const Icon = iconMap[s.icon];
              const up = s.trend === "up";
              return (
                <Card key={s.key}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      {up ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-amber-500" />}
                      <span className={up ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>{s.delta}</span>
                      <span>{s.hint}</span>
                    </p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>近七日用户增长</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          {loading || !series ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={36} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                  labelFormatter={(l) => `日期 ${l}`}
                />
                <Line type="monotone" dataKey="value" name="新增" stroke="hsl(var(--primary))" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>最近操作记录</CardTitle>
        </CardHeader>
        <CardContent>
          {loading || !activities ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {activities.map((a) => (
                <li key={a.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-medium">{a.action}</span>
                    <span className="text-muted-foreground"> · {a.target}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.operator} · {format(new Date(a.at), "PPpp", { locale: zhCN })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageFade>
  );
}
