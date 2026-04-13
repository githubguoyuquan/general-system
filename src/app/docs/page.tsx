import Link from "next/link";

/** 文档类页面同样适合 ISR：降低 TTFB，更新频率由 revalidate 控制 */
export const revalidate = 7200;

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-4">
      <Link href="/" className="text-sm text-muted-foreground underline">
        返回首页
      </Link>
      <h1 className="text-3xl font-bold">文档占位（ISR）</h1>
      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
        <li>热配置：getSysConfig / getSysConfigParsed + 管理后台</li>
        <li>冷配置：getColdConfig（.env，重启生效）</li>
        <li>功能开关：app.features + isFeatureEnabled</li>
      </ul>
    </main>
  );
}
