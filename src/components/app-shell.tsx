"use client";

import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * 全站顶栏：主题切换等全局控件（放在 Client 边界内）
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-end gap-3 px-4 md:px-6">
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  );
}
