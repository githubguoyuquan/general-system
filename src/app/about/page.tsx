import Image from "next/image";
import Link from "next/link";

/**
 * ISR（增量静态再生）：内容不常变时减少 SSR 压力，到期后后台按需重新生成。
 * 文档：https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
 */
export const revalidate = 3600;

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <Link href="/" className="text-sm text-muted-foreground underline">
        返回首页
      </Link>
      <h1 className="text-3xl font-bold">关于（ISR 示例）</h1>
      <p className="text-muted-foreground text-sm">
        本页设置 <code className="rounded bg-muted px-1">revalidate = 3600</code>，约每小时可后台再验证一次静态片段。
      </p>
      <div className="relative aspect-[2/1] w-full max-w-2xl overflow-hidden rounded-xl border">
        <Image
          src="https://picsum.photos/seed/general-system/800/400"
          alt="演示配图（强制使用 next/image）"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 672px"
          priority={false}
        />
      </div>
    </main>
  );
}
