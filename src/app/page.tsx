import Link from "next/link";
import { auth } from "@/lib/auth";
import { HOT_CONFIG } from "@/lib/config-keys";
import { getSysConfigParsed } from "@/lib/sys-config";
import { isFeatureEnabled } from "@/lib/features";

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

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{siteName}</h1>
      {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      <p className="text-muted-foreground">Next.js 15 App Router · Auth.js · Prisma 配置中心 · 统一 API 响应</p>
      <ul className="list-disc pl-5 text-sm space-y-2">
        <li>
          <Link className="underline" href="/login">
            登录
          </Link>
        </li>
        {registerOpen && showRegisterNav ? (
          <li>
            <Link className="underline" href="/register">
              注册
            </Link>
          </li>
        ) : null}
        <li>
          <Link className="underline" href="/about">
            关于（ISR）
          </Link>
        </li>
        <li>
          <Link className="underline" href="/docs">
            文档（ISR）
          </Link>
        </li>
        {session?.user?.role === "admin" ? (
          <>
            <li>
              <Link className="underline" href="/admin/dashboard">
                管理 · 统计看板
              </Link>
            </li>
            <li>
              <Link className="underline" href="/admin/crud">
                管理 · 用户 CRUD
              </Link>
            </li>
            <li>
              <Link className="underline" href="/admin/advanced-form">
                管理 · 复杂表单
              </Link>
            </li>
            <li>
              <Link className="underline" href="/admin/settings">
                管理 · 系统配置
              </Link>
            </li>
          </>
        ) : null}
        {session?.user ? (
          <li>
            <Link className="underline" href="/account">
              个人中心
            </Link>
          </li>
        ) : null}
      </ul>
      {process.env.NODE_ENV === "development" && !session ? (
        <p className="text-xs text-muted-foreground">演示管理员：admin@example.com / Admin123!（仅开发环境显示）</p>
      ) : null}
    </main>
  );
}
