"use client";

import { ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const titleByPath: Record<string, string> = {
  "/m": "首页",
  "/m/login": "登录",
  "/m/register": "注册",
  "/m/account": "我的",
  "/m/about": "关于",
  "/m/docs": "文档",
};

export function H5Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const title = (pathname && titleByPath[pathname]) || "H5";

  return (
    <div className="flex min-h-dvh flex-col [--h5-header:3.5rem]">
      <header
        data-h5-header
        className="sticky top-0 z-50 flex h-[var(--h5-header)] shrink-0 items-center gap-2 border-b border-border/70 bg-card/90 px-3 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/75"
        style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
      >
        <div className="flex w-10 shrink-0 justify-start">
          {pathname !== "/m" ? (
            <Button variant="ghost" size="icon" className="h-11 w-11 touch-manipulation" asChild aria-label="返回移动端首页">
              <Link href="/m">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[15px] font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex w-10 shrink-0 items-center justify-end gap-1 sm:w-auto sm:min-w-[10rem]">
          <ThemeToggle />
          {status === "loading" ? <div className="h-9 w-9 shrink-0 rounded-full bg-muted/80 animate-pulse" aria-hidden /> : null}
          {status !== "loading" && session?.user ? (
            <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-full p-0 touch-manipulation" asChild aria-label="个人中心">
              <Link href="/m/account">
                <Avatar className="h-9 w-9 border border-border/60">
                  <AvatarImage src={session.user.image ?? undefined} alt="" />
                  <AvatarFallback className="text-xs font-medium">
                    {session.user.email?.slice(0, 2).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          ) : null}
          {status !== "loading" && !session?.user ? (
            <Button variant="outline" size="sm" className="h-9 touch-manipulation px-2.5 text-xs" asChild>
              <Link href="/m/login">
                <LogIn className="mr-1 h-3.5 w-3.5" />
                登录
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      <main
        className="flex-1 bg-[hsl(var(--surface-base))]"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card/40 px-4 py-3 text-center text-[11px] text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:text-primary hover:underline">
          电脑版网站
        </Link>
        <span className="mx-2 text-border">·</span>
        <span>独立 H5 /m</span>
      </footer>
    </div>
  );
}
