"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  FileDown,
  Settings2,
  ShoppingCart,
  UserPlus,
  UserX,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PageFade } from "@/components/page-fade";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { ActivityItem } from "@/lib/mock";

const iconMap = {
  users: Users,
  cart: ShoppingCart,
  activity: Activity,
  revenue: Wallet,
} as const;

type ActivityTone = "default" | "warning" | "destructive";

function activityRowMeta(action: string): { Icon: LucideIcon; tone: ActivityTone } {
  if (action.includes("告警") || action.includes("失败")) return { Icon: AlertTriangle, tone: "destructive" };
  if (action.includes("禁用") || action.includes("删除")) return { Icon: UserX, tone: "warning" };
  if (action.includes("导出") || action.includes("报表")) return { Icon: FileDown, tone: "default" };
  if (action.includes("配置")) return { Icon: Settings2, tone: "default" };
  if (action.includes("用户") || action.includes("创建")) return { Icon: UserPlus, tone: "default" };
  return { Icon: Activity, tone: "default" };
}

function ActivityRow({ item }: { item: ActivityItem }): React.ReactElement {
  const at = new Date(item.at);
  const { Icon, tone } = activityRowMeta(item.action);
  const isSystem = item.operator === "system";

  return (
    <li
      className={cn(
        "group relative flex gap-3 rounded-lg border border-transparent px-3 py-3 transition-all duration-300",
        "hover:border-border/80 hover:bg-muted/30"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border shadow-sm transition-colors duration-300",
          tone === "destructive" &&
            "border-destructive/25 bg-destructive/10 text-destructive dark:bg-destructive/15 dark:text-destructive",
          tone === "warning" && "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
          tone === "default" && "border-border/70 bg-card text-muted-foreground group-hover:text-primary"
        )}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-medium text-foreground">{item.action}</span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums" title={item.target}>
            {item.target}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={isSystem ? "secondary" : "outline"} className="h-5 px-1.5 text-[10px] font-normal uppercase tracking-wide">
            {isSystem ? "系统" : "用户"}
          </Badge>
          <span className="truncate" title={item.operator}>
            {item.operator}
          </span>
          <span className="text-border">·</span>
          <time dateTime={item.at} title={format(at, "PPpp", { locale: zhCN })} className="tabular-nums">
            {formatDistanceToNow(at, { addSuffix: true, locale: zhCN })}
          </time>
        </div>
      </div>

      <div className="hidden shrink-0 text-right text-[11px] leading-tight text-muted-foreground sm:block tabular-nums">
        <div>{format(at, "MM-dd", { locale: zhCN })}</div>
        <div>{format(at, "HH:mm", { locale: zhCN })}</div>
      </div>
    </li>
  );
}

export function DashboardClient() {
  const { stats, series, activities, loading } = useDashboardData();

  return (
    <PageFade className="mx-auto max-w-6xl space-y-8">
      <PageHeader title="统计看板" description="Stats · Recharts · 最近操作（MOCK）" />

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
                <Card key={s.key} className="transition-shadow duration-300 hover:shadow-card-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
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

      <Card className="transition-shadow duration-300 hover:shadow-card-md">
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

      <Card className="transition-shadow duration-300 hover:shadow-card-md">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-base font-semibold tracking-tight">最近操作记录</CardTitle>
          <CardDescription className="text-xs font-normal text-muted-foreground">
            按时间倒序 · 悬停查看完整时间
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loading || !activities ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-1 py-2">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-2 pt-0.5">
                    <Skeleton className="h-4 w-full max-w-xs" />
                    <Skeleton className="h-3 w-full max-w-[220px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {activities.map((a) => (
                <ActivityRow key={a.id} item={a} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageFade>
  );
}
