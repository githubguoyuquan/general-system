import { ChevronRight, Info, LayoutDashboard, BookOpen, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { HOT_CONFIG } from "@/lib/config-keys";
import { isFeatureEnabled } from "@/lib/features";
import { getSysConfigParsed } from "@/lib/sys-config";

export default async function MHomePage() {
  const session = await auth();
  let siteName = "通用系统模板";
  let subtitle: string | null = null;
  let registerOpen = false;
  let showRegisterNav = false;

  try {
    const n = await getSysConfigParsed<string>(HOT_CONFIG.SITE_NAME);
    if (n) siteName = n;
    subtitle = await getSysConfigParsed<string>("site.subtitle");
    registerOpen = (await getSysConfigParsed<boolean>(HOT_CONFIG.AUTH_REGISTER_OPEN)) === true;
    showRegisterNav = await isFeatureEnabled("showRegisterNav");
  } catch {
    /* ignore */
  }

  type NavIcon = typeof BookOpen;
  const tiles: {
    href: string;
    title: string;
    subtitle: string;
    icon: NavIcon;
  }[] = [
    ...(registerOpen && showRegisterNav
      ? [{ href: "/m/register", title: "注册", subtitle: "新账号", icon: UserPlus }]
      : []),
    { href: "/m/about", title: "关于", subtitle: "ISR · 图示", icon: Info },
    { href: "/m/docs", title: "文档", subtitle: "索引与模块", icon: BookOpen },
  ];

  if (session?.user?.role === "admin") {
    tiles.unshift({
      href: "/m/admin/dashboard",
      title: "管理后台（H5）",
      subtitle: "移动端独立后台壳",
      icon: LayoutDashboard,
    });
  }

  return (
    <div className="px-4 pt-6">
      <section className="rounded-2xl border border-primary/15 bg-gradient-to-br from-card via-card to-primary/[0.04] px-5 py-6 shadow-card">
        <p className="text-[11px] font-medium uppercase tracking-wider text-primary/80">移动端站</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{siteName}</h2>
        {subtitle ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground/95">
          本页为独立的 H5 导航与版面，不依赖桌面首页的网格与顶栏适配。
        </p>
      </section>

      <nav className="mt-8 space-y-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm" aria-label="移动主导航">
        {!session?.user ? (
          <Link
            href="/m/login"
            className="flex min-h-[3.75rem] touch-manipulation items-center gap-4 border-b border-border/70 px-4 py-4 active:bg-muted/70"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <LogIn className="h-[1.35rem] w-[1.35rem]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium leading-tight">登录</p>
              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">凭证登录 · OAuth 环境与 Web 相同</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ) : null}

        {session?.user ? (
          <Link
            href="/m/account"
            className="flex min-h-[3.75rem] touch-manipulation items-center gap-4 border-b border-border/70 px-4 py-4 active:bg-muted/70"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border/80">
              <span className="text-sm font-semibold">{session.user.email?.slice(0, 2).toUpperCase() ?? "ME"}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium leading-tight">我的</p>
              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{session.user.email ?? "已登录"}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ) : null}

        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="flex min-h-[3.75rem] touch-manipulation items-center gap-4 border-b border-border/70 px-4 py-4 last:border-b-0 active:bg-muted/70"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Icon className="h-[1.35rem] w-[1.35rem]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-tight">{t.title}</p>
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{t.subtitle}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          );
        })}
      </nav>

      {process.env.NODE_ENV === "development" && !session ? (
        <p className="mt-6 rounded-xl border border-dashed border-border/80 bg-muted/30 px-3 py-3 text-[11px] leading-relaxed text-muted-foreground">
          开发演示：<span className="font-mono text-foreground">admin@example.com</span> / Admin123!
        </p>
      ) : null}
    </div>
  );
}
