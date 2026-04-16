import { ArrowRight, BookOpen, Info, LayoutDashboard, LogIn, UserCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { HOT_CONFIG } from "@/lib/config-keys";
import { getSysConfigParsed } from "@/lib/sys-config";
import { isFeatureEnabled } from "@/lib/features";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
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

  const links: {
    href: string;
    title: string;
    description: string;
    icon: typeof BookOpen;
    external?: boolean;
  }[] = [
    { href: "/login", title: "登录", description: "Credentials 与 OAuth 就绪后的一站式入口", icon: LogIn },
    ...(registerOpen && showRegisterNav
      ? [{ href: "/register", title: "注册", description: "受热配置控制的自助开户", icon: UserPlus }]
      : []),
    { href: "/about", title: "关于", description: "ISR 与工程约定说明", icon: Info },
    { href: "/docs", title: "文档", description: "配置中心与功能开关索引", icon: BookOpen },
  ];

  if (session?.user?.role === "admin") {
    links.push({
      href: "/admin/dashboard",
      title: "管理后台",
      description: "看板、CRUD、复杂表单与系统配置",
      icon: LayoutDashboard,
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{siteName}</h1>
        {subtitle ? <p className="text-base leading-relaxed text-muted-foreground">{subtitle}</p> : null}
        <p className="text-sm leading-relaxed text-muted-foreground">
          Next.js 15 · Auth.js · Prisma 配置中心 · 统一 API 响应 — 可作为多项目共用的商业级 UI 基座。
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} className="group block h-full">
                <Card className="h-full border-border/70 shadow-card transition-all duration-300 hover:border-primary/25 hover:shadow-card-md">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="mt-1.5">{item.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          );
        })}
        {session?.user ? (
          <li>
            <Link href="/account" className="group block h-full">
              <Card className="h-full border-border/70 shadow-card transition-all duration-300 hover:border-primary/25 hover:shadow-card-md">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground ring-1 ring-border/80 transition-transform duration-300 group-hover:scale-105">
                      <UserCircle className="h-5 w-5" aria-hidden />
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">个人中心</CardTitle>
                    <CardDescription className="mt-1.5">资料、安全与通知偏好</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ) : null}
      </ul>

      {process.env.NODE_ENV === "development" && !session ? (
        <p className="mt-10 max-w-xl rounded-lg border border-dashed border-border/80 bg-card/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground shadow-sm">
          演示管理员：<span className="font-mono text-foreground">admin@example.com</span> / Admin123!（仅开发环境显示）
        </p>
      ) : null}

      {!session ? (
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild className="transition-all duration-300">
            <Link href="/login">前往登录</Link>
          </Button>
          {registerOpen && showRegisterNav ? (
            <Button variant="outline" asChild className="transition-all duration-300">
              <Link href="/register">注册账号</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
