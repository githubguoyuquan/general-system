import Link from "next/link";

const nav = [
  { href: "/admin/dashboard", label: "统计看板" },
  { href: "/admin/crud", label: "用户 CRUD" },
  { href: "/admin/advanced-form", label: "复杂表单" },
  { href: "/admin/settings", label: "系统配置" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium">
            返回首页
          </Link>
          <span className="text-sm text-muted-foreground">管理后台</span>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="underline underline-offset-4 hover:text-foreground text-muted-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
