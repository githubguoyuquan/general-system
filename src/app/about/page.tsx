import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * ISR（增量静态再生）：内容不常变时减少 SSR 压力，到期后后台按需重新生成。
 * 文档：https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
 */
export const revalidate = 3600;

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="-ml-2 mb-8 gap-1 transition-all duration-300" asChild>
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">关于（ISR 示例）</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          本页设置 <code className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-xs">revalidate = 3600</code>
          ，约每小时可后台再验证一次静态片段。
        </p>
      </div>

      <Card className="mt-10 overflow-hidden border-border/80 shadow-card transition-shadow duration-300 hover:shadow-card-md">
        <div className="relative aspect-[2/1] w-full max-w-2xl border-b border-border/60">
          <Image
            src="https://picsum.photos/seed/general-system/800/400"
            alt="演示配图（强制使用 next/image）"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority={false}
          />
        </div>
        <CardHeader>
          <CardTitle className="text-lg">静态与再验证</CardTitle>
          <CardDescription>适合内容更新不频繁的说明页、着陆页与文档入口。</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          与完全静态导出不同，ISR 允许在流量到达时按需刷新，兼顾性能与新鲜度。
        </CardContent>
      </Card>
    </main>
  );
}
