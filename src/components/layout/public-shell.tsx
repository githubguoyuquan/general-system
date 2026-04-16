"use client";

import { Bell, BookOpen, Info, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/layout/user-menu";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/75 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/65">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="mr-1 flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground transition-all duration-300 hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15">
              GS
            </span>
            <span className="hidden sm:inline">通用系统</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" size="sm" className="transition-all duration-300" asChild>
              <Link href="/docs">
                <BookOpen className="mr-1.5 h-4 w-4 opacity-70" />
                文档
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="transition-all duration-300" asChild>
              <Link href="/about">
                <Info className="mr-1.5 h-4 w-4 opacity-70" />
                关于
              </Link>
            </Button>
          </nav>

          <div className="mx-auto hidden min-w-[200px] max-w-md flex-1 px-2 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                readOnly
                placeholder="搜索（占位，可接 Command-K）"
                className="h-9 cursor-default border-border/80 bg-background/80 pl-9 shadow-sm"
                aria-hidden
                tabIndex={-1}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 shrink-0 transition-all duration-300 hover:bg-accent"
              aria-label="通知"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive shadow-sm ring-2 ring-card" />
            </Button>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
