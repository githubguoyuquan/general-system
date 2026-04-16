import Link from "next/link";
import { ArrowLeft, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** 文档类页面同样适合 ISR：降低 TTFB，更新频率由 revalidate 控制 */
export const revalidate = 7200;

const items = [
  { title: "热配置", body: "getSysConfig / getSysConfigParsed + 管理后台实时读写" },
  { title: "冷配置", body: "getColdConfig（.env，修改后需重启进程）" },
  { title: "功能开关", body: "app.features + isFeatureEnabled 统一读取" },
];

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="-ml-2 mb-8 gap-1 transition-all duration-300" asChild>
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>
      </Button>

      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <BookMarked className="h-5 w-5" />
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">文档占位（ISR）</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            索引关键模块职责，便于新成员与多项目复用时快速对齐。
          </p>
        </div>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-1">
        {items.map((item) => (
          <li key={item.title}>
            <Card className="border-border/80 shadow-card transition-all duration-300 hover:border-primary/20 hover:shadow-card-md">
              <CardHeader>
                <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{item.body}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
