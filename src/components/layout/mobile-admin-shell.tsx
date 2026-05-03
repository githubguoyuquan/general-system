"use client";

import { ADMIN_NAV } from "@/config/admin-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  ChevronLeft,
  House,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const NAV = ADMIN_NAV.map((item) => ({
  ...item,
  href: item.href.replace(/^\/admin/, "/m/admin"),
}));

export function MobileAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const title =
    NAV.find((i) => pathname === i.href || pathname?.startsWith(`${i.href}/`))?.label ?? "后台";

  return (
    <div
      className="flex min-h-dvh flex-col bg-[hsl(var(--surface-base))] pb-[env(safe-area-inset-bottom)] text-foreground"
      style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
    >
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-card/92 px-3 shadow-sm backdrop-blur-md">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 touch-manipulation"
          aria-label="菜单"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">移动管理</p>
          <h1 className="truncate text-[15px] font-semibold leading-tight">{title}</h1>
        </div>
        <ThemeToggle />
        <UserMenu />
      </header>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[1px]"
            aria-label="关闭菜单"
            onClick={() => setOpen(false)}
          />
          <aside
            className="animate-in slide-in-from-left duration-200 fixed inset-y-0 left-0 z-[70] flex w-[min(20rem,calc(100vw-3rem))] flex-col border-r border-border bg-card shadow-xl"
            style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-3">
              <span className="text-sm font-semibold">菜单</span>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setOpen(false)}>
                关闭
              </Button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
              {NAV.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex min-h-[3rem] touch-manipulation items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-all",
                      active
                        ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15"
                        : "text-muted-foreground active:bg-muted/70"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "opacity-80")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="space-y-1 border-t border-border/60 p-2">
              <Link
                href="/m"
                className="flex min-h-[2.85rem] items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors active:bg-muted/70"
              >
                <House className="h-4 w-4 shrink-0" />
                移动站首页 /m
              </Link>
              <Link
                href="/admin/dashboard"
                className="flex min-h-[2.85rem] items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors active:bg-muted/70"
              >
                <ArrowLeftRight className="h-4 w-4 shrink-0" />
                切换到桌面后台
              </Link>
              <Link
                href="/"
                className="flex min-h-[2.85rem] items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors active:bg-muted/70"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                前台网站
              </Link>
            </div>
          </aside>
        </>
      ) : null}

      <main className="flex-1 overflow-x-auto px-3 py-4 sm:px-4">{children}</main>
    </div>
  );
}
